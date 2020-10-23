var iframe = document.createElement('iframe');
setUpSideBar(iframe);

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    console.log(msg);
    switch(msg.type) {
        case "toggle":
            toggle();
            break;
        case "takeNote":
            takeNote2(msg, sendResponse);
            break;
        case "getURL":
            sendResponse(getURL());
            break;
        case "setTime":
            setTime(msg.time);
            break;
        default:
            console.log("Should not be here");
    }
    return true;
    }
);

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
    }
    else{
        iframe.style.width="0px";
    }
}

function takeNote(request, sendResponse, time) {
    chrome.storage.local.get({notes: []}, function (result) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        var notesVar = result.notes;
        console.log("Adding note with time: " + time);
        notesVar.push({text: request.note, time: time, url: getURL(), category: request.category});
        // set the new array value to the same key
        chrome.storage.local.set({notes: notesVar}, function () {
            // you can use strings instead of objects
            // if you don't  want to define default values
            chrome.storage.local.get('notes', function (result) {
                console.log(result.notes)
                sendResponse("DONEEEEEE");
            });
        });
    });
    return true;
}

function takeNote2(request, sendResponse) {
    getTime(request, sendResponse);
}

function getTime(request, sendResponse) {
    var vid = document.getElementsByTagName('video')[0];
    if (typeof vid !== 'undefined') {
        takeNote(request, sendResponse, vid.currentTime);
        return true;
    }
    chrome.extension.sendMessage({ type : "frames" }, function(response) {
        for (var i = 0; i<response.length; i++) {
            if (response[i] !== null) {
                takeNote(request, sendResponse, response[i]);
                return true;
            }
        }
    });
}

function setTime(time) {
    var vid = document.querySelectorAll('video')[0];
    if (typeof vid !== 'undefined') {
        vid.currentTime = time;
    }
    chrome.extension.sendMessage({type:"setTimeIframe", time: time});
    return true;
}

function getURL() {
    return location.href;
}

function setUpSideBar(iframe) {

    iframe.style.background = "green";
    iframe.style.height = "100%";
    iframe.style.width = "0px";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "9000000000000000000";
    iframe.frameBorder = "none";
    iframe.src = chrome.extension.getURL("popup.html")

    document.body.appendChild(iframe);
}