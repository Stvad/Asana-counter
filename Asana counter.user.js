// ==UserScript==
// @name        Asana counter
// @namespace   test
// @description Asana counter
// @include     https://app.asana.com/*
// @version     1
// @grant       none
// @run-at      document-end
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// @require     https://craig.global.ssl.fastly.net/js/mousetrap/mousetrap.min.js
// @require     https://raw.githubusercontent.com/uzairfarooq/arrive/master/minified/arrive.min.js
// ==/UserScript==

var runningSum = 0;
var selectedRows = {};

(function() {
    legacyMethodSetup();

    integratedMethodSetup();
})();

function integratedMethodSetup() {
    var task_rows = document.querySelectorAll("#grid tr,.TaskList .ItemRow");
    var taskObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            processRowEvent(mutation.target);
        });
    });

    function observeRow(row) {
        //this contraption needed to accomodate 2 types of rows that we can receive //tr and .ItemRow
        taskObserver.observe($(row).find(".ItemRow").addBack()[0], {attributeFilter: ["class"]});
    }

    task_rows.forEach(observeRow);

    $("#center_pane__contents:first .column-contents-on-click-below-content").
    arrive("#grid tr,.TaskList .ItemRow", function (newElement) {
        observeRow(newElement);
    });

    $("#center_pane__contents:first .column-contents-on-click-below-content").
    arrive("#grid,.TaskList", function (newElement) {
        // When change project/view - deselection is not happening, so we need to cleanup ourselves.
        runningSum = 0;
        selectedRows = {};
    });

}

function processRowEvent(row) {
    var textArea = $(row).find("textarea");
    // console.log(textArea.val());
    var isSelected = $(row).is(".grid-row-selected,.ItemRow--highlighted,.ItemRow--focused");
    // console.log("isSelected: ", isSelected);
    taskNum = getNumberFromTaskName(textArea.val());
    dictKey = textArea[0].id;
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
    var panelTitle = $("#right_pane.multi-selected .header-name,.MultiTaskTitleRow .MultiTaskTitleRow-titleText")[0];
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
    $(".TaskList .ItemRow, #grid tr").each(function (i, row) {
        hours += getNumberFromRow(row);
    });

    return hours;
}

function getNumberFromRow(row) {
    if ($(row).is(".grid-row-selected,.ItemRow--highlighted,.ItemRow--focused")) {
        return getNumberFromTaskName($(row).find("textarea").val());
    }
    return 0;
}
