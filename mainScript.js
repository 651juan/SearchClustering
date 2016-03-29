console.log("In Main Script");

/************
	OPTIONS
************/
var includeTitleInList = true;
var removeQueryTerms = true;

/*********
	MAIN
**********/

//Get results
var results = document.getElementsByClassName("g");
console.log("Found " + results.length + " results.");
//console.log(results);

//Array to store each result object
var resultObjects = Array(); //Title String, Content String, URL String, Data Object with words and frequencies
//List of words
var wordsBlankVector = {}; //Filled using process string function
	
if(results.length > 0) {	
	//For each result create a result object and store the title, content and url
	for(var i = 0; i < results.length; i++) {
		//Create result Object
		try{
			//Create a new result object 
			var result = {};
			
			//Set the title,content and url
			result.title = getTitle(results[i]);
			
			//Sometimes results dont have content
			try{
				result.content = getContent(results[i]);
			}catch(err2){
				result.content = "";
			}
			
			result.url = getURL(results[i]);
			
			//Get individual words and store them in an object
			if(includeTitleInList) {
				processString(result.title);
			}
			processString(result.content);
			
			//Store result object
			resultObjects[resultObjects.length] = result;
		}catch(err) {
			//result image/video/news
			console.log(err);
		}
	}
	
	//Go through all the results again
	for(var i = 0; i < resultObjects.length; i++ ) {
		//Create an object using the list of words created earlier
		var wordsVector = JSON.parse(JSON.stringify(wordsBlankVector));

		//If include title option is enabled go through the title terms and increment the frequency of each word
		if(includeTitleInList) {
			var titleArr = resultObjects[i].title.split(" ");
				
			for(var j = 0; j < titleArr.length; j++ ) {
				wordsVector[titleArr[j]]++;
			}
		}
		
		//Go through each content words and increment the frequency of each word
		var contentArr = resultObjects[i].content.split(" ");

		for(var j = 0; j < contentArr.length; j++ ) {
			wordsVector[contentArr[j]]++;
		}	
		
		//Add the vector to the result object
		resultObjects[i].data = wordsVector;
	}
	
	console.log("Results Objects: " + resultObjects.length);
	console.log(resultObjects);
	//var jsonstr = JSON.stringify(resultObjects);
	//console.log(jsonstr);
}


/************
	FUNCTIONS
************/
	
//Splits string by " " and stores it in an object
function processString(toProcess) {
	//Split the string andd store the result in an array of individual words
	var words = toProcess.split(" ");
	var queryTerms = getQuery().split(" ");
	
	//Go through each word and add it to an object as a new 
	//attribute initialising its frequency to 0
	for(var i = 0; i < words.length; i++) {
		if(removeQueryTerms){
			//Check if the current word is a query term then define it
			if(queryTerms.indexOf(words[i]) < 0) {
				//If it was not defined, define it
				if(typeof wordsBlankVector[words[i]] == 'undefined'){
						wordsBlankVector[words[i]] = 0;
				}
			}
		}else{
			//Just add it if it was not previously defined
			if(typeof wordsBlankVector[words[i]] == 'undefined'){
				wordsBlankVector[words[i]] = 0;
			}
		}
	}
}

//Getters Get data from webpage
//Returns the query
function getQuery() {
	return document.getElementById("ires").getAttribute("data-async-context").substring(6).replace(/%20/g, " ");
}

//Returns the document title
function getTitle(result) {
	return result.getElementsByClassName("r")[0].innerText;
}

//Returns the document content
function getContent(result) {
	return result.getElementsByClassName("st")[0].innerText;
}

//Returns the document url
function getURL(result) {
	
	//return result.getElementsByClassName("_Rm")[0].innerText; //Returns url under title
	return result.getElementsByClassName("r")[0].getElementsByTagName('a')[0].href;
}

function setTitle(newTitle, result) {
	result.getElementsByTagName("a")[0].innerText = newTitle;
	//result.getElementsByClassName("r")[0].childNodes[0].childNodes[0].data = newTitle;
}

function setContent(newContent, result) {
	result.getElementsByClassName("st")[0].innerHTML = newContent;
}
