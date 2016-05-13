//called when tab is changed
function checkForValidUrl(tabId, changeInfo, tab) {
	// Google URL
	var googleURL = new RegExp("^(https?:\/\/)?(www.)?(google).*");
	
	//URL parameters to get 100 results and turns auto complete off
	var pCheckForParameters = true;
	var pNumOfResults = "num=100";
	var pAutoCompleteOff = "complete=0";
	
	//if url has google in it show extension icon
	if(googleURL.test(tab.url)) {
		//Show the extension
		chrome.pageAction.show(tabId);
		
		//When tab is finished loading
		if(changeInfo.status == "complete") {
			if(pCheckForParameters){
				if(tab.url.indexOf("q=") >= 0){
					//Check for url changes
					var URLChanged = false;
					//Get the URL
					var tabURL = tab.url;
					
					//check if ? is at the start of the url before the arameters
					if(tab.url.indexOf("?") < 0) {
						tabURL += "?";
						URLChanged = true;
					}
					
					//Check if num of results parameter is present in url
					if(tab.url.indexOf(pNumOfResults) < 0) {
						tabURL += "&" + pNumOfResults;
						URLChanged = true;
					}
					
					//Check if autocomple parameter is present in url
					if(tab.url.indexOf(pAutoCompleteOff) < 0) {
						tabURL += "&" + pAutoCompleteOff;
						URLChanged = true;
					}
					
					//If the url was changed go to new url
					if(URLChanged) {
						chrome.tabs.update(tab.id, {url: tabURL});
					}
				}
			}
			
			//Execute extension script
			if(changeInfo.status == "complete") {
				if(tabURL.indexOf("q=") >=  0){
					validURL = true;
				}
			}
		}
	}
	
	return validURL;
};

function performClusteringInBackground(config) {
	if(validURL) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {config: config}, function(response) {});
		});
	}
};

//Must be global as it is set and used by functions fired through events
var validURL = false;

//Listen for tab changes
chrome.tabs.onUpdated.addListener(checkForValidUrl);