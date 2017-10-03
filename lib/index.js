var once = require("once");

module.exports = function(request, pageHTML){
	return function(data){
		var windowProps;

		var getWindowProps = once(function(){
			var window = data.window;
			windowProps = Object.assign({}, {
				window: window,
				document: window.document,
				location: window.location
			});
			data.document = window.document;
		});

		return {
			plugins: [
				pageHTML ?
					require("./html")(request, pageHTML) :
					require("./dom")(request)
			],
			created: function(){
				if(!pageHTML) {
					getWindowProps();
				}
			},
			beforeTask: function(){
				getWindowProps();
				Object.assign(global, windowProps);
			},
			ended: function(){
				data.html = data.document.documentElement.outerHTML;
			}
		};

	};
};
