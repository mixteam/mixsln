define("#mix/sln/0.1.0/components/xScroll-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/scroll-debug", "mix/sln/0.1.0/components/xBase-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Scroll = require("mix/sln/0.1.0/modules/scroll-debug"), xBase = require("mix/sln/0.1.0/components/xBase-debug"), xName = "x-scroll", className = xName, xScroll = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module;
            that._scroller = new Scroll(module);
        },
        enable: function() {
            var that = this, scroller = that._scroller;
            scroller.enable();
        },
        disable: function() {
            var that = this, scroller = that._scroller;
            scroller.disable();
        },
        getViewport: function() {
            return this._scroller.getElement();
        }
    });
    return xScroll;
});