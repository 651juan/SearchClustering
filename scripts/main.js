// Listen to command from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		performClustering(request.config);
});

//Performs clustering of the results on the Google page according to the configuration provided
function performClustering(clusteringConfig) {
	if (clusteringConfig.useTestData) {
		var str = "subTopicID\tresultID\n";
		console.log(str);
		var iteration = 1;
		testDataSubjects.forEach(function (subject) {
			//console.log("Clustering results using ", clusteringConfig.method);
			var fileName = subject+".n.xml";
			var results = getSearchResults(clusteringConfig, fileName);
			
			if (results.length > 0) {
				var clusters = getClusters(results, clusteringConfig);
				clusterGoogleResults(clusters, clusteringConfig, iteration);
			}
			
			//console.log(clusters);
			//console.log("Results clustered.");
			iteration++;
		});
	} else {
		console.log("Clustering results using ", clusteringConfig.method);
		
		var results = getSearchResults(clusteringConfig, null);
		
		if (results.length > 0) {
			var clusters = getClusters(results, clusteringConfig);
			clusterGoogleResults(clusters, clusteringConfig, 0);
		}
		
		console.log(clusters);
		console.log("Results clustered.");
	};
};

//Clusters the results using the method specified in the configuration and returns a list of clusters (each with a list of documents and their HTML)
function getClusters(results, config) {
	// Automatically cluster results using SOM and display clusters in the Google Results page
	switch (config.method) {
		case "km": 
			return clusterResultsUsingKMeans(results, config.km.noOfClusters); 
		case "nkm":
			return clusterResultsUsingNoKMeans(results, config.nkm.threshold);
		case "gmm":
			return clusterResultsUsingGMM(results, config.gmm);
		case "som":
			return clusterResultsUsingSOM(results, config.som);
	}
};

//Returns a list of search results including Title, URL, Content, HTML, and Terms Vector
function getSearchResults(config, fileName, iteration) {
	var useTestData = config.useTestData;
	var includeTitleInList = config.includeTitle;
	var includeURLInList = config.includeURL;
	var removeQueryTerms = config.removeQueryTerms;
	var removeStopWords = config.removeStopWords;
	var removeSymbols = config.removeSymbols;
	var removeNumbers = config.removeNumbers;
	var stemWords = config.stemWords;
	var removeShortWords = config.removeShortWords;
	var removeSingleDocumentTerms = config.removeSingleDocumentTerms;
	var queryNumber = iteration;

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
		if(stemWords) {
			for (var i = 0; i < queryTerms.length; i++) {
					queryTerms[i] = stemmer(queryTerms[i]);
			};
		}
		
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
			
			if(removeStopWords) {
				//If it is not a stop word concat it with the result
				if(stopwords.indexOf(words[i]) < 0 && urlStopwords.indexOf(words[i]) < 0) {
					if(removeShortWords) {
						if(words[i].length >= 3) {
							result += words[i]+" ";
						}
					}else{
						result += words[i]+" ";
					}
				}
			}else {
				if(removeShortWords) {
					if(words[i].length >= 3) {
						result += words[i]+" ";
					}
				}else{
					result += words[i]+" ";
				}
			}
		}
		
		return result;
	}
	
	//Get reference for stemmed words to recover original words
	var getWordReference = function(originalReference, str) {
		var words = str.split(' ');
		var result = originalReference;
		
		for (var word in words) {
			var stemmed = stemmer(words[word]);
			if (!result[stemmed]) {
				result[stemmed] = words[word];
			}
		};
		
		return result;
	};

	//Get results
	var allresults;
	
	if (useTestData) {
		//Get the results from the xml
		//var query = getQuery();
		var query = fileName;
		//console.log("Use test data checked");
		//console.log("Getting test data for: " + query);
		
		allresults = getTestDataResults(query);
	} else {
		allresults = document.getElementsByClassName("g");
		//console.log(allresults[2]);
	}
	
	var results = Array();
	// Remove results which have more than one class (i.e. videos, cards, etc.)
	for(var i = allresults.length - 1; i >= 0; i--) {
		if(allresults[i].className == 'g') {
			if(allresults[i].id != "imagebox_bigimages") {
				results.push(allresults[i]);
			}
		}
	}
	
	results.reverse();

	//Array to store each result object
	var resultObjects = Array(); //Title String (Original and Stemmed), Content String, URL String (Original and Stemmed), Data Object with words and frequencies, and HTML
	//List of words
	var wordsBlankVector = {}; //Filled using process string function
		
	//For each result create a result object and store the title, content and url
	for(var i = 0; i < results.length; i++) {
		//Create result Object
		try{
			//Create a new result object 
			var result = {id: i, html: results[i], originalReference: {}};
			
			//Set the title, content and url
			//Get Title
			if(includeTitleInList) {
				//Convert it to lowercase
				var tmpTitle = getTitle(results[i]).toLowerCase();
				result.actualTitle = tmpTitle;
				
				//Remove symbols
				if(removeSymbols){
					tmpTitle = tmpTitle.replace(/[^a-zA-Z0-9\s]/g, "");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpTitle = tmpTitle.replace(/[\d+]/g, "");
				}
				
				result.wordReference = getWordReference(result.originalReference, tmpTitle);
				
				//Remove stop words and stemm title
				if(removeStopWords || stemWords) {
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
					tmpUrl = tmpUrl.replace(/[^a-zA-Z0-9\s]/g, " ");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpUrl = tmpUrl.replace(/[\d+]/g, "");
				}
				
				result.wordReference = getWordReference(result.originalReference, tmpUrl);
				
				//Remove stop words and stemm title
				if(removeStopWords || stemWords) {
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
					tmpContent = tmpContent.replace(/[^a-zA-Z0-9\s]/g, "");
				}
				//Remove Numbers
				if(removeNumbers) {
					tmpContent = tmpContent.replace(/[\d+]/g, "");
				}
				
				result.wordReference = getWordReference(result.originalReference, tmpContent);
				
				//Remove stopWords and stemm content
				if(removeStopWords || stemWords) {
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
			console.log(results[i]);
		}
	}
	
	var wordsHistogram = JSON.parse(JSON.stringify(wordsBlankVector));
	
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
	
	// Remove words which occur in only one document
	// Construct histogram
	if (removeSingleDocumentTerms) {
		for (var i = 0; i < resultObjects.length; i++ ) {
			for (var word in resultObjects[i].data) {
				if(resultObjects[i].data[word] > 0){
					wordsHistogram[word]++;
				};
			};		
		};
		
		// Remove from histogram those words which appear in only one document
		for (var word in wordsHistogram) {
			if (wordsHistogram[word] == 1) {
				delete wordsHistogram[word];
			};
		};
		
		// Remove words not found in the histogram from the result
		for (var i = 0; i < resultObjects.length; i++) {
			for (var word in resultObjects[i].data) {
				if(!wordsHistogram[word]) {
					delete resultObjects[i].data[word];
				};
			};		
		};
	};
	
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
function clusterGoogleResults(clusters, config, queryNumber) {
	//Returns the HTML code for a cluster
	function getClusterHtml(cluster) {
		var clusterNode = document.createElement("div");
		cluster.documents.forEach(function(doc) {
			var documentNode = doc.html;
			clusterNode.appendChild(documentNode);
		});
		
		if (showFeatures) {
			var clusterFeatures = extractClusterFeatures(cluster);
			var featuresDiv = document.createElement("div");
			for (var feature in clusterFeatures) {
				var featureNode = document.createElement("p");
				featureNode.style.cssText = "display:inline-block;padding-right:20px;font-size:12px;";
				featureNode.innerHTML = clusterFeatures[feature].word + ": " + clusterFeatures[feature].count;
				featuresDiv.appendChild(featureNode);
			};
			clusterNode.appendChild(featuresDiv);
		}
		
		var clusterBreak = document.createElement("hr");
		clusterNode.appendChild(clusterBreak);
			
		return clusterNode;
	};
	
	function outputClustersInDatasetFormat(clusters) {
		var set = queryNumber;
		var str = "";
		for (var i = 0; i < clusters.length; i++) {
			clusters[i].documents.forEach(function(doc) {
				var j = doc.id + 1;
				var k = i + 1;
				str += set+"."+k+"\t"+set+"."+j+"\n";
			});
		};
		console.log(str);
	};
	
	var showFeatures = config.showFeatures;
	var resultsDiv = document.getElementsByClassName("srg")[0];
	resultsDiv.innerHTML = "";
	
	for (var i = 0; i < clusters.length; i++) {
		resultsDiv.appendChild(getClusterHtml(clusters[i]));
	};
	
	outputClustersInDatasetFormat(clusters);
};