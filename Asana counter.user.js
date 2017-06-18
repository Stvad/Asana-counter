// ==UserScript==
// @name        Asana counter
// @namespace   test
// @description Asana counter
// @include     https://app.asana.com/*
// @version     1
// @grand       none
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js
// ==/UserScript==

//todo: in integrated method if you modify selected item - and then do the estimate without changing selection - changes won't be counted

(function() {
    legacyMethodSetup();

    integratedMethodSetup();
})();


var runningSum = 0;
var selectedRows = {};
function integratedMethodSetup() {
    var task_row = document.querySelectorAll('#grid tr');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "class") {
                var textArea = $(mutation.target).find("textarea");
                //console.log(textArea.val());
                var isSelected = mutation.target.classList.contains('grid-row-selected');
                //console.log("isSelected: ", isSelected);
                taskNum = getNumberFromTaskName(textArea.val());
                dictKey = mutation.target.id;
                if ((dictKey in selectedRows) && !isSelected) {
                    runningSum -= selectedRows[dictKey];
                    delete selectedRows[dictKey];
                } else if (!(dictKey in selectedRows) && isSelected) {
                    selectedRows[dictKey] = taskNum;
                    runningSum += taskNum;
                }
                //console.log(runningSum);
                if (Object.keys(selectedRows).length > 1) {
                    displayResult(runningSum);
                }
            }
        });


    });    
    task_row.forEach(function(row) {
        observer.observe(row,  {
            attributes: true
        });
    });


    var gridObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function (row) {
                observer.observe(row,  {
                    attributes: true
                });
            });
        });
    });

    gridObserver.observe($("#grid:first").children("tbody:first")[0], {childList: true});
}

function displayResult(resultNumber) {
    var panelTitle = $("#right_pane.multi-selected").find(".header-name")[0];
    if (!panelTitle) {
        return;
    }
    var currentTitle = panelTitle.textContent;
    var subStringEnd = currentTitle.indexOf("[");
    if (subStringEnd === -1) {
        subStringEnd = currentTitle.length;
    }
    panelTitle.textContent = currentTitle.substring(0, subStringEnd) +" ["+resultNumber+"]";
}



function getNumberFromTaskName(taskName) {
    var myRegexp = /\[(\d+|\d+\.\d+)\]/g;
    try {
        var match = myRegexp.exec(taskName);
        return parseFloat(match[1]);
    } catch (err) {
        return 0;
    }
}

function legacyMethodSetup() {
    Mousetrap.bind(['command+k', 'ctrl+k'], function(e) {
        alert(getTotalCount());
        return false;
    });
}

function getTotalCount(){
    var hours=0;
    $("#grid").find("tr").each(function(i,row){
        var textArea = $(row).find("textarea");
        var taskName = textArea.val();   
        if (!$(row).hasClass("grid-row-selected")) {
            return true;
        }

        hours += getNumberFromTaskName(taskName);
    });
    return hours;
}




