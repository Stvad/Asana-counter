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

(function() {
    legacyMethodSetup();

    integratedMethodSetup();
})();


var runningSum = 0;
var selectedRows = {};
function integratedMethodSetup() {
    var task_rows = document.querySelectorAll('#grid tr');
    var taskObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            processRowEvent(mutation.target);
        });
    });

    function observeRow(row) {
        taskObserver.observe(row, {attributeFilter: ["class"]});
    }

    task_rows.forEach(observeRow);

    var gridObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(observeRow);
        });
    });

    gridObserver.observe($("#grid:first").children("tbody:first")[0], {childList: true});


    //id center_pane__contents
    //class column-contents-on-click-below-content
    var centerContentObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // console.log($(mutation.target));
            // console.log($(mutation.target).find("#grid"));
            var grid = $(mutation.target).find("#grid")[0];
            console.log(grid);
            gridObserver.observe(grid, {childList: true});
            rows = grid.querySelectorAll("tr");
            rows.forEach(observeRow);

            runningSum = 0;
            selectedRows = {};

        });
    });

    centerContentObserver.observe($("#center_pane__contents:first").children(".column-contents-on-click-below-content")[0],
        {childList: true});
}

function processRowEvent(row) {
    var textArea = $(row).find("textarea");
    // console.log(textArea.val());
    var isSelected = $(row).hasClass("grid-row-selected");
    //console.log("isSelected: ", isSelected);
    taskNum = getNumberFromTaskName(textArea.val());
    dictKey = row.id;
    if (dictKey in selectedRows) {
        if (isSelected) {
            // handles the case when we change the value on the task, while it has stayed selected
            var diff = taskNum - selectedRows[dictKey];
            selectedRows[dictKey] += diff;
            runningSum += diff;
        }
        else {
            runningSum -= selectedRows[dictKey];
            delete selectedRows[dictKey];
        }
    } else if (!(dictKey in selectedRows) && isSelected) {
        selectedRows[dictKey] = taskNum;
        runningSum += taskNum;
    }
    // console.log(runningSum);
    if (Object.keys(selectedRows).length > 1) {
        displayResult(runningSum);
    }
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
    var myRegexp = /\[((?:-|\+)?(\d+|\d+\.\d+))\]/g;
    try {
        var match = myRegexp.exec(taskName);
        return parseFloat(match[1]);
    } catch (err) {
        return 0;
    }
}

function legacyMethodSetup() {
    Mousetrap(document.body).bind(['command+k', 'ctrl+k'], function(e) {
        alert(getTotalCount());
        return false;
    });
}

function getTotalCount(){
    var hours=0;
    $(".TaskList").find(".itemRow").add(
        $("#grid").find("tr")).each(function (i, row) {
        hours += getNumberFromRow(row);
    });

    return hours;
}

function getNumberFromRow(row) {
    if ($(row).is(".grid-row-selected,.itemRow--highlighted,.itemRow--focused")) {
        return getNumberFromTaskName($(row).find("textarea").val());
    }
    return 0;
}
