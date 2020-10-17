document.addEventListener('DOMContentLoaded', function() {
    viewNotes();
    var checkPageButton = document.getElementById('takeNote');
    checkPageButton.addEventListener('click', function() {
        takeNote();
    }, false);
}, false);

function takeNote() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {type: "takeNote", note: document.getElementById("noteTextArea").value}, function (response) {
            console.log(response);
            document.getElementById("noteTextArea").value = "";
            viewNotes();
        });
    });
}

function viewNotes() {
    console.log("loading notes");
    chrome.storage.local.get('notes', function (result) {
        console.log(result.notes);
        var mainDiv = document.getElementsByTagName("div")[0];
        var categories = ['Math','Youtube'];

        for (var i = 0; i<categories.length; i++) {
            //Create category dropdowns
            var btn = document.createElement("BUTTON");
            btn.classList.add('accordion');
            btn.innerHTML = categories[i];


            var div = document.createElement("div");
            div.classList.add('panel');

            var p = document.createElement("p");
            mainDiv.appendChild(btn);
            mainDiv.appendChild(div);

            btn.addEventListener("click", function() {
                /* Toggle between adding and removing the "active" class,
                to highlight the button that controls the panel */
                this.classList.toggle("active");
                /* Toggle between hiding and showing the active panel */
                var panel = this.nextElementSibling;
                if (panel.style.display === "block") {
                    panel.style.display = "none";
                } else {
                    panel.style.display = "block";
                }
            });
        }
        //------------------------------------------------------------------//

        // get the reference for the body
        var body = document.getElementsByTagName("body")[0];

        //Tables for categories
        var tables = [];
        for (var i = 0; i<categories.length; i++) {
            // creates a <table> element and a <tbody> element
            var tbl = document.createElement("table");
            var tblBody = document.createElement("tbody");
            // put the <tbody> in the <table>
            tbl.appendChild(tblBody);
            tables.push(tbl);
        }

        //Table for category not present
        var tbl = document.createElement("table");
        var tblBody = document.createElement("tbody");
        tbl.appendChild(tblBody);
        tables.push(tbl);

        // creating all cells
        for (let i = result.notes.length-1; i >= 0 ; i--) {

            // creates a table row
            var row = document.createElement("tr");
            var cellImg = document.createElement("td");
            var cell = document.createElement("td");

            var cellText = document.createTextNode(result.notes[i].text);

            var img = document.createElement("img");
            img.setAttribute("src","play.png");
            img.style.width = '20%'
            img.style.height = 'auto'
            img.onclick = function() {
                console.log("CLICKED IMAGE");
                console.log(i);
                goToVideo(i);
            }

            var a = document.createElement('a');
            a.href = "#";
            a.appendChild(cellImg);

            cellImg.appendChild(img);

            cell.appendChild(cellText);
            row.appendChild(a);
            row.appendChild(cell);

            //var category  = result.notes[i].category;
            var category = "Math"; //FOR TESTING, REMOVE
            var index = categories.indexOf(category);

            if (index!=-1) {
                tables[index].appendChild(row);
            } else {
                tables[categories.length].appendChild(row);
            }
        }

        //Go trough every table. Append the table to the corresponding div in buttons
        for (var i = 0; i<categories.length; i++) {
            var div = document.getElementsByClassName("panel")[i];
            div.appendChild(tables[i]);
        }

        var prevTable = document.getElementsByTagName("table")[0];
        prevTable.remove();

        // appends <table> into <body>
        body.appendChild(tbl);
        // sets the border attribute of tbl to 2;
        tbl.setAttribute("style", "text-align: left; padding: 15px");

    });
}

function goToVideo(i) {
    chrome.storage.local.get('notes', function (result) {
        var note = result.notes[i];
        var url = note.url;
        var time = note.time;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {type: "getURL"}, function (response) {
                console.log("CURRENT URL: " + response);
                console.log("NOTE URL: " + url);
                if (response===url) {
                    chrome.tabs.sendMessage(activeTab.id, {type: "setTime", time: time});
                } else {
                    console.log("calling background");
                    chrome.runtime.sendMessage({type: "newTab", url: url, time: time});
                }
            });
        });
    });
}