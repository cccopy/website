
const LocalStrategy   = require('passport-local').Strategy;
const interface = require('../services/interface');
const utils = require('../services/utils');
// const uuidv4 = require('uuid/v4');

// check login user: https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84
// https://github.com/manjeshpv/node-express-passport-mysql

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        done(null, id);
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            console.log("go passport");
            interface.validUser(email, password).then(
                function(user){
                    // console.log("login user:" + user);
                    // utils.setCookie(req.res, uuidv4(), 1000 * 60 * 60 * 24 * 7); // 1 week
                    done( null, user );
                },
                function(err){ 
                    console.log("here");
                    return done( null, false, req.flash('message', err) );
                }
            );
        })
    );

}; 