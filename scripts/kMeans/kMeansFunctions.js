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
		
		for(var j = 0; j < currentCluster.length; j++) {
			var vectorIdx = currentCluster[j][0];
			documents[documents.length] = resultObjects[vectorIdx];
		}
		
		tmpCluster.documents = documents;
		clusters[clusters.length] = tmpCluster;
	}
	return clusters;
}

function clusterResultsUsingKMeans(resultObjects,k) {
	var clusters = clusterfck.kmeans(resultObjectsToVectors(resultObjects), k);
	
	var noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;

	while(noOfClusters != k) {
		clusters = clusterfck.kmeans(resultObjectsToVectors(resultObjects), k);
		noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;
	}
	
	return clusterObjects(resultObjects, clusters);
}