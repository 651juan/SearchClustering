document.getElementById('clusterBtn').addEventListener('click', sendMessage);

function sendMessage() {
	var config = {
		method: document.getElementById('algorithmChoice').value,
		includeTitle: document.getElementById('includeTitle').checked,
		includeURL: document.getElementById('includeURL').checked,
		removeQueryTerms: document.getElementById('removeQueryTerms').checked,
		removeStopWords: document.getElementById('removeStopWords').checked,
		removeSymbols: document.getElementById('removeSymbols').checked,
		removeNumbers: document.getElementById('removeNumbers').checked,
		stemWords: document.getElementById('stemWords').checked
	};
	
	chrome.extension.getBackgroundPage().performClusteringInBackground(config);
};
