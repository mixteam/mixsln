(function(win, app) {
    var doc = win.document;
    app.page.fn.loadTemplate = function(url, callback) {
        var that = this;
        if (arguments.length === 1) {
            callback = arguments[0];
            url = that.template || that.templates;
        }
        callback(url);
    };
    app.plugin.inlineTemplate = true;
})(window, window["app"]);