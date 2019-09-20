/**
 * Routes for express app
 */
var express = require('express');
var path = require('path');
// var utils = require('../services/utils');
var interface = require('../services/interface');
var utils = require('../services/utils');
var nunjucks = require('nunjucks');

var isDev = process.env.NODE_ENV === 'development';

const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

// route middleware to make sure a user is logged in
function loginRequired(req, res, next) {
    // if user is authenticated in the session, carry on
    // if(process.env.NODE_ENV === 'development' || req.isAuthenticated()) return toNext();    
    if(req.isAuthenticated()) return next();

    console.log("return to login");
    // if they aren't redirect them to the home page
    res.redirect('/login');
}

module.exports = async function(app, passport) {

    var nunEnv = nunjucks.configure(app.get('views'), {
        autoescape: true,
        watch: true,
        express: app
    });

    nunEnv.addFilter("youtubeEmbed", function(url){
        return utils.getYoutubeEmbedUrl(url);
    });

    nunEnv.addFilter("youtubeThumbnail", function(url){
        return utils.getYoutubeThumbnailUrl(url);
    });

    nunEnv.addFilter("locale", function(num){
        return Number(num).toLocaleString();
    });

    let keywordsMap = await utils.getKeywordsMap();

    function prepareItem(item){
        let urls = item.productUrls.filter(prod => prod.url);
        if ( urls.length ) item.mainUrl = urls[0].url;
        item.keywordLabels = item.keywords.slice(0, 3).map(id => keywordsMap[id].word );
    }

    function prepareItemAllKey(item){
        prepareItem(item);
        item.keywordLabels = item.keywords.map(id => keywordsMap[id].word );   
    }

    function prepareDetailItem(item){
        prepareItemAllKey(item);
        item.demoProds = item.productUrls.map(prod => {
            if ( prod.url ) {
                return { type: "youtube", thumbnail: utils.getYoutubeThumbnailUrl(prod.url), originUrl: prod.url };
            } else if ( prod.image ) {
                return { type: "image", thumbnail: prod.image.url, originUrl: prod.image.url };
            }
            return null;
        }).filter(demo => !!demo);
        item.highlightList = item.highlight.split("\r\n");
    }

    app.get('/', async (req, res) => { 
        let popularItems = await interface.getItems( { limit: 5 } );
        let newItems = await interface.getItems( { limit: 5, sort: "created_at:DESC" } );
        newItems.forEach(prepareItem);
        popularItems.forEach(prepareItem);
        res.render('index', { newitems: newItems, popularitems: popularItems } );
    });

    // =====================================
    // FOOTER ==============================
    // =====================================
    app.get('/about', (req, res) => { res.render('footer/about') });
    app.get('/terms', (req, res) => { res.render('footer/terms') });
    app.get('/privacy', (req, res) => { res.render('footer/privacy') });
    app.get('/descriptions', (req, res) => { res.render('footer/descriptions') });
    

    app.get('/items/:id', asyncHandler(async (req, res) => {
        const lookId = req.params.id;
        let item = await interface.getItem(lookId);
        prepareDetailItem(item);

        let keywordRelateds = await interface.getItemsByTag({ tags: item.keywords });
        item.recommendProds = utils.getRandom(keywordRelateds, Math.min(keywordRelateds.length, 3) );
        item.recommendProds.forEach(prepareDetailItem);
        
        res.render('product/detail', { itemdetail: item });
    }));

    app.get('/itemlist/', asyncHandler(async (req, res) => {
        let limit = 5;
        let items = await interface.getItems( { limit: limit } );
        let itemLength = items.length;
        items.forEach(prepareItemAllKey);
        res.render('product/list', { items: items, hasmore: itemLength == limit, nextidx: items.length });
    }));

    app.get('/ajax/items/more', asyncHandler(async (req, res) => {
        let offset = req.query.offset;
        let referer = req.headers.referer;
        let isValid = referer && referer.slice( -("/itemlist/".length) ) == "/itemlist/";
        if ( isValid && !isNaN(offset = parseInt(offset)) ) {
            let limit = 5;
            let moreitems = await interface.getItems( { offset: offset, limit: limit } );
            let moreLength = moreitems.length;
            moreitems.forEach(prepareItemAllKey);
            res.render('product/more', { items: moreitems, hasmore: moreLength == limit, nextidx: offset + moreitems.length });
        } else throw new Error({ response: { status: 400, statusText: "Bad Request" } });
    }));

    // show the login form
    // app.get('/login', function(req, res) {
    //     // render the page and pass in any flash data if it exists
    //     res.render('login', { message: req.flash('message') } );
    // });

    // process the login form
    // app.post('/login', passport.authenticate('local-login', {
    //     successRedirect : '/', // redirect to the secure profile section
    //     failureRedirect : '/login', // redirect back to the signup page if there is an error
    //     failureFlash : false // allow flash messages
    // }));

    // =====================================
    // LOGIN REQUIRED ======================
    // =====================================
    // show the logout view
    // app.get('/logout', loginRequired, function(req, res) {
    //     req.logout();
    //     res.redirect('/');
    // });

    app.use(function(err, req, res, next){
        if (err.response) {
            res.status(err.response.status).send(err.response.statusText);
        } else {
            res.status(500).send(err.toString());
        }
    });
};
