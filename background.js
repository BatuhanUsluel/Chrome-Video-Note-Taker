// background.js
chrome.browserAction.onClicked.addListener(function(tab){
    chrome.tabs.sendMessage(tab.id, {type: "toggle"});
});

var urlTimes = {};
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.type){
            case "newTab":
                createTab(request.url);
                break;
            case "frames":
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.executeScript({file: 'iframescript.js', allFrames: true}, function (results) {
                        sendResponse(results);
                    });
                });
                break;
            case "setTimeFrame":
                chrome.tabs.executeScript({code: "var time = " + request.time + ";", allFrames: true}, function () {
                    chrome.tabs.executeScript({file: 'iframesettime.js', allFrames: true});
                });
                break;
            default:
                console.log("Should not be here");
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