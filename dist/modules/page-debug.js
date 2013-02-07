define("#mix/sln/0.1.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton;
    var AppPage = Class.create({
        Implements: Message,
        initialize: function(name, options) {
            var that = this;
            Message.prototype.initialize.call(this, "app." + name);
            that._appname = name;
            that._isReady = false;
            that._bindRoutes(options.routes);
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
        _bindRoutes: function(routes) {
            var that = this, appname = that._appname;
            Object.each(routes, function(route, routeName) {
                var routeText = route.text, routeCallback = route.callback;
                if (routeName === "default") {
                    route["default"] = true;
                }
                route.callback = function() {
                    if (Object.isTypeof(routeCallback, "string")) {
                        routeCallback = that[routeCallback];
                    }
                    if (!that._isReady) {
                        that.once("ready", function() {
                            routeCallback.apply(that, arguments);
                        });
                    } else {
                        routeCallback.apply(that, arguments);
                    }
                };
                navigate.addRoute(appname + "." + routeName, routeText, route);
            });
        },
        ready: function(state) {},
        unload: function() {}
    });
    return AppPage;
});