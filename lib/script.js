var fs = require("fs");
var got = require("got");
var path = require("path");
var vm = require("vm");

class Script {
	constructor(request, script, options) {
		this.src = script.src;
		this.fullPath = null;
		this.code = script.textContent;

		// YUCK! Find a better way to signal scripts that shouldn't run.
		this.runScript = !script.dataset.streamurl;

		this.options = options;
		this.requestUrl = request.url;
		this.loadDeferred = new Deferred();
	}

	load() {
		let url = this.src;
		if(url) {
			if(/https?:\/\//.test(url)) {
				this.fullPath = url;
				got(url).then(resp => this.loadDeferred.resolve(resp.body),
					this.loadDeferred.reject);
			} else {
				let pth = path.join(this.options.root, this.requestUrl, url);
				this.fullPath = pth;
				fs.readFile(pth, "utf8", (err, code) => {
					if(err) {
						this.loadDeferred.reject(err);
					} else {
						this.loadDeferred.resolve(code);
					}
				});
			}
		} else {
			this.loadDeferred.resolve(this.code);
		}
	}

	_run() {
		if(!this.runScript) return Promise.resolve();

		return this.loadDeferred.promise.then(code => {
			var runnable = `(function(){
				${code}
			})();`;

			var sandbox = global;
			vm.createContext(sandbox);
			vm.runInContext(runnable, sandbox);
		});
	}

	loadAndExecute() {
		return this._run();
	}
}

module.exports = Script;

function Deferred() {
	this.promise = new Promise((resolve, reject) => {
		this.resolve = resolve;
		this.reject = reject;
	});
}
