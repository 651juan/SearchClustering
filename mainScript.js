console.log("In Main Script");

//Get results
var results = document.getElementsByClassName("g");
console.log("Found " + results.length + " results.");
//console.log(results);

if(results.length > 0) {
	//Array to store each result object
	var resultObjects = [];
	
	for(i = 0; i < results.length; i++) {
		//Create result Object
		try{
		var result = {};
			result.title = getTitle(results[i]);
			result.content = getContent(results[i]);
			//Store result object
			resultObjects[resultObjects.length] = result;
		}catch(err) {
			//result image/video/news
		}
	}
	
	var jsonstr = JSON.stringify(resultObjects);
	console.log(jsonstr);
}

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