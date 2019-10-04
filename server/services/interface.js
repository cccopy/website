var axios = require('axios');
var _ = require('lodash');
var md5 = require('md5');
var api = require('../config/constants.json').api;
var utils = require('./utils');

var axiosIns = axios.create({
	baseURL: api.base,
	timeout: api.timeout,
	headers: { "Authorization": "Bearer " + api.token }
});

function appendContainsInArray(paramObj, field, value){
	// single case
	paramObj.append(field + "_contains", "[" + value + "]");
	// multiple case
	// first
	paramObj.append(field + "_contains", "[" + value + ",");
	// middle
	paramObj.append(field + "_contains", "," + value + ",");
	// last
	paramObj.append(field + "_contains", "," + value + "]");
}

function reduceUser(userObj){
	userObj.favorites = _.map(userObj.favorites, fav => fav.id);
	return userObj;
}

module.exports = {
	validUser: function(email, password){
		return new Promise(function(resolve, reject){
			axiosIns.get("clients", {
				params: {
					email: email,
					pw: md5(password)
				}
			})
			.then(function(response){
				const users = response.data;
				if (users && users.length == 1) {
					resolve(reduceUser(users[0]));
				} else {
					reject("email or password is not correct.");
				}
			})
			.catch( err => { reject(err); });
		});
	},
	getUserById: function(id){
		return axiosIns.get("clients/" + id).then(response => reduceUser(response.data));
	},
	getItems: function(query){
		var params = { _limit: -1, itemType: "normal" };
		query = query || {};
		query._filters = { "additionType": "isEmpty" };
		if (typeof query.offset !== "undefined") params._start = query.offset;
		if (typeof query.limit !== "undefined") params._limit = query.limit;
		if (typeof query.sort !== "undefined") params._sort = query.sort;
		return axiosIns.get("items", { params: params })
			.then(function(response){
				let results = response.data;
				if ( !_.isEmpty(query._filters) ) {
					// OR
					let props = _.keys(query._filters);
					results = _.filter(results, result => {
						for(let p = 0, plen = props.length; p < plen; p++) {
							let k = props[p];
							if ( _[query._filters[k]](result[k]) ) return true;
						}
					});
				}
				return results;
			});
	},
	getItemsByTag: function(query){
		let params = new URLSearchParams();
		// default
		params.set("itemType", "normal");
		params.set("_limit", -1);
		query = query || {};
		if (typeof query.offset !== "undefined") params.set("_start", query.offset);
		if (typeof query.limit !== "undefined") params.set("_limit", query.limit);
		if ( Array.isArray(query.tags) ) {
			query.tags.forEach(tag => { appendContainsInArray(params, "keywords", tag) });
		} 
		// params.keywords_contains = query.tags;
		return axiosIns.get("items", { params: params }).then(response => response.data);
	},
	getItemsCountByTag: function(query){
		let params = new URLSearchParams();
		// default
		params.set("itemType", "normal");
		params.set("_limit", -1);
		if ( Array.isArray(query.tags) ) {
			query.tags.forEach(tag => { appendContainsInArray(params, "keywords", tag) });
		}
		return axiosIns.get("items/count", { params: params }).then(response => response.data);
	},
	getItemsByIds: function(ids){
		let params = new URLSearchParams();
		// default
		params.set("itemType", "normal");
		params.set("_limit", -1);
		if ( Array.isArray(ids) && ids.length ) {
			_.each(ids, id => { params.append("id_in", id); });
			return axiosIns.get("items", { params: params }).then(response => response.data);
		}
		return Promise.resolve([]);
	},
	getItem: function(id){
		var params = { _limit: -1, itemType: "normal", id: id };
		// var params = { itemType: "normal" };
		if (typeof id === "undefined" || isNaN(id)) return Promise.reject("[getItem] id is invalid.");
		return axiosIns.get("items", { params: params }).then(
			response => {
				let items = response.data;
				return items.length ? items[0] : null;
			}
		);
	},
	getKeywords: function(){
		var params = { _limit: -1 };
		return axiosIns.get("keywords", { params: params }).then(response => response.data);
	},
	getAdditions: function(){
		var params = { _limit: -1, itemType: "addition" };
		return axiosIns.get("items", { params: params }).then(response => response.data);
	},
	updateUserFavorites: function(userId, ids){
		let params = { favorites: ids || [] };
		return axiosIns.put("clients/" + userId, params ).then(response => reduceUser(response.data));
	},
	// not debug yet
	createOrder: async function(userId, cart){
		let cloneCart = _.cloneDeep(cart);
		let masters = _.filter(cloneCart, c => !c.pid);
		let additions = _.filter(cloneCart, c => !!c.pid);

		let advance = _.sum(_.map(masters, "advancePayment")) + _.sum(_.map(additions, "price"));
		let final = _.sum(_.map(masters, "finalPayment"));
		
		// create order 
		let contFormat = utils.dateToContinueFormat(new Date());
		let orderSerial = "O" + userId + (additions.length ? "A" : "") + contFormat;
		let resOrder = await axiosIns.post("orders", {
			serialNumber: orderSerial,
			status: "未付款",
			ownClient: userId,
			advancePayment: advance,
			finalPayment: final
		});
		
		// cache order id for convinent
		_.each(cloneCart, c => { c.orderId = resOrder.id } );

		// create details (master)
		_.each(masters, async c => {
			let masterDetail = await axiosIns.post("orderdetails", {
				status: "等待審核素材",
				ownOrder: c.orderId,
				item: c.id
			});
			c.detailId = masterDetail.id;
			_.each(_.filter(additions, ad => ad.pid == c.id), child => { child.pdetail = c.detailId; });
		});

		// create details (child)
		_.each(additions, async c => {
			let childDetail = await axiosIns.post("orderdetails", {
				ownOrder: c.orderId,
				item: c.id
				parentDetail: c.pdetail
			});
			c.detailId = childDetail.id;
		});

		// update order with linking
		await axiosIns.put("orders/" + resOrder.id, {
			details: _.map(cloneCart, "detailId")
		});
	}
};
