chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    console.log(msg);
    if (msg.type == "toggle") {
        console.log("toggle");
        toggle();
    }

    if (msg.type == "takeNote") {
        console.log("takeNote");
        takeNote2(msg, sendResponse);
        return true;
    }

    if (msg.type == "getURL") {
        sendResponse(getURL());
    }

    if (msg.type == "setTime") {
        console.log("going to set time");
        setTime(msg.time);
    }

    return true;
    }
);

var iframe = document.createElement('iframe');
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

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
    }
    else{
        iframe.style.width="0px";
    }
}

function takeNote(request, sendResponse, time) {
    console.log("In takenote");
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
        console.log("INSIDE CONTENT RETURN DATA:");
        console.log(response);
        for (var i = 0; i<response.length; i++) {
            if (response[i] !== null) {
                console.log("Returning time");
                console.log(response[i]);
                takeNote(request, sendResponse, response[i]);
                return true;
            }
        }
    });
}

//Have to do a similar thing with settime by searching iframes. Or can save the iframe of where it is at? But that just adds more complexity probably.
function setTime(time) {
    console.log("GOING TO SET TIME FOR THIS TAB");
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