define("#mix/sln/0.1.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton;
    var AppPage = Class.create({
        Implements: Message,
        initialize: function(options) {
            var that = this, name = that.name;
            Message.prototype.initialize.call(that, "app." + name);
            that._options = options;
            that._isReady = false;
            that._bindEvents();
            that._bindRoutes();
        },
        _bindEvents: function() {
            var that = this;
            that.on("ready", function(state) {
                if (!that._isReady) {
                    that._isReady = true;
                    that.ready(state);
                }
            });
            that.on("unload", function() {
                if (that._isReady) {
                    that._isReady = false;
                    that.unload();
                }
            });
        },
        _bindRoutes: function() {
            var that = this, name = that.name, route = that.route;
            if (Object.isTypeof(route, "string")) {
                route = {
                    name: "anonymous",
                    text: route
                };
            }
            navigate.addRoute(name + "." + route.name, route.text, route);
        },
        getTitle: function() {
            return this.title;
        },
        setTitle: function(title) {
            this.title = title;
        },
        ready: function(state) {},
        unload: function() {}
    });
    return AppPage;
});