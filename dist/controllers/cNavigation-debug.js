define("#mix/sln/0.1.0/controllers/cNavigation-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/page-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, AppPage = require("mix/sln/0.1.0/modules/page-debug"), pages = {}, status = AppPage.STATUS, NavigationController = Class.create({
        initialize: function(state) {
            var that = this, name = state.name.split(".");
            that.appName = name[0];
            that.routeName = name[1];
            that.state = state;
        },
        getParameter: function(name) {
            return this.state.params[name];
        },
        getArgument: function(name) {
            return this.state.args[name];
        },
        getData: function(name) {
            return this.state.datas[name];
        },
        push: function(fragment, options) {
            navigate.forward(fragment, options);
        },
        pull: function() {
            navigate.backward();
        },
        fill: function(datas, callback) {
            var page = pages[this.appName];
            function _fill() {
                page.renderTemplate(datas, function(content) {
                    app.fillViewport(content);
                    callback && callback();
                });
            }
            if (!page.compiledTemplate) {
                page.once("compiled", _fill);
            } else {
                _fill();
            }
        },
        ready: function() {
            var page = pages[this.appName];
            if (page.status < status.READY) {
                page.status = status.READY;
                page.trigger("ready", this);
            }
        },
        compile: function() {
            var page = pages[this.appName];
            function _compiled() {
                if (page.status < status.COMPILED) {
                    page.status = status.COMPILED;
                    page.trigger("compiled");
                }
            }
            if (!page.compiledTemplate) {
                page.loadTemplate(function(text) {
                    page.compileTemplate(text, function() {
                        _compiled();
                    });
                });
            } else {
                _compiled();
            }
        },
        unload: function() {
            var that = this, page = pages[that.appName];
            if (page.status > status.UNLOADED) {
                page.status = status.UNLOADED;
                page.trigger("unloaded");
            }
        }
    });
    function bindRoutes(page) {
        var name = page.name, route = page.route;
        if (Object.isTypeof(route, "string")) {
            route = {
                name: "anonymous",
                text: route
            };
        }
        navigate.addRoute(name + "." + route.name, route.text, route);
    }
    NavigationController.addPage = function(page) {
        var name = page.name, route = page.route;
        if (Object.isTypeof(route, "string")) {
            route = {
                name: "anonymous",
                text: route
            };
        }
        navigate.addRoute(name + "." + route.name, route.text, route);
        pages[name] = page;
    };
    NavigationController.getPage = function(name) {
        return pages[name];
    };
    NavigationController.listen = function(handler) {
        navigate.on("forward backward", handler);
    };
    return NavigationController;
});