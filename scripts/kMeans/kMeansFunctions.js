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

function clusterResultsUsingKMeans(resultObjects, useWikiArticles) {
	defaultK = 5;
	if(useWikiArticles === undefined) {
		useWikiArticles = false;
	}

	var data = {}
	data.points = resultObjectsToVectors(resultObjects);
	data.defaultK = defaultK;
	var wikiArticles = [];
	if(useWikiArticles) {
		for(var i = 0; i < resultObjects.length; i++) {
			if(resultObjects[i].actualTitle.indexOf("wikipedia") > -1){
				wikiArticles[wikiArticles.length] = data.points[i];
			}
		}
	}
	
	var k = defaultK;
	if(useWikiArticles){
		k = wikiArticles.length;
		data.initialSeeds = wikiArticles;
	}
	var clusters = clusterfck.kmeans(data, k,"cosineSim");
	
	var noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;

	while(noOfClusters != k) {
		data.initialSeeds = undefined;
		k = defaultK;
		clusters = clusterfck.kmeans(data, k, "cosineSim");
		noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;
	}
	
	return clusterObjects(resultObjects, clusters);
}

/*
//running using dunns index
function clusterResultsUsingKMeans(resultObjects,defaultK, useWikiArticles) {
	//Check if use wiki articles is defined
	if(useWikiArticles === undefined) {
		useWikiArticles = false;
	}

	//Initialise data object
	var data = {}
	data.points = resultObjectsToVectors(resultObjects);
	
	var vectorsCopy = data.points.slice(0);
	//Blank array of wiki articles
	var wikiArticles = [];
	if(useWikiArticles) {
		for(var i = 0; i < resultObjects.length; i++) {
			if(resultObjects[i].actualTitle.indexOf("wikipedia") > -1){
				wikiArticles[wikiArticles.length] = data.points[i];
				vectorsCopy.splice(i,1);
			}
		}
		vectorsCopy.sort(function() {return (Math.round(Math.random()) - 0.5);});
	}
	
	if(useWikiArticles){
		data.initialSeeds = wikiArticles;
	}
	
	var clustersResults = Array();
	var di = Array();
	for(var i = 2; i <= 20; i++) {
		var k = i;
		data.defaultK = k;
		
		if(useWikiArticles){
			var remSeedVectors = k - wikiArticles.length;
			if(remSeedVectors > 0) {
				var tmpVectors = vectorsCopy.slice(0, remSeedVectors);
				wikiArticles.push(tmpVectors);
				data.initialSeeds = wikiArticles
			}else if(remSeedVectors < 0) {
				wikiArticles.splice(k);
				data.initialSeeds = wikiArticles
			}
		}

		var clusters = clusterfck.kmeans(data, k,"cosineSim");
		
		var noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;
		
		while(noOfClusters != k) {
			data.initialSeeds = undefined;
			clusters = clusterfck.kmeans(data, k, "cosineSim");
			noOfClusters = clusters.filter(function(value) { return value !== undefined }).length;
		}
		
		clustersResults[clustersResults.length] = clusters;
		
		di[di.length] = dunnsIndex(data.points, clusters)
	}
	
	var maxIdx = 0;
	var maxVal = 0;
	for(var i = 0; i < clustersResults.length; i++) {
		if(di[i] > maxVal) {
			maxIdx = i;
			maxVal = di[i];
		}
	}
	clusters = clustersResults[maxIdx];

	return clusterObjects(resultObjects, clusters);
}
*/
//Dunns Index  Functions

function dunnsIndex(data, clusters){		
	//Computer intra variance
	var intra = 0;
	var N = data.length;
	var clusterCentroids = Array();
	
	for(var i = 0; i < clusters.length; i++) {
		var samples = clusters[i];
		try{
			clusterCentroids[clusterCentroids.length] = getClusterMean(samples);
		}catch(e){
			console.log(clusters);
			console.log(samples);
		}
		for(var j = 0; j < samples.length; j++) {
			//intra += vectNorm(arraySub(samples[j], clusterCentroids[i]));
			intra += cosineDistance(samples[j], clusterCentroids[i]);
		}
	}
	intra = intra/N;
	//Compute inter variance
	var inter = Math.min.apply(Math,pairwiseDistance(clusterCentroids));
	
	return intra/inter;
}

function getClusterMean(clusterData) {
	var result = Array();
	//Skip first column since it is document index
	for(var i = 1; i < clusterData[0].length; i++) {
		var tmpSum = 0;
		for(var j = 0; j < clusterData.length; j++) {
				tmpSum += clusterData[j][i];
		}
		result[i] = tmpSum/clusterData.length;
	}
	return result;
}

function arraySub(arr1, arr2) {
	var result = Array();
	for(var  i = 1; i < arr1.length; i++) {
			result[i] = arr1[i]-arr2[i];
	}
	return result;
}

function vectNorm(vector) {
	var result = 0;
	for(var i = 1; i < vector.length; i++) {
		result += Math.pow(vector[i],2);
	}
	return Math.sqrt(result);
}

function pairwiseDistance(inputArray) {
	var pairWiseResults = Array();
	for(var i = 0; i < inputArray.length; i++) {
		for(var j = i+1; j < inputArray.length; j++) {
			pairWiseResults[pairWiseResults.length] = cosineDistance(inputArray[i], inputArray[j]);
		}
	}
	return pairWiseResults;
}

function cosineDistance(v1, v2) {
	   var dotProd = 0;
	   var d1 = 0;
	   var d2 = 0;
	   for(var i = 1; i < v1.length; i++) {
			d1 += Math.pow(v1[i],2);
			d2 += Math.pow(v2[i],2);
			dotProd += (v1[i]*v2[i]);
		}
		d1 = Math.sqrt(d1);
		d2 = Math.sqrt(d2);
		var denom = d1*d2;
		
		if(denom == 0) {
			return 1;
		}
		
		return 1-(dotProd/denom);
	}
