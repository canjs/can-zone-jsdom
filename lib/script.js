var fs = require("fs");
var got = require("got");
var path = require("path");
var URL = require("url").URL;
var vm = require("vm");

const cache = new Map();
const httpExp = /https?:\/\//;

class Script {
	constructor(request, script, options) {
		this.src = script.src;
		this.fullPath = null;
		this.code = script.textContent;

		// YUCK! Find a better way to signal scripts that shouldn't run.
		this.runScript = !script.dataset.streamurl;

		this.options = options;
		this.root = options.root;
		this.rootIsRemote = httpExp.test(options.root);
		this.requestUrl = request.url;
		this.loadDeferred = new Deferred();
	}

	load() {
		let url = this.src;
		if(url) {
			if(cache.has(url)) {
				this.loadDeferred.resolve(cache.get(url));
				return;
			}

			if(this.rootIsRemote && !httpExp.test(url)) {
				url = new URL(url, this.root).toString();
			}

			if(httpExp.test(url)) {
				this.fullPath = url;

				got(url).then(resp => {
					this.loadDeferred.resolve(resp.body);
					cache.set(url, resp.body);
				}, this.loadDeferred.reject);
			} else {
				let pth = path.join(this.options.root, this.requestUrl, url);
				this.fullPath = pth;
				fs.readFile(pth, "utf8", (err, code) => {
					if(err) {
						this.loadDeferred.reject(err);
					} else {
						cache.set(url, code);
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
