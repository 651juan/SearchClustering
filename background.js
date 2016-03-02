//called when tab is changed
function checkForValidUrl(tabId, changeInfo, tab) {
	//if url has google in it show extension icon
	console.log(changeInfo.url);
	if (tab.url.indexOf('google.com') >= 0) {
		chrome.pageAction.show(tabId);
	}
};

//Listen for tab changes
chrome.tabs.onUpdated.addListener(checkForValidUrl);