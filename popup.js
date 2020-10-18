document.addEventListener('DOMContentLoaded', function() {
    viewNotes();
    var checkPageButton = document.getElementById('takeNote');
    checkPageButton.addEventListener('click', function() {
        takeNote();
    }, false);
    var addCategoryButton = document.getElementById('newCategoryButton');
    addCategoryButton.addEventListener('click', function() {
        addCategory();
    }, false);
}, false);

function takeNote() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        var e = document.getElementById("Categories");
        var category = e.options[e.selectedIndex].text;
        chrome.tabs.sendMessage(activeTab.id, {type: "takeNote", note: document.getElementById("noteTextArea").value, category: category}, function (response) {
            console.log(response);
            document.getElementById("noteTextArea").value = "";
            viewNotes();
        });
    });
}

function viewNotes() {
    console.log("loading notes");
    chrome.extension.getBackgroundPage().console.log("loading notes");
    chrome.storage.local.get('notes', function (result) {
        chrome.storage.local.get('categories', function (cat) {
            console.log(result);
            var categories = cat.categories
            var mainDiv = document.getElementsByClassName("notesDiv")[0];
            mainDiv.textContent = '';
            var drop = document.getElementById("Categories");
            drop.textContent = '';
            for (var i = 0; i<categories.length; i++) {
                //Select category dropdowns
                var option = document.createElement("option");
                option.value = categories[i];
                option.innerHTML = categories[i];
                drop.appendChild(option);

                //View category dropdowns
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

                var category  = result.notes[i].category;
                console.log(category);
                //var category = "Math"; //FOR TESTING, REMOVE
                var index = categories.indexOf(category);
                console.log(index);

                if (index!=-1) {
                    tables[index].appendChild(row);
                } else {
                    tables[categories.length].appendChild(row);
                }
            }

            //Go trough every table. Append the table to the corresponding div in buttons
            for (var i = 0; i<categories.length; i++) {
                var divs = document.getElementsByClassName("panel")[i];
                console.log(tables[i]);
                divs.appendChild(tables[i]);
            }
        });
    });
}

function addCategory() {
    console.log("adding category");
    var category = document.getElementById("newCategory").value;

    var drop = document.getElementById("Categories");
    var option = document.createElement(category);
    option.value = category;
    option.innerHTML = category;
    drop.appendChild(option);

    document.getElementById("newCategory").value = "";
    chrome.storage.local.get({categories: []}, function (result) {
        // the input argument is ALWAYS an object containing the queried keys
        // so we select the key we need
        console.log("IN FUNCTION");
        console.log(result.categories);
        var notesVar = result.categories;
        notesVar.push(category);
        // set the new array value to the same key
        chrome.storage.local.set({categories: notesVar}, function () {
            // you can use strings instead of objects
            // if you don't  want to define default values
            chrome.storage.local.get('categories', function (result) {
                console.log(result)
            });
        });
    });
    viewNotes();
    return true;
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