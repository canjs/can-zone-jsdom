
setTimeout(() => {
	let el = $("<div>").attr("id", "hello").text("Hello world!");
	el.appendTo("body");
}, 50);
