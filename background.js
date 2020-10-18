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
            chrome.tabs.create({'url': request.url}, function (tab) {
                let ran = false;
                function listener(tabId, changeInfo, tab, ran) {
                    // make sure the status is 'complete' and it's the right tab
                    console.log("Ran: " + ran);
                    if (ran == false && tabId === tab.id && changeInfo.status == 'complete') {
                        ran = true;
                        console.log("Ran: " + ran);
                        chrome.tabs.sendMessage(tab.id, {type: "setTime", time: request.time}, function (response) {
                            console.log("set time!");
                        });
                    }
                };
                chrome.tabs.onUpdated.addListener(listener);
            });
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