console.log("In Main Script");
var results = document.getElementsByClassName("g");

console.log("No of Results: " + results.length);
setTitle("Test", results[0]);


//console.log(document.getElementsByClassName("g")[0].getElementsByTagName("a")[0].innerText);

function getTitle(result) {
	return result.getElementsByClassName("r")[0].innerText;
}

function getContent(result) {
	return result.getElementsByClassName("st")[0].innerText;
}

function setTitle(newTitle, result) {
	result.getElementsByTagName("a")[0].innerText = newTitle;
	//result.getElementsByClassName("r")[0].childNodes[0].childNodes[0].data = newTitle;
}

function setContent(newContent, result) {
	result.getElementsByClassName("st")[0].innerHTML = newContent;
}