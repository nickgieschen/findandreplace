var findAndReplaceOptions = function () {

    var kangoReady;
    var domReady;
    // turn on debugging by adding debugFindAndReplace=true to the query string
    var debug = false;
    var template = $("#itemTemplate").html();
    var status;

    var kangoWrapper = {
        getItem: function (name, fn) {
            kango.invokeAsync('kango.storage.getItem', name, fn);
        },
        setItem: function (name, value, fn) {
            kango.invokeAsync('kango.storage.setItem', name, value, fn);
        },
        clear: function () {
            kango.invokeAsync('kango.storage.clear');
        },
        setReadyEvent: function () {
            KangoAPI.onReady(function () {
                kangoReady = true;
                if (domReady) {
                    init();
                }
            });
        }
    };

    var center = function (el) {
        el.css("position", "absolute");
        el.css("top", Math.max(0, (($(window).height() - el.outerHeight()) / 2) +
                $(window).scrollTop()) + "px");
        el.css("left", Math.max(0, (($(window).width() - el.outerWidth()) / 2) +
                $(window).scrollLeft()) + "px");
    };

    var getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var test = function () {

        var mock = function (prefix) {
            return {
                urlMatch: "//Users/nick/fo.*?",
                path: "//Users/nick.*?",
                replacement: prefix + "3",
                remove: true,
                startingNode: prefix + "4"
            };
        };

        kangoWrapper.getItem = function (name, fn) {
            fn(JSON.stringify([mock("a"), mock("b")]));
        };

        kangoWrapper.setItem = function (name, value, fn) {
            log("setting " + name + " as " + value);
            fn();
        };

        kangoWrapper.setReadyEvent = function () {
            kangoReady = true
        };
    };

    var log = function (msg) {
        if (debug) {
            if (typeof msg === 'string') {
                msg = "findandreplace: " + msg;
            }
            console.log(msg);
        }
    };

    var addFormSection = function (data, pageLoad) {

        var list = $("#formItems");
        var tmpl = $(template);
        var sectionId = "section-" + Math.floor(Math.random() * 1000000000);

        tmpl.attr("id", sectionId);

        list.append(tmpl[0].outerHTML);

        var section = $("#" + sectionId);
        section.find("button").on("click", function () {
            section.remove();
            saveData();
        });

        section.find("input[name='remove']").first().on("click", function (value) {
            section.find("input[name='replacement']").get(0).disabled = !!this.checked;
        });

        if (data) {
            section.find("input[name='urlMatch']").get(0).value = data.urlMatch;
            section.find("input[name='pathToElement']").get(0).value = data.path;
            var replacement = section.find("input[name='replacement']").get(0);
            replacement.value = data.replacement;
            if (data.remove) {
                replacement.disabled = true;
            }
            section.find("input[name='remove']").get(0).checked = data.remove;
            section.find("input[name='startingNodeId']").get(0).value = data.startingNode;
        }

        if (!pageLoad) {
            $("html, body").animate({scrollTop: $(document).height()}, "fast");
        }
    };

    var layoutForm = function () {
        kangoWrapper.getItem("options", function (data) {
            if (!data) data = {};


            data = JSON.parse(data);

            log("Data from local storage: ");
            log(data);

            for (i = 0; i < data.length; i++) {
                addFormSection(data[i], true);
            }
        });
    };

    var showStatus = function(message){
        center(status);
        status.text(message);
        status.show();
        status.delay(3000).fadeOut("slow");
    };

    var saveData = function () {

        var values = _.map($(".section"), function (item) {
            item = $(item);
            return {
                urlMatch: item.find("input[name='urlMatch']")[0].value,
                path: item.find("input[name='pathToElement']")[0].value,
                replacement: item.find("input[name='replacement']")[0].value,
                remove: item.find("input[name='remove']")[0].checked,
                startingNode: item.find("input[name='startingNodeId']")[0].value
            };
        });

        values = JSON.stringify(values);

        log("Data to local storage:");
        log(values);

        showStatus("Saving changes...");

        kangoWrapper.setItem('options', values, function(data){
            showStatus("Changes saved")
        });
    };


    var init = function () {

        layoutForm();

        $("#form").submit(function (event) {
            saveData();
            return false;
        });
    };

    if (getParameterByName("debugFindAndReplace")) {
        debug = true;
    }

    if (getParameterByName("testFindAndReplace")) {
        test();
    }

    kangoWrapper.setReadyEvent();

    $(document).ready(function () {
        domReady = true;

        status = $("#status");

        $("#examplesLink").on("click", function () {
            $("#examplesContainer").toggle();
        });

        if (kangoReady) {
            init();
        }
    });

    return {
        addFormSection: function () {
            addFormSection(null, false);
        }
    }
}();
