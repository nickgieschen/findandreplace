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
        //if (debug) {
            if (typeof msg === 'string') {
                msg = "findandreplace: " + msg;
            }
            console.log(msg);
        //}
    };

    var logged = [];

    /**
     *
     * @param item is an object like:
     *  {
     *      startingNode // optional string, id of element
     *      path // xpath of the search
     *      remove // boolean to indicate whether to just hide the value
     *      replacement // if not removing, what should replace the item found
     *  }
     */
    var replace = function (item, refresh, startingNode) {

        var process = function () {
            var res = document.evaluate(item.path, startingNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            if (res) {
                log(res);
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

    if (getParameterByName("debugFindAndReplace")) {
        debug = true;
    }

    // replace({
    //     startingNode: "target1",
    //     path: "//*[contains(text(), 'Bob')]",
    //     replacement: "replaced!"
    // });

    let tries = 0;
    var refresh = 300;
    const start = function() {
        try {
            console.log("starting " + tries);
            Storage.getItem("options", []).then(function (items) {
                try {
                    var url = window.location.href;
                    items = JSON.parse(items);
                    for (i = 0; i < items.length; i++) {
                        if (items[i].urlMatch) {
                           if (new RegExp(items[i].urlMatch).exec(url)) {
                                log("URL matched:");
                                log(items[i]);

                               var startingNode = items[i].startingNode ? document.getElementById(items[i].startingNode) : document.documentElement;

                               replace(items[i], refresh, startingNode);
                               setInterval(replace, items[i], refresh, startingNode);
                           }
                        }
                    }
                } catch (e){
                    log(e);
                    log("restarting, try " + tries);
                    tries++;
                    if (tries < 100) {
                        setInterval(start, 200);
                    }
                }
            });
        } catch (e) {
            log(e);
            log("restarting, try " + tries);
            tries++;
            if (tries < 100) {
                setInterval(start, 200);
            }
        }
    }();

})();
