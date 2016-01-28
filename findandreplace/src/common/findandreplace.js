// ==UserScript==
// @name findandreplace
// @include http://*
// @include https://*
// ==/UserScript==
// *TODO only log once
// publish
// *delete element
// *instructions
// *icons
// *updated message
// validation
/* turn on debugging by adding debugFindAndReplace=true to the query string */
(function () {

    var debug = false;

    var getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var log = function (msg) {
        if (debug) {
            if (typeof msg === 'string') {
                msg = "findandreplace: " + msg;
            }
            console.log(msg);
        }
    };

    var logged = [];

    var replace = function (item) {

        var refresh = 300;

        var startingNode = item.startingNode ? document.getElementById(item.startingNode) : document.documentElement;

        var process = function () {
            var res = document.evaluate(item.path, startingNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (res) {
                if (logged.indexOf(item) == -1) {
                    log("Xpath hit:");
                    log(item);
                    log("Items to replace:");
                    log(res);
                    logged.push(item);
                }
                for (var i = 0, len = res.snapshotLength; i < len; i++) {
                    if (item.remove){
                        res.snapshotItem(i).style.display = "none";
                    } else {
                        res.snapshotItem(i).textContent = item.replacement;
                    }
                }

            }
        };

        setInterval(process, refresh);
    };

    if (getParameterByName("debugFindAndReplace")){
        debug = true;
    }

    kango.invokeAsync("kango.storage.getItem", "options", function (items) {
        var url = window.location.href;
        items = JSON.parse(items);
        for (i = 0; i < items.length; i++) {
            if (items[i].urlMatch) {
                if (new RegExp(items[i].urlMatch).exec(url)) {
                    log("URL matched:");
                    log(items[i]);
                    replace(items[i]);
                }
            }
        }
    });

})();
