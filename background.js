//Google URL
var googleURL =  new RegExp("^(https?:\/\/)?(www.)?(google).*");

//URL parameters to get 100 results and turns auto complete off
var newURL = "&num=100&complete=0";

//called when tab is changed
function checkForValidUrl(tabId, changeInfo, tab) {
	//if url has google in it show extension icon
	if(googleURL.test(tab.url)) {
		//Show the extension
		chrome.pageAction.show(tabId);
		
		//When tab is finished loading
		if(changeInfo.status == "complete") {
			//Get the URL
			var tabURL = tab.url;
			//If parameters are not found
			if(tab.url.indexOf(newURL) < 0) {
				//Add the parameters to the current search url
				tabURL += newURL;
				//Go to new URL
				chrome.tabs.update(tab.id, {url: tabURL});
			}
			
			//Execute extension script
			//chrome.tabs.executeScript(null, {file: "getTitle.js"});
		}
	}
};

//Listen for tab changes
chrome.tabs.onUpdated.addListener(checkForValidUrl);