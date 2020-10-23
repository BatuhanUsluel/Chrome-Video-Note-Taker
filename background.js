// background.js
chrome.browserAction.onClicked.addListener(function(tab){
    chrome.tabs.sendMessage(tab.id, {type: "toggle"});
});

var urlTimes = {};
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("in background");
        if(request.type == "newTab" ) {
            console.log("in new tab");
            createTab(request.url);
        } else if (request.type == "frames") {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.executeScript({file: 'iframescript.js', allFrames: true}, function (results) {
                    console.log("results:");
                    console.log(results);
                    sendResponse(results);
                });
            });
        } else if (request.type == "setTimeIframe") {
            chrome.tabs.executeScript({code: "var time = " + request.time + ";", allFrames: true}, function () {
                chrome.tabs.executeScript({file: 'iframesettime.js', allFrames: true});
            });
        }
        return true;
    }
);

function createTab (url) {
    return new Promise(resolve => {
        chrome.tabs.create({url}, async tab => {
            chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
                if (info.status === 'complete' && tabId === tab.id) {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve(tab);
                }
            });
        });
    });
}