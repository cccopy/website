
const interface = require('./interface');

const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;

module.exports = {
	getKeywordsMap: async function(){
		let keywords = await interface.getKeywords();
		let resMap = {};
		keywords.forEach( key => {
			resMap[key.id] = key;
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
	}
};
