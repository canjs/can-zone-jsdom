var Script = require("./script.js");

module.exports = function(request, options){
	return function(data){
		var keys, globals = new Set();

		function executeScripts() {
			var doc = data.document;
			var scripts = Array.from(doc.getElementsByTagName("script"));
			var queue = [];

			scripts.forEach(function(script){
				var s = new Script(request, script, options);
				s.load();
				queue.push(s);
			});

			executeOneAtATime(queue);
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
			},

			beforeTask: function() {
				keys = new Set(Object.keys(data.window));
				for(let key of globals) {
					global[key] = data.window[key];
				}
			},

			afterTask: function(){
				// Copy over any new keys to be globals.
				var newKeys = new Set(Object.keys(data.window));
				for(let key of newKeys) {
					if(!keys.has(key)) {
						globals.add(key);
					}
				}
			}
		};
	};
};

function executeOneAtATime(queue) {
	if(!queue.length) {
		return Promise.resolve();
	}
	let script = queue.shift();
	return script.loadAndExecute().then(() => executeOneAtATime(queue));
}
