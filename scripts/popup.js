function sendMessage() {
	/*var config = {
		method: document.getElementById('algorithmChoice').value,
		useTestData: document.getElementById('useTestData').checked,
		includeTitle: document.getElementById('includeTitle').checked,
		includeURL: document.getElementById('includeURL').checked,
		removeQueryTerms: document.getElementById('removeQueryTerms').checked,
		removeStopWords: document.getElementById('removeStopWords').checked,
		removeSymbols: document.getElementById('removeSymbols').checked,
		removeNumbers: document.getElementById('removeNumbers').checked,
		removeShortWords: document.getElementById('removeShortWords').checked,
		removeSingleDocumentTerms: document.getElementById('removeSingleDocumentTerms').checked,
		stemWords: document.getElementById('stemWords').checked,
		showFeatures: document.getElementById('showFeatures').checked,
		showResults: document.getElementById('showResults').checked,
		showClusters: document.getElementById('showClusters').checked,
		km: {
			noOfClusters: document.getElementById('noOfClusters').value,
			useWikipedia: document.getElementById('useWikipedia').checked
		},
		nkm: {
			threshold: document.getElementById('nkmThreshold').value
		},
		gmm: {
			
		},
		som: {
			networkIterations: document.getElementById('networkIterations').value,
			networkLearningRate: document.getElementById('networkLearningRate').value,
			networkWidth: document.getElementById('networkWidth').value,
			networkHeight: document.getElementById('networkHeight').value
		}
	};*/
	
	var config = {
		method: document.getElementById('algorithmChoice').value,
		useTestData: false,
		includeTitle: true,
		includeURL: false,
		removeQueryTerms: true,
		removeStopWords: true,
		removeSymbols: true,
		removeNumbers: false,
		removeShortWords: false,
		removeSingleDocumentTerms: document.getElementById('algorithmChoice').value == "som",
		stemWords: true,
		showFeatures: false,
		showResults: false,
		showClusters: false,
		km: {
			noOfClusters: 7,
			useWikipedia: true
		},
		nkm: {
			threshold: 0.05
		},
		som: {
			networkIterations: 5,
			networkLearningRate: 0.1,
			networkWidth: 5,
			networkHeight: 5
		}
	};
	
	chrome.extension.getBackgroundPage().performClusteringInBackground(config);
};

function showSettingsFor(algorithm) {
	return document.getElementById('algorithmChoice').value == algorithm;
};

document.getElementById('clusterBtn').addEventListener('click', sendMessage);

document.getElementById('algorithmChoice').onchange = function() {
	document.getElementById('kmSettings').className = showSettingsFor('km') ? "hide" : "hide";
	document.getElementById('nkmSettings').className = showSettingsFor('nkm') ? "hide" : "hide";
	document.getElementById('gmmSettings').className = showSettingsFor('gmm') ? "hide" : "hide";
	document.getElementById('somSettings').className = showSettingsFor('som') ? "hide" : "hide";
};