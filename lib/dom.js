var JSDOM = require("jsdom").JSDOM;

module.exports = function(data){
	return {
		created: function(){
			data.window = new JSDOM("<html></html>").window;
		}
	};
};
