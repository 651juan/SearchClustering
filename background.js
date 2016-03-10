//Google URL
var googleURL =  new RegExp("^(https?:\/\/)?(www.)?(google).*");
var prevURL;
var tabURL;

//URL parameters to get 100 results and turns auto complete off
var pCheckForParameters = true;
var pNumOfResults = "num=100";
var pAutoCompleteOff = "complete=0";

var googleResults = "";

//called when tab is changed
function checkForValidUrl(tabId, changeInfo, tab) {
	//if url has google in it show extension icon
	if(googleURL.test(tab.url)) {
		//Show the extension
		chrome.pageAction.show(tabId);
		
		//When tab is finished loading
		if(changeInfo.status == "complete") {
			if(pCheckForParameters){
				//Check for url changes
				var URLChanged = false;
				//Get the URL
				prevURL = tabURL;
				tabURL = tab.url;
				
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
			
			//Execute extension script
			if(changeInfo.status == "complete") {
				if(tabURL.indexOf("q=") >=  0){
					if(tabURL != prevURL) {
						console.log("Current URL: "+ tabURL);
						console.log("Previous URL: " + prevURL);
						console.log("Executing Main Script");
						chrome.tabs.executeScript(null, {file: "mainScript.js"});
					}else{
						console.log("Same URL Not Executing Script");
					}
				}
			}
		}
	}
};

//Listen for tab changes
chrome.tabs.onUpdated.addListener(checkForValidUrl);


//Listen for data from the content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	googleResults = request.data; 
	//console.log(googleResults);
});
