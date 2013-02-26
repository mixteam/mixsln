define("#mix/sln/0.1.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, STATUS = {
        UNKOWN: 0,
        UNLOADED: 0,
        READY: 1,
        COMPILED: 2
    }, AppPage = Class.create({
        Implements: Message,
        initialize: function(options) {
            var that = this, name = that.name;
            Message.prototype.initialize.call(that, "app." + name);
            that._options = options;
            that.status = STATUS.UNKOWN;
            that.ready = that.ready.bind(that);
            that.unload = that.unload.bind(that);
            that.on("ready", that.ready);
            that.on("unloaded", that.unload);
        },
        getTitle: function() {
            //can overrewite
            return this.title;
        },
        loadTemplate: function(url, callback) {
            // can overwrite
            var that = this;
            if (arguments.length === 1) {
                callback = arguments[0];
                url = that.template;
            }
            url && app.loadFile(url, callback);
        },
        compileTemplate: function(text, callback) {
            // can overwrite
            var that = this, engine;
            if (engine = win["Mustache"]) {
                that.compiledTemplate = engine.compile(text);
                callback(that.compiledTemplate);
            }
        },
        renderTemplate: function(datas, callback) {
            // can overwrite
            var that = this, compiledTemplate = that.compiledTemplate, content = compiledTemplate(datas);
            callback(content);
        },
        ready: function(navigation) {},
        unload: function() {}
    });
    AppPage.STATUS = STATUS;
    return AppPage;
});