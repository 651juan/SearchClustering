// Listen to command from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		performClustering(request.config);
});

//Performs clustering of the results on the Google page according to the configuration provided
function performClustering(clusteringConfig) {
	console.log("Performing Magic...");
	
	var results = getSearchResults(clusteringConfig);
	
	if (results.length > 0) {
		var clusters = getClusters(results, clusteringConfig);
		
		clusterGoogleResults(clusters);
	}
	console.log("You've reached Magic level 98. 3.14159265358979323846 xp to next level.");
};

//Clusters the results using the method specified in the configuration and returns a list of clusters (each with a list of documents and their HTML)
function getClusters(results, config) {
	// Automatically cluster results using SOM and display clusters in the Google Results page
	switch (config.method) {
		case "km": 
		case "nkm":
		case "gmm":
		case "som":
			return clusterResultsUsingSOM(results);
		default:
			return clusterResultsUsingSOM(results);
	}
};

//Returns a list of search results including Title, URL, Content, HTML, and Terms Vector
function getSearchResults(config) {
	var includeTitleInList = config.includeTitle;
	var includeURLInList = config.includeURL;
	var removeQueryTerms = config.removeQueryTerms;
	var removeStopWords = config.removeStopWords;
	var removeSymbols = config.removeSymbols;
	var removeNumbers = config.removeNumbers;
	var stemWords = config.stemWords;

	//Splits string by " " and stores it in an object
	var processString = function(toProcess) {
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
	var removeStopWordsStemm = function(toProcess) {
		//Get the query terms
		var queryTerms = getQuery().split(" ");
		//Stem query terms
		for (var i = 0; i < queryTerms.length; i++) {
			if(stemWords) {
				queryTerms[i] = stemmer(queryTerms[i]);
			}
		};
		//Split the string into individual words
		var words = toProcess.split(" ");
		
		//Stores the final result
		var result = "";
		
		//Go through each word and check if it is a stop word
		for(var i = 0; i < words.length; i++) {
			//Remove any leading or trailing whiteSpace
			words[i] = words[i].trim();
			//Stemm the word
			if(stemWords) {
				words[i] = stemmer(words[i]);
			}
			//Check query terms again after stemming
			if(removeQueryTerms){
				if(queryTerms.indexOf(words[i]) >= 0){
					continue;
				}
			}
			//If it is not a stop word concat it with the result
			if(stopwords.indexOf(words[i]) < 0 && urlStopwords.indexOf(words[i]) < 0) {
				result += words[i]+" ";
			}
		}
		
		return result;
	}

	//Get results
	var allresults = document.getElementsByClassName("g");
	var results = Array();

	// Remove results which have more than one class (i.e. videos, cards, etc.)
	for(var i = allresults.length - 1; i >= 0; i--) {
		if(allresults[i].className == 'g') {
			results.push(allresults[i]);
		}
	}

	//Array to store each result object
	var resultObjects = Array(); //Title String (Original and Stemmed), Content String, URL String (Original and Stemmed), Data Object with words and frequencies, and HTML
	//List of words
	var wordsBlankVector = {}; //Filled using process string function
		
	//For each result create a result object and store the title, content and url
	for(var i = 0; i < results.length; i++) {
		//Create result Object
		try{
			//Create a new result object 
			var result = {id: i, html: results[i]};
			
			//Set the title, content and url
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
				if(removeStopWords) {
					tmpTitle = removeStopWordsStemm(tmpTitle);
				}
				result.title = tmpTitle;
			}else{
				//If title is not included in list just get the title as it is
				result.title = getTitle(results[i]);
			}
			
			//Get Url
			if(includeURLInList) {
				//Convert it to lowercase
				var tmpUrl = getURL(results[i]).toLowerCase();
				result.actualUrl = tmpUrl;
				
				//Remove symbols
				if(removeSymbols){
					tmpUrl = tmpUrl.replace(/[-!$%^&*()_×+|·–~—=`{}\[\]:";'<>“”?•▾,.\/]/g, " ");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpUrl = tmpUrl.replace(/[\d+]/g, "");
				}
				//Remove stop words and stemm title
				if(removeStopWords) {
					tmpUrl = removeStopWordsStemm(tmpUrl);
				}
				result.url = tmpUrl;
			}else{
				//If title is not included in list just get the title as it is
				result.url = getURL(results[i]);
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
				if(removeStopWords) {
					tmpContent = removeStopWordsStemm(tmpContent);
				}
				result.content = tmpContent;
			}catch(err2){
				result.content = "";
			}
			
			//Get individual words and store them in an object
			if(includeTitleInList) {
				processString(result.title);
			}
			
			if(includeURLInList) {
				processString(result.url);
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
		
		//If include url option is enabled go through the url terms and increment the frequency of each word
		if(includeURLInList) {
			var urlArr = resultObjects[i].url.split(" ");
				
			for(var j = 0; j < urlArr.length; j++ ) {
				if(urlArr[j] != ""){
					wordsVector[urlArr[j]]++;
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
	
	return resultObjects;
};

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

//Clears the Google results section and fills it with clustered results
function clusterGoogleResults(clusters) {
	var resultsDiv = document.getElementsByClassName("srg")[0];
	resultsDiv.innerHTML = "";
	
	for (var i = 0; i < clusters.length; i++) {
		resultsDiv.appendChild(getClusterHtml(i, clusters[i]));
	};
};

//Returns the HTML code for the cluster
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