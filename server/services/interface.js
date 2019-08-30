var axios = require('axios');
var _ = require('lodash');
var api = require('../config/constants.json').api;

var axiosIns = axios.create({
	baseURL: api.base,
	timeout: api.timeout,
	headers: { "Authorization": "Bearer " + api.token }
});

module.exports = {
	getItems: function(query){
		var params = { _limit: -1 };
		query = query || {};
		query._filters = { "additionType": "isEmpty" };
		if (typeof query.offset !== "undefined") params._start = offset;
		if (typeof query.limit !== "undefined") params._limit = limit;
		return new Promise(function(resolve, reject){
			axiosIns.get("items", { params: params })
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
					resolve(results);
				})
				.catch( err => reject(err) );
		});
	},
};
