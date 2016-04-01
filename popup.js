var port = chrome.extension.connect({name: "Sample Communication"});

document.getElementById('clusterBtn').addEventListener('click', sendMessage);

function sendMessage() {
	// http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension
	var config = {
		method: document.getElementById('algorithmChoice').value,
		includeTitle: document.getElementById('includeTitle').checked,
		includeURL: document.getElementById('includeURL').checked,
		removeQueryTerms: document.getElementById('removeQueryTerms').checked,
		wordStemming: document.getElementById('wordStemming').checked,
		removeSymbols: document.getElementById('removeSymbols').checked,
		removeNumbers: document.getElementById('removeNumbers').checked
	};
	port.postMessage(config);
};