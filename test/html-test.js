var Zone = require("can-zone");
var requests = require("done-ssr/zones/requests");
var pushFetch = require("done-ssr/zones/push-fetch");
var pushImages = require("done-ssr/zones/push-images");

var dom = require("../lib/index");

var assert = require("assert");
var {
	createServer,
	Request,
	Response
} = require("./test-helpers");
var fs = require("fs");
var helpers = require("./dom-helpers");

var spinUpServer = function(cb){
	return createServer(8070, function(req, res){
		res.end(JSON.stringify(["eat", "sleep"]));
	})
	.then(server => {
		return cb().then(() => server.close());
	});
};

describe("SSR Zones - HTML", function(){
	describe("An app using fetch and PUSH", function(){
		var pageHTML = fs.readFileSync(__dirname + "/html/page.html", "utf8");

		before(function(){
			return spinUpServer(() => {
				var request = new Request();
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						// Overrides XHR, fetch
						requests(request),

						// Sets up a DOM
						dom(request, {
							root: __dirname + "/html",
							html: "page.html"
						}),

						pushFetch(response),
						pushImages(response, __dirname + "/basics")
					]
				});

				return zone.run();
			});
		});

		it("Includes the right HTML", function(){
			var dom = helpers.dom(this.zone.data.html);
			var ul = helpers.find(dom, node => node.nodeName === "UL");

			var first = ul.firstChild.firstChild.nodeValue;
			var second = ul.firstChild.nextSibling.firstChild.nodeValue;

			assert.equal(first, "eat", "got the first li");
			assert.equal(second, "sleep", "got the second li");
		});

		it("Data from the fetch requests was pushed", function(){
			var pushes = this.response.data.pushes;
			var [url, opts, data] = pushes[1];

			assert.equal(url, "/api/todos", "Todos api");

			var todos = JSON.parse(data[0].toString());
			assert.equal(todos[0], "eat");
			assert.equal(todos[1], "sleep");
		});

		it("Images from the request were pushed", function(){
			var pushes = this.response.data.pushes;
			var [url, opts, data] = pushes[0];

			assert.equal(url, "/images/cat.png");
			assert.ok(data.length, "Got the data too");
		});
	});

	describe("Multiple Requests", function(){
		function processRequest() {
			var request = new Request();
			var response = this.response = new Response();

			var zone = this.zone = new Zone({
				plugins: [
					// Overrides XHR, fetch
					requests(request),

					// Sets up a DOM
					dom(request, {
						root: __dirname + "/html",
						html: "page.html"
					}),

					pushFetch(response),
					pushImages(response, __dirname + "/basics")
				]
			});

			return zone.run();
		}

		it("It runs the client code in a non-global context", function(){
			return spinUpServer(() => {
				return processRequest.call(this)
					.then(() => processRequest.call(this));
			});
		});
	});

	describe("executeScripts: false doesn't run the scripts", function(){
		var pageHTML = fs.readFileSync(__dirname + "/html/page.html", "utf8");

		before(function(){
			return spinUpServer(() => {
				var request = new Request();
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						// Overrides XHR, fetch
						requests(request),

						// Sets up a DOM
						dom(request, {
							root: __dirname + "/html",
							html: "page.html",
							executeScripts: false
						})
					]
				});

				return zone.run();
			});
		});

		it("Includes the right HTML", function(){
			var dom = helpers.dom(this.zone.data.html);
			var ul = helpers.find(dom, node => node.nodeName === "UL");

			assert.ok(!ul, "the ul was not added because no scripts ran");
		});
	});

	describe("Pass in run function is used", function(){
		var pageHTML = fs.readFileSync(__dirname + "/html/page.html", "utf8");

		before(function(){
			return spinUpServer(() => {
				var request = new Request();
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						// Overrides XHR, fetch
						requests(request),

						// Sets up a DOM
						dom(request, {
							root: __dirname + "/html",
							html: "page.html",
							executeScripts: false
						})
					]
				});

				return zone.run(function(){
					var main = document.createElement("main");
					document.body.appendChild(main);
				});
			});
		});

		it("Includes the right HTML", function(){
			var dom = helpers.dom(this.zone.data.html);
			var main = helpers.find(dom, node => node.nodeName === "MAIN");

			assert.ok(main, "the main is added from the run fn");
		});
	});

	describe("An app using external scripts", function(){
		before(function(){
			return spinUpServer(() => {
				var request = new Request();
				var response = this.response = new Response();

				var zone = this.zone = new Zone({
					plugins: [
						// Overrides XHR, fetch
						requests(request),

						// Sets up a DOM
						dom(request, {
							root: __dirname + "/html/external",
							html: "page.html"
						})
					]
				});

				return zone.run();
			});
		});

		it("works", function(){
			assert.ok(true);
		});
	})
});
