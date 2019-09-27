/**
 * Routes for express app
 */
const express = require('express');
const path = require('path');
const url = require('url');
const _ = require('lodash');
const interface = require('../services/interface');
const utils = require('../services/utils');
const nunjucks = require('nunjucks');

const isDev = process.env.NODE_ENV === 'development';

const DEFAULT_AFTER_LOGIN = '/user/ugindex';

const ADDITION_IMAGE_MAP = {
    "精簡秒數": "/assets/images/img_bmSec.png",
    "英文字幕": "/assets/images/img_bmEng.png",
    "尺寸調整": "/assets/images/img_bmSize.png",
    "加購劇照": "/assets/images/img_bmPic.png",
    "毛帶全拿": "/assets/images/img_bmFlim.png"
};

const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

// route middleware to make sure a user is logged in
function loginRequired(req, res, next) {
    // if (isDev) return next();
    // if user is authenticated in the session, carry on
    // if(process.env.NODE_ENV === 'development' || req.isAuthenticated()) return toNext();    
    if(req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    let dest = '/auth/login?next=' + encodeURIComponent(req.originalUrl);
    req.session.redirectTo = dest;
    res.redirect(dest);
}

function checkReferer(req, path){
    let referer = req.headers.referer;
    let isValid = referer && url.parse(referer).pathname == path;
    return isValid;
}

module.exports = async function(app, passport) {

    let normalKeywords = await interface.getKeywords(),
        additionItems = await interface.getAdditions(),
        hotKeywords = [];

    let keywordsMap = utils.getPropMapObject(normalKeywords, "id");
    let keywordsWordMap = utils.getPropMapObject(normalKeywords, "word");

    let nunEnv = nunjucks.configure(app.get('views'), {
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

    nunEnv.addFilter("isGroupWith", function(cur, target){
        return cur.substring(0, target.length) == target;
    });

    (function renewHotKeys() {
        hotKeywords = utils.getRandom(Object.keys(keywordsMap), 3).map(id => keywordsMap[id].word);
        nunEnv.addGlobal("hotkeys", hotKeywords);
        setTimeout(renewHotKeys, 20000);
    })();

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

    function getSessionCartItem(item){
        return {
            id: item.id,
            title: item.title,
            price: item.price,
            urgentPrice: item.urgentPrice,
            customizePrice: item.customizePrice,
            advancePayment: item.price * 0.8,
            finalPayment: item.price * 0.2
        };
    }

    function getSessionAdditionItem(item, pid){
        return {
            pid: pid,
            id: item.id,
            title: item.title,
            price: item.price,
            type: item.additionType
        };
    }

    function getLayoutCartItems(cartlist){
        // find addition items
        var additionPidMap = utils.getPropMapArrayObject(
                cartlist.filter(item => !!item.pid), "pid");
        var normalItems = cartlist.filter(item => !item.pid);
        return _.map(normalItems, item => {
            let res = _.clone(item);
            res.additions = _.map(additionPidMap[item.id], additem => _.clone(additem));
            return res;
        });
    }

    function isItemInCart(item, cart, query){
        query = query || { id: item.id };
        var queryKeys = Object.keys(query);
        return cart
            .filter(m => {
                return queryKeys
                    .map(key => m[key] == item[key])
                    .reduce((acc, cur) => { return acc && cur; }, true);
            }).length > 0;
    }

    let additionDetails = (function(){
        let additionMap = utils.getPropMapArrayObject(additionItems, "title");
        let res = [];
        Object.keys(additionMap).forEach(addition => {
            res.push({
                title: addition,
                image: ADDITION_IMAGE_MAP[addition],
                details: additionMap[addition].map(detail => {
                    return {
                        id: detail.id,
                        type: detail.additionType,
                        price: detail.price
                    };
                })
            });
        });
        return res;
    })();

    let additionIdMap = utils.getPropMapObject(additionItems, "id");

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
    
    // =====================================
    // ITEMS ===============================
    // =====================================
    app.get('/items/:id', asyncHandler(async (req, res, next) => {
        const lookId = req.params.id;
        let item = await interface.getItem(lookId);
        if (item) {
            prepareDetailItem(item);

            let keywordRelateds = await interface.getItemsByTag({ tags: item.keywords });
            item.recommendProds = utils.getRandom(keywordRelateds, Math.min(keywordRelateds.length, 3) );
            item.recommendProds.forEach(prepareDetailItem);

            res.render('product/detail', { 
                itemdetail: item, 
                additiondetail: additionDetails, 
                itemincart: isItemInCart(item, req.session.cart || [])
            });
        } else {
            next({ response: { status: 404, statusText: "Not Found" } })
        }
    }));

    app.get('/itemlist/', asyncHandler(async (req, res) => {
        const searchKey = req.query.s;
        let searchCount = 0;
        let limit = 5, items = [];
        if (searchKey) {
            let tag = keywordsWordMap[searchKey];
            if (tag) {
                items = await interface.getItemsByTag( { limit: limit, tags: [tag.id] } );
                searchCount = await interface.getItemsCountByTag( { tags: [tag.id] } );
            }
        } else {
            items = await interface.getItems( { limit: limit } );
        }
        let itemLength = items.length;
        items.forEach(prepareItemAllKey);
        res.render('product/list', { 
            items: items, 
            searchkey: searchKey, 
            searchcount: searchCount,
            hasmore: itemLength == limit, 
            nextidx: items.length
        });
    }));

    app.get('/ajax/items/more', asyncHandler(async (req, res, next) => {
        let offset = req.query.offset;
        let isValid = checkReferer(req, "/itemlist/");
        if ( isValid && !isNaN(offset = parseInt(offset)) ) {
            const searchKey = req.query.s;
            let limit = 5, moreitems = [];
            if ( searchKey ) {
                let tag = keywordsWordMap[searchKey];
                if (tag) {
                    moreitems = await interface.getItemsByTag( { offset: offset, limit: limit, tags: [tag.id] } );
                }
            } else {
                moreitems = await interface.getItems( { offset: offset, limit: limit } );
            }
            let moreLength = moreitems.length;
            moreitems.forEach(prepareItemAllKey);
            res.render('product/more', { 
                items: moreitems,
                searchkey: searchKey,
                hasmore: moreLength == limit,
                nextidx: offset + moreitems.length
            });
        } else next({ response: { status: 400, statusText: "Bad Request" } });
    }));

    // =====================================
    // AUTH ================================
    // =====================================
    app.get('/auth/login', asyncHandler(async (req, res) => {
        if ( req.isAuthenticated() ) {
            let dest = decodeURIComponent(req.query.next || DEFAULT_AFTER_LOGIN);
            req.session.redirectTo = dest;
            res.redirect( dest );
        } else {
            // render the page and pass in any flash data if it exists
            let message = req.flash('message');
            res.render('auth/login', { message: message, next: req.query.next || DEFAULT_AFTER_LOGIN });
        }
    }));

    app.post('/auth/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err || !user) return next(err);
            req.logIn(user, function(err) {
                if (err) return next(err);
                let dest = req.body.next || DEFAULT_AFTER_LOGIN;
                req.session.cart = req.session.cart || [];  // init
                req.session.redirectTo = dest;
                req.session.loginState = "loggedIn";
                return res.redirect(dest);
            });
        })(req, res, next);
    }, function(req, res, next){
        let failureDest = '/auth/login?next=' + encodeURIComponent(req.body.next || DEFAULT_AFTER_LOGIN);
        req.session.redirectTo = failureDest;
        res.redirect(failureDest);
    });

    app.get('/auth/logout', loginRequired, asyncHandler(async (req, res) => {
        let dest = "/";
        req.logout();
        req.session.redirectTo = dest;
        req.session.loginState = "loggedOut";
        res.redirect(dest);
    }));
    
    // =====================================
    // USER ================================
    // =====================================
    app.get('/user/ugindex', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/ugindex');
    }));

    app.get('/user/info', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/info');
    }));

    app.get('/user/like', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/like');
    }));

    app.get('/user/ecoupon', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/ecoupon');
    }));

    // =====================================
    // USER - CART =========================
    // =====================================
    app.get('/user/cart', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/cart', { cartitems: getLayoutCartItems(req.session.cart) } );
    }));
    app.get('/user/cart/confirm', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/cart/confirm');
    }));
    app.get('/user/cart/paying', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/cart/paying');
    }));
    app.get('/user/cart/payresult', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/cart/payresult');
    }));
    app.post('/ajax/cart/add', loginRequired, asyncHandler(async (req, res, next) => {
        let itemId = req.body.item;
        let isValid = checkReferer(req, "/items/" + itemId);
        let item;
        if (isValid && (item = await interface.getItem(itemId)) ) {
            let sessionCart = req.session.cart;
            if ( isItemInCart(item, sessionCart) ){
                res.send({ success: false, message: "已經加入囉", count: sessionCart.length });
            } else {
                sessionCart.push( getSessionCartItem(item) );
                res.send({ success: true, count: sessionCart.length });
            }
        } else next({ response: { status: 400, statusText: "Bad Request" } });
    }));

    app.post('/ajax/addition/add', loginRequired, asyncHandler(async (req, res, next) => {
        let itemId = req.body.item;
        let pitemId = req.body.pitem;
        let isValid = checkReferer(req, "/items/" + pitemId);
        let item;
        if ( isValid && (item = additionIdMap[itemId]) ) {
            let sessionCart = req.session.cart;
            let sessionAdditionItem = getSessionAdditionItem(item, pitemId);
            if ( isItemInCart(sessionAdditionItem, sessionCart, { pid: pitemId, id: itemId }) ) {
                res.send({ success: false, message: "已經加購囉", count: sessionCart.length });
            } else {
                sessionCart.push( sessionAdditionItem );
                res.send({ 
                    success: true, 
                    message: "已將 " + item.title + (item.additionType ? (" " + item.additionType) : "") + " 加入購物車",
                    count: sessionCart.length
                });
            }
        } else next({ response: { status: 400, statusText: "Bad Request" } });
    }));

    // =====================================
    // USER - ORDER ========================
    // =====================================
    app.get('/user/orders', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/orders');
    }));

    app.get('/user/promote', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/promote');
    }));

    app.get('/user/profit', loginRequired, asyncHandler(async (req, res) => {
        res.render('user/profit');
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
