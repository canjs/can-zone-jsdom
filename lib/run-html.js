var fs = require("fs");
var path = require("path");
var vm = require("vm");

module.exports = function(request, options){
	return function(data){
		function executeScripts() {
			var doc = data.document;
			var scripts = Array.from(doc.getElementsByTagName("script"));

			scripts.forEach(function(script){
				var code, fn;
				if(script.src) {
					fn = path.join(options.root, request.url, script.src);
					code = fs.readFileSync(fn, "utf8");
				} else {
					code = script.textContent;
				}

				vm.runInThisContext(code, fn);
			});
		}

		return {
			created: function(){
				var run = this.run;
				this.run = function(){
					return run.call(this, executeScripts);
				};
			}
		};
	};
};
