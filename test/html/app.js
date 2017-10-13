const main = document.createElement("main");
const ul = document.createElement("ul");
main.appendChild(ul);

const img = document.createElement("img");
img.src = "/images/cat.png";
main.appendChild(img);

fetch("/api/todos").then(res => res.json()).then(todos => {
	todos.forEach(todo => {
		var li = document.createElement("li");
		li.textContent = todo;
		ul.appendChild(li);
	});
})
.then(null, err => console.error("ERROR", err))

document.body.appendChild(main);
