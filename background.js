//called when tab is changed
function checkForValidUrl(tabId, changeInfo, tab) {
	//if url has google in it show extension icon
	if (tab.url.indexOf('google.com') >= 0) {
		chrome.pageAction.show(tabId);
		if(changeInfo.status == "complete") {
			chrome.tabs.executeScript(null, {file: "getTitle.js"});
		}
	}
};

//Listen for tab changes
chrome.tabs.onUpdated.addListener(checkForValidUrl);