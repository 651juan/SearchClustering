window.onload = function(){ 
		var results = document.getElementsByClassName("g");
		console.log("Title: " + getTitle(results[0]));
		console.log("Content: " + getContent(results[0]));
		setTitle("Juan is Fucking Awesome", results[0]);
		setContent("Juan is a mexican", results[0]);
		console.log("Results Array: ");
		console.log(results);
};

function getTitle(result) {
	return result.getElementsByClassName("r")[0].innerText;
}

function getContent(result) {
	return result.getElementsByClassName("st")[0].innerText;
}

function setTitle(newTitle, result) {
	result.getElementsByClassName("r")[0].childNodes[0].childNodes[0].data = newTitle;
}

function setContent(newContent, result) {
	result.getElementsByClassName("st")[0].innerHTML = newContent;
}