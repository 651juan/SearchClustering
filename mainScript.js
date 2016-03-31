console.log("In Main Script");

/****************
	Other Attributes
*****************/
var stopwords = ["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];

/************
	OPTIONS
************/
var includeTitleInList = true;
var removeQueryTerms = true;
var stopWordsRemoval = true;
var wordStemming = true;
var removeSymbols = true;
var removeNumbers = true;

/*********
	MAIN
**********/

//Get results
var allresults = document.getElementsByClassName("g");
var results = Array();
// Remove results which have more than one class (i.e. videos, cards, etc.)
for(var i = allresults.length - 1; i >= 0; i--) {
    // Only if there is one single class
    if(allresults[i].className == 'g') {
        // Push result in result list
        results.push(allresults[i]);
    }
}

console.log("Found " + results.length + " results.");

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
			var result = {id: i, html: results[i]};
			//Set the title,content and url
			//Get Title
			if(includeTitleInList) {
				//Convert it to lowercase
				var tmpTitle = getTitle(results[i]).toLowerCase();
				result.actualTitle = tmpTitle;
				//Remove symbols
				if(removeSymbols){
					tmpTitle = tmpTitle.replace(/[-!$%^&*()_×+|·–~—=`{}\[\]:";'<>“”?•▾,.\/]/g, "");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpTitle = tmpTitle.replace(/[\d+]/g, "");
				}
				//Remove stop words and stemm title
				if(stopWordsRemoval) {
					tmpTitle = removeStopWordsStemm(tmpTitle);
				}
				result.title = tmpTitle;
			}else{
				//If title is not included in list just get the title as it is
				result.title = getTitle(results[i]);
			}
			
			//Get Content
			//Sometimes results dont have content
			try{
				//Convert it to lowercase
				var tmpContent = getContent(results[i]).toLowerCase();
				//Remove symbols
				if(removeSymbols){
					tmpContent = tmpContent.replace(/[-!$%^&*()_×+|·–~—=`{}\[\]:";'<>“”?•▾,.\/]/g, "");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpContent = tmpContent.replace(/[\d+]/g, "");
				}
				//Remove stopWords and stemm content
				if(stopWordsRemoval) {
					tmpContent = removeStopWordsStemm(tmpContent);
				}
				result.content = tmpContent;
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
				if(titleArr[j] != ""){
					wordsVector[titleArr[j]]++;
				}
			}
		}
		
		//Go through each content words and increment the frequency of each word
		var contentArr = resultObjects[i].content.split(" ");

		for(var j = 0; j < contentArr.length; j++ ) {
			if(contentArr[j] != ""){
				wordsVector[contentArr[j]]++;
			}
		}	
		
		//Add the vector to the result object
		resultObjects[i].data = wordsVector;
	}
	
	// Automatically cluster results using SOM and display clusters in the Google Results page
	//var clusters = clusterResultsUsingSOM(resultObjects);
	//console.log("Clusters: ", clusters);
	//clusterGoogleResults(clusters);
	
	/* for(var i = 0; i < resultObjects.length; i++ ) {
		console.log("Vector Length: " + Object.keys(resultObjects[i].data).length);
	} */	
	
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
		if(words[i] != ""){
			if(removeQueryTerms){
				//Check if the current word is a query term then define it
				if(queryTerms.indexOf(words[i]) < 0) {
					//If it was not defined, define it
					if(typeof wordsBlankVector[words[i]] === 'undefined'){
							wordsBlankVector[words[i]] = 0;
					}
				}
			}else{
				//Just add it if it was not previously defined
				if(typeof wordsBlankVector[words[i]] === 'undefined'){
					wordsBlankVector[words[i]] = 0;
				}
			}
		}
	}
}

//Remove the stopwords from a string
function removeStopWordsStemm(toProcess) {
	//Get the query terms
	var queryTerms = getQuery().split(" ");
	//Split the string into individual words
	var words = toProcess.split(" ");
	
	//Stores the final result
	var result = "";
	
	//Go through each word and check if it is a stop word
	for(var i = 0; i < words.length; i++) {
		//Remove any leading or trailing whiteSpace
		words[i] = words[i].trim();
		//Stemm the word
		if(wordStemming) {
			words[i] = stemmer(words[i]);
		}
		//Check query terms again after stemming
		if(removeQueryTerms){
			if(queryTerms.indexOf(words[i]) >= 0){
				continue;
			}
		}
		//If it is not a stop word concat it with the result
		if(stopwords.indexOf(words[i]) < 0) {
			result += words[i]+" ";
		}
	}
	
	return result;
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

function clusterGoogleResults(clusters) {
	var resultsDiv = document.getElementsByClassName("srg")[0];
	resultsDiv.innerHTML = "";
	
	for (var i = 0; i < clusters.length; i++) {
		resultsDiv.appendChild(getClusterHtml(i, clusters[i]));
	};
};

function getClusterHtml(id, cluster) {
	var clusterNode = document.createElement("div");
	
	cluster.documents.forEach(function(doc) {
		var documentNode = doc.html;
		clusterNode.appendChild(documentNode);
	});
	
	var clusterBreak = document.createElement("hr");
	clusterNode.appendChild(clusterBreak);
		
	return clusterNode;
};