const JSDOM = require("jsdom").JSDOM;
const once = require("once");
const url = require("url");
const zoneRegister = require("can-zone/register");

module.exports = function(request){
	return function(data){
		const window = new JSDOM("<html></html>").window;
		window.location = url.parse(request.url, true);
		if(!window.location.protocol) {
			window.location.protocol = "http:";
		}

		if(request.headers && request.headers["accept-language"]) {
			window.navigator.language = request.headers["accept-language"];
		}

		return {
			globals: {
				window: window,
				document: window.document,
				location: window.location
			},
			created: function(){
				data.window = window;
				data.document = window.document;
				data.request = request;
				registerNode(window);
			},
			ended: function(){
				data.html = window.document.documentElement.outerHTML;
			}
		};
	};
};

// Calls to can-zone/register so that Node.prototype.addEventListener is wrapped.
// This only needs to happen once, ever.
var registerNode = once(function(window) {
	var oldNode = global.Node;
	global.Node = window.Node;
	zoneRegister();
	global.Node = oldNode;
});
