function resultObjectsToVectors(resultObjects){
	//Create a blank array that will hold all vectors
	var vectors = Array();
	
	//go through each result object
	for(var i = 0; i < resultObjects.length; i++) {
		//Create a vector
		var tmpVector = Array();
		//Set the first number in the vector to the index of the object
		tmpVector[0] = resultObjects[i].id;
		//get the data from the object
		var vectorObject = resultObjects[i].data;
		
		//For each attribute in the data
		for (var attrib in vectorObject) {
			if (vectorObject.hasOwnProperty(attrib)) {
				//add the frequency to the vector
				tmpVector[tmpVector.length] = vectorObject[attrib];
			}
		}
		
		//Add the vector to the array of vectors
		vectors[vectors.length] = tmpVector;
	}
	
	//Return the array of vectors
	return vectors;
}

function clusterObjects(resultObjects, vectorClusters) {
	var clusters = Array();
	
	for(var i = 0; i < vectorClusters.length; i++) {
		var tmpCluster = {};
		var currentCluster = vectorClusters[i];
		
		var documents = Array();
		tmpCluster.id = i;
		tmpCluster.closestDocument = resultObjects[currentCluster[0][0]];
		for(var j = 1; j < currentCluster.length; j++) {
			var vectorIdx = currentCluster[j][0];
			documents[documents.length] = resultObjects[vectorIdx];
		}
		
		tmpCluster.documents = documents;
		clusters[clusters.length] = tmpCluster;
	}
	return clusters;
}

function clusterResultsUsingKMeans(resultObjects,defaultK, useWikiArticles, enforceK) {
	if(useWikiArticles === undefined) {
		useWikiArticles = false;
	}
	
	if(enforceK === undefined) {
		enforceK = false;
	}

	var data = {}
	data.points = resultObjectsToVectors(resultObjects);
	var wikiArticles = [];
	if(useWikiArticles) {
		for(var i = 0; i < resultObjects.length; i++) {
			if(resultObjects[i].actualTitle.indexOf("wikipedia") > -1){
				wikiArticles[wikiArticles.length] = data.points[i];
			}
		}
	}
	
	var k = wikiArticles.length;
	data.initialSeeds = wikiArticles
	
	var clusters = clusterfck.kmeans(data, k);
	
	var noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;

	while(noOfClusters != k) {
		data.initialSeeds = undefined;
		k = defaultK;
		clusters = clusterfck.kmeans(data, k);
		noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;
	}
	
	return clusterObjects(resultObjects, clusters);
}