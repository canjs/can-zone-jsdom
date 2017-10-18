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

				// YUCK! Find a better way to signal scripts that shouldn't run.
				var runScript = !script.dataset.streamurl;

				if(runScript) {
					vm.runInThisContext(`(function(){
						${code}
					})()`, fn);
				}
			});
		}

		return {
			created: function(){
				var run = this.run;
				// If executeScripts is turned off, use a noop as the run function.
				var runFn = options.executeScripts === false ? Function.prototype :
					executeScripts;
				this.run = function(passedInRun){
					return run.call(this, function(){
						runFn();
						if(passedInRun) {
							return passedInRun.apply(this, arguments);
						}
					});
				};
			}
		};
	};
};
