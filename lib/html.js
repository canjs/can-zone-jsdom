var JSDOM = require("jsdom").JSDOM;
var once = require("once");

module.exports = function(pageHTML){
	return function(data){
		var setupDOM = once(function(){
			/*var zoneRun = this.run;
			var runFn = runCallback.bind(null, pageHTML);
			this.run = function(){
				return zoneRun.call(this, runFn);
			}.bind(this);*/

			var opts = {
				resources: "usable",
				runScripts: "dangerously"
			};

			console.log("BEFORE");
			data.window = new JSDOM(pageHTML, opts).window;
			console.log("AFTER");
		});

		return {
			beforeTask: function(){
				setupDOM();
			}
		};
	};
};
