var bg = chrome.extension.getBackgroundPage();
//console.log(bg.googleResults);
var toSend = bg.googleResults;
console.log(toSend);
var iframe = document.getElementById("python-frame");

iframe.onload = function() {
    iframe.contentWindow.postMessage({content: toSend}, '*');
};