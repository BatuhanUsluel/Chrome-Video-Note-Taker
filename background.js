// background.js


chrome.browserAction.onClicked.addListener(function(tab){
    chrome.tabs.sendMessage(tab.id, {type: "toggle"});
});

// Called when the user clicks on the browser action.
/*
chrome.browserAction.onClicked.addListener(function(tab) {
    // Send a message to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
});*/

// This block is new!
var urlTimes = {};
chrome.runtime.onMessage.addListener(
    function(request, sender) {
        console.log("in background");
        if(request.type == "newTab" ) {
            console.log("in new tab");
            chrome.tabs.create({'url': request.url}, function (tab) {
                function listener(tabId, changeInfo, tab) {
                    // make sure the status is 'complete' and it's the right tab
                    if (tabId === tab.id && changeInfo.status == 'complete') {
                        chrome.tabs.sendMessage(tab.id, {type: "setTime", time: request.time}, function (response) {
                            console.log("set time!");
                        });
                    }
                };
                chrome.tabs.onUpdated.addListener(listener);
            });
        }
        return true;
    }
);