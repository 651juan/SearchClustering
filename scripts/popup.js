function sendMessage() {
	var config = {
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
			useWikipedia: document.getElementById('useWikipedia').value
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
	};
	
	chrome.extension.getBackgroundPage().performClusteringInBackground(config);
};

function showSettingsFor(algorithm) {
	return document.getElementById('algorithmChoice').value == algorithm;
};

document.getElementById('clusterBtn').addEventListener('click', sendMessage);

document.getElementById('algorithmChoice').onchange = function() {
	document.getElementById('kmSettings').className = showSettingsFor('km') ? "show" : "hide";
	document.getElementById('nkmSettings').className = showSettingsFor('nkm') ? "show" : "hide";
	document.getElementById('gmmSettings').className = showSettingsFor('gmm') ? "show" : "hide";
	document.getElementById('somSettings').className = showSettingsFor('som') ? "show" : "hide";
};