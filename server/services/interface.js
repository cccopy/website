var axios = require('axios');
var _ = require('lodash');
var md5 = require('md5');
var api = require('../config/constants.json').api;
var utils = require('./utils');

const cities = require('../static/city-county.json');
const industries = require('../static/industry-category.json');
const jobs = require('../static/job-title.json');

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

	// =================================
	// === Getters =====================
	// =================================
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
	getOrdersByUser: async function(userId){
		let user = await this.getUserById(userId);
		return user.orders;
	},
	findOrderByUserSerialRule: function(userId, serial, ruleFn) {
		return this.getUserById(userId)
			.then(user => _.find(_.filter(user.orders, ruleFn), { serialNumber: serial }) );
	},
	getOrderdetails: function(orderId){
		return axiosIns.get("orders/" + orderId).then(response => response.data.details);
	},
	getOrderdetailsDeep: function(orderId){
		var params = { _limit: -1, ownOrder_in: orderId };
		return axiosIns.get("orderdetails", { params: params }).then(
			response => {
				let data = response.data;
				data.forEach(d => {	// crop properties
					d.item = d.item.id;
					d.ownOrder = d.ownOrder.id;
					if ( d.parentDetail ) d.parentDetail = d.parentDetail.id;
				});
				return data;
			});
	},
	getCityCounty: function(){
		let res = { cities: [], counties: [] };
		_.each(cities, city => {
			res.cities.push({ name: city.CityName });
			_.each(city.AreaList || [], county => {
				res.counties.push({
					name: county.AreaName,
					city: city.CityName
				});
			});
		});
		return Promise.resolve(res);
	},
	getIndustryCategory: function(){
		return Promise.resolve(industries);
	},
	getJobTitle: function(){
		return Promise.resolve(jobs);
	},

	// =================================
	// === Updates =====================
	// =================================
	updateUser: function(userId, prop){
		return axiosIns.put("clients/" + userId, prop ).then(response => reduceUser(response.data));
	},
	updateUserFavorites: function(userId, ids){
		let params = { favorites: ids || [] };
		return axiosIns.put("clients/" + userId, params ).then(response => reduceUser(response.data));
	},
	updateOrderStatus: function(orderId, status){
		let params = { status: status };
		return axiosIns.put("orders/" + orderId, params ).then(response => response.data);
	},
	makeOrderToPaied: async function(orderId){
		return await this.updateOrderStatus(orderId, "已付款" );
	},
	makeOrderToCancel: async function(orderId, cancelInfo){
		let params = { status: "已取消", cancelInfo: cancelInfo };
		return axiosIns.put("orders/" + orderId, params ).then(response => response.data);
	},
	makeOrderToCompleted: async function(orderId){
		return await this.updateOrderStatus(orderId, "已完成" );
	},
	updateOrderRating: async function(orderId, ratingInfo){
		let params = { ratingInfo: ratingInfo };
		return axiosIns.put("orders/" + orderId, params ).then(response => response.data);
	},

	// =================================
	// === Creations ===================
	// =================================
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

		const resOrderData = resOrder.data;
		const resOrderId = resOrderData.id;
		
		// create details (master)
		_.each(masters, async c => {
			let masterDetail = await axiosIns.post("orderdetails", {
				status: "等待審核素材",
				ownOrder: resOrderId,
				item: c.id,
				itemInfo: _.omit(c, ["id", "pid"])
			});

			const masterDetailId = masterDetail.data.id;

			_.each(
				_.filter(additions, ad => ad.pid == c.id),
				async child => { 
					let childDetail = await axiosIns.post("orderdetails", {
						ownOrder: resOrderId,
						item: child.id,
						parentDetail: masterDetailId,
						itemInfo: _.omit(child, ["id", "pid"])
					});
				}
			);
		});

		return resOrderData;
	}
};
