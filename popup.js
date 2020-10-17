document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('takeNote');
    checkPageButton.addEventListener('click', function() {
        takeNote();
    }, false);
}, false);

function takeNote() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {type: "takeNote", note: document.getElementById("noteTextArea").value}, function (response) {
            console.log(response)
        });
    });
}