function getTestDataResults(filename){
	//Create the path to the xml file specified
	var filePath = "scripts/testdata/xml/" + filename;
	//console.log("XML Path: " + filePath);
	
	if (window.XMLHttpRequest) {
		xhttp = new XMLHttpRequest();
	}

	xhttp.overrideMimeType('text/xml');

	xhttp.open("GET", chrome.extension.getURL(filePath), false);
	xhttp.send(null);
	xmlDoc = xhttp.responseXML;
	
	//Get all the results in the xml
	var doc = xmlDoc.documentElement.childNodes[1].children;
	
	allresults = Array(); 

	//for each result in the xml get the url, title and content
	for(var i = 0; i < doc.length; i++) {
		var dURL = doc[i].getAttribute('url');
		var dTitle = doc[i].getAttribute('title');
		var dContent = doc[i].children[0].textContent;
		
		//Main div
		var gDiv = document.createElement('div');
		gDiv.className = "g";
		
		//Title h3
		var titleH3 = document.createElement ("h3")
		titleH3.className = "r";
		
		//Title url
		var titleURL = document.createElement("A");
		titleURL.text = dTitle;
		titleURL.href = dURL;
		
		//Content div
		var contentDiv = document.createElement('div');
		contentDiv.className = "s";
		
		var contentDiv2 = document.createElement('div');
		
		var contentSpan = document.createElement("SPAN");
		contentSpan.innerHTML = dContent;
		
		titleH3.appendChild(titleURL);
		gDiv.appendChild(titleH3);
		contentDiv2.appendChild(contentSpan);
		contentDiv.appendChild(contentDiv2);
		gDiv.appendChild(contentDiv);
		
		//console.log(gDiv);
		allresults[allresults.length] = gDiv;
	}
	
	
	return allresults;
}
