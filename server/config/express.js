var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session      = require('express-session');
var flash    = require('connect-flash');
var path = require('path');
var utils = require('../services/utils');

module.exports = function (app, passport) {
	var node_env = process.env.NODE_ENV;
	var isProduction = node_env === 'production';

	const dateString = require('child_process').execSync('git log -1 --format=%ci').toString();
	const programStamp = utils.dateToContinueFormat(new Date(dateString));

	app.set('port', 5000);

	// X-Powered-By header has no functional value.
	// Keeping it makes it easier for an attacker to build the site's profile
	// It can be removed safely
	app.disable('x-powered-by');
	app.set('views', path.join(__dirname, '..', 'views'));
	app.set('case sensitive routing', true);
	app.set('view cache', false);
	app.set('view engine', 'njk');

	app.use(session({ 
		secret: '3EdCvFr$5TgBnHy^7Ujm', 
		resave: false,
		cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
		saveUninitialized: true
	})); // session secret  

	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	
	app.use(flash()); 

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); // for parsing application/x-www-form-urlencoded
	app.use(bodyParser.json({limit: '50mb'}));

	// common nunjucks properties
	app.use(function(req, res, next){
		res.locals.isDev = !isProduction;
		res.locals.isLoggedIn = req.isAuthenticated();
		// if ( res.locals.login ) {
		// 	res.locals.devices = req.user.cells || [];
		// 	res.locals.userid = req.user.id;
		// 	res.locals.username = req.user.name;
		// 	res.locals.currentpath = req.path;
		// }
		res.locals.currentpath = req.path;
		res.locals.isPjax = !!req.header('X-PJAX');
		res.locals.pjVersion = programStamp;
		if ( res.locals.isPjax ) {
			res.header('X-PJAX-Version', programStamp);
			if ( req.session.redirectTo ) {
				res.header('X-PJAX-URL', req.session.redirectTo);
				req.session.redirectTo = null;
			}
			if ( req.session.loginState == "loggedIn" ) {
				res.locals.toLoggedState = true;
				req.session.loginState = null;
			}
			if ( req.session.loginState == "loggedOut" ) {
				res.locals.toLogoutState = true;
				req.session.loginState = null;
			}
		} 
		if ( res.locals.isLoggedIn ) {
			res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
		}
		next();
	}); 

	if ( !isProduction ) {
		app.use('/assets', express.static(path.join(__dirname, '../..', 'assets')));
	}

	// I am adding this here so that the Heroku deploy will work
	// Indicates the app is behind a front-facing proxy,
	// and to use the X-Forwarded-* headers to determine the connection and the IP address of the client.
	// NOTE: X-Forwarded-* headers are easily spoofed and the detected IP addresses are unreliable.
	// trust proxy is disabled by default.
	// When enabled, Express attempts to determine the IP address of the client connected through the front-facing proxy, or series of proxies.
	// The req.ips property, then, contains an array of IP addresses the client is connected through.
	// To enable it, use the values described in the trust proxy options table.
	// The trust proxy setting is implemented using the proxy-addr package. For more information, see its documentation.
	// loopback - 127.0.0.1/8, ::1/128
	app.set('trust proxy', 'loopback');
	// Create a session middleware with the given options
	// Note session data is not saved in the cookie itself, just the session ID. Session data is stored server-side.
	// Options: resave: forces the session to be saved back to the session store, even if the session was never
	//                  modified during the request. Depending on your store this may be necessary, but it can also
	//                  create race conditions where a client has two parallel requests to your server and changes made
	//                  to the session in one request may get overwritten when the other request ends, even if it made no
	//                  changes(this behavior also depends on what store you're using).
	//          saveUnitialized: Forces a session that is uninitialized to be saved to the store. A session is uninitialized when
	//                  it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage
	//                  usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with
	//                  race conditions where a client makes multiple parallel requests without a session
	//          secret: This is the secret used to sign the session ID cookie.
	//          name: The name of the session ID cookie to set in the response (and read from in the request).
	//          cookie: Please note that secure: true is a recommended option.
	//                  However, it requires an https-enabled website, i.e., HTTPS is necessary for secure cookies.
	//                  If secure is set, and you access your site over HTTP, the cookie will not be set.
	// var sess = {
	//   resave: true,
	//   saveUninitialized: false,
	//   secret: secrets.sessionSecret,
	//   proxy: true, // The "X-Forwarded-Proto" header will be used.
	//   name: 'sessionId',
	//   // Add HTTPOnly, Secure attributes on Session Cookie
	//   // If secure is set, and you access your site over HTTP, the cookie will not be set
	//   cookie: {
	//     httpOnly: true,
	//     secure: false,
	//   },
	//   store: new MongoStore(
	//     {
	//       url: secrets.db,
	//       autoReconnect: true
	//     }
	//   )
	// };

	console.log('--------------------------');
	console.log('===> 😊  Starting Server . . .');
	console.log('===>  Environment: ' + node_env);
	if(isProduction) {
		console.log('===> 🚦  Note: In order for authentication to work in production');
		console.log('===>           you will need a secure HTTPS connection');
		// sess.cookie.secure = true; // Serve secure cookies
	}

	// app.use(session(sess));

};
