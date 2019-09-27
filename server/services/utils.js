
const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;

module.exports = {
	getPropMapObject: function(arr, keyname){
		let resMap = {};
		arr.forEach(item => {
			resMap[item[keyname]] = item;
		});
		return resMap;
	},
	getPropMapArrayObject: function(arr, keyname){
		let resMap = {};
		arr.forEach(item => {
			if ( !resMap[item[keyname]] ) resMap[item[keyname]] = [];
			resMap[item[keyname]].push(item);
		});
		return resMap;
	},
	getYoutubeEmbedUrl: function(url){
        var match = url.match(youtubeRegExp);
        if (match && match[2].length == 11) {
        	return "https://www.youtube.com/embed/" + match[2];
        }
        return "";
	},
	getYoutubeThumbnailUrl: function(url){
		var match = url.match(youtubeRegExp);
        if (match && match[2].length == 11) {
        	return "https://img.youtube.com/vi/" + match[2] + "/0.jpg";
        }
        return "";
	},
	getRandom: function(arr, n) {
		var result = new Array(n),
			len = arr.length,
			taken = new Array(len);
		if (n > len)
			throw new RangeError("getRandom: more elements taken than available");
		while (n--) {
			var x = Math.floor(Math.random() * len);
			result[n] = arr[x in taken ? taken[x] : x];
			taken[x] = --len in taken ? taken[len] : len;
		}
		return result;
	}
};
