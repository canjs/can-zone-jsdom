var once = require("once");

module.exports = function(pageHTML){
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
					require("./html")(pageHTML) :
					require("./dom")
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
