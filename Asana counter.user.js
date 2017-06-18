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

//todo - new entries
//todo - loading of additional entries

var runningSum = 0;
var selectedRows = {};
(function() {
    Mousetrap.bind(['command+k', 'ctrl+k'], function(e) {
        //console.log("whee");
        //console.log(getTotalHours());
        alert(getTotalHours());
        return false;
    });
    
    Mousetrap.bind(['ctrl+m'], function(e) {
        alert(runningSum);
        return false;
    });

    var task_row = document.querySelectorAll('#grid tr');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "class") {
                //console.log("mutation target: ", mutation.target);
                var textArea = $(mutation.target).find("textarea");
                console.log(textArea.val());
                var isSelected = mutation.target.classList.contains('grid-row-selected');
                console.log("isSelected: ", isSelected);
                taskNum = getNumberFromTaskName(textArea.val());
                dictKey = textArea.val();//todo
                if ((dictKey in selectedRows) && !isSelected) {
                    delete selectedRows[dictKey];
                    runningSum -= taskNum;
                    //console.log('removing ' + textArea.id);
                } else if (!(dictKey in selectedRows) && isSelected) {
                    selectedRows[dictKey] = true;
                    runningSum += taskNum;
                    //console.log('adding ' + dictKey);
                }
                console.log(runningSum);
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
            console.log(mutation);
            mutation.addedNodes.forEach(function (row) {
                observer.observe(row,  {
                    attributes: true
                });
            });
        });
    });
    
    gridObserver.observe($("#grid:first").children("tbody:first")[0], {childList: true});
    //*/
    /*
    $("#grid").onCreate(".task-row .grid-cell", 
                        function(elements){
        elements.forEach(function(row) {
            observer.observe(row,{
                attributes: true
            });
        });
    }, multi = true);
    */

    //    var taskName =$(row).find("textarea").val();
 
    
})();

function displayResult(resultNumber) {
    //console.log($("#right_pane.multi-selected").find(".header-name")[0].textContent);
    var panelTitle = $("#right_pane.multi-selected").find(".header-name")[0];
    if (!panelTitle) {
        return;
    }
    var currentTitle = panelTitle.textContent;//$("#right_pane.multi-selected").find(".header-name")[0].textContent; //$(".details-pane-title")[0].children[0].textContent;
    var subStringEnd = currentTitle.indexOf("[");
    if (subStringEnd === -1) {
        subStringEnd = currentTitle.length;
    }
    panelTitle.textContent = currentTitle.substring(0, subStringEnd) +" ["+resultNumber+"]";
}

/*
window.setInterval(function(){

    if ($("#project_notes").length>0)
    {
      if ($("#scify-hours").length===0)
            $(getTemplate()).insertAfter("#project_notes .loading-boundary");     

        $("#scify-hours").find(".total").text(getTotalHours());    
      getHoursPerName();
    }

    //console.log(getTotalHours());



},2000);
*/

function getNumberFromTaskName(taskName) {
    var myRegexp = /\[(\d+|\d+\.\d+)\]/g;
    try {
        var match = myRegexp.exec(taskName);
        //console.log(match[1]);
        return parseFloat(match[1]);
    } catch (err) {
        return 0;
    }
}

function getTotalHours(){
    var hours=0;
    $("#grid").find("tr").each(function(i,row){
        var textArea = $(row).find("textarea");
        var taskName = textArea.val();   
        if (!$(row).hasClass("grid-row-selected")) {
            return true;
        }

        //console.log(taskName);
        
        hours += getNumberFromTaskName(taskName);

        /*
        textArea.select(function(){
            // does not work as expected on multiselect (asana generates multiple select events for last value?)
            // another problem - new values when you scroll (if you don't add handlers regularly)

            //option - when side panel with multiple things selected is visible - do full count loop and then on any select or blur do full count loop
            console.log(taskName+ " selected");
            runningSum += currentNum;
            console.log("sum "+ runningSum);
        });

        textArea.blur(function() {
            runningSum -= currentNum;
        });

        //console.log(getEventsList($(row)));
        //console.log($._data( $(row), "events" ));
        textArea.on(getEventsList(textArea), function(e) {
            console.log(e);
        });
        */

    });
    return hours;
}




