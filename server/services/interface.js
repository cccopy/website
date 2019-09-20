var axios = require('axios');
var _ = require('lodash');
var md5 = require('md5');
var api = require('../config/constants.json').api;

var axiosIns = axios.create({
	baseURL: api.base,
	timeout: api.timeout,
	headers: { "Authorization": "Bearer " + api.token }
});

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
					resolve(users[0]);
				} else {
					reject("email or password is not correct.");
				}
			})
			.catch( err => { reject(err); });
		});
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
		if (typeof query.limit !== "undefined") params.set("_limit", query.limit);
		if ( Array.isArray(query.tags) ) {
			query.tags.forEach(tag => {
				// single case
				params.append("keywords_contains", "[" + tag + "]");
				// multiple case
				// first
				params.append("keywords_contains", "[" + tag + ",");
				// middle
				params.append("keywords_contains", "," + tag + ",");
				// last
				params.append("keywords_contains", "," + tag + "]");
			});
		} 
		// params.keywords_contains = query.tags;
		return axiosIns.get("items", { params: params }).then(response => response.data);
	},
	getItem: function(id){
		var params = { itemType: "normal" };
		if (typeof id === "undefined" || isNaN(id)) return Promise.reject("[getItem] id is invalid.");
		return axiosIns.get("items/" + id).then(response => response.data);
	},
	getKeywords: function(){
		var params = { _limit: -1 };
		return axiosIns.get("keywords", { params: params }).then(response => response.data);
	}
};
