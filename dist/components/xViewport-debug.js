define("#mix/sln/0.1.0/components/xViewport-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/util-debug", "mix/sln/0.1.0/components/xBase-debug", "mix/sln/0.1.0/components/xTitlebar-debug", "mix/sln/0.1.0/components/xScroll-debug", "mix/sln/0.1.0/components/xTransition-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, util = require("mix/core/0.3.0/base/util-debug").singleton, xBase = require("mix/sln/0.1.0/components/xBase-debug"), xTitlebar = require("mix/sln/0.1.0/components/xTitlebar-debug"), xScroll = require("mix/sln/0.1.0/components/xScroll-debug"), xTransition = require("mix/sln/0.1.0/components/xTransition-debug"), xName = "x-viewport", className = xName, xViewport = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module, header, section, footer, subport;
            that._isEnableTitlebar = false;
            that._isEnableScroll = false;
            that._isEnableTransition = false;
            header = doc.createElement("header");
            section = doc.createElement("section");
            footer = doc.createElement("footer");
            subport = doc.createElement("div");
            section.appendChild(subport);
            module.appendChild(header);
            module.appendChild(section);
            module.appendChild(footer);
        },
        enable: function() {
            var that = this, module = that._module, header = module.querySelector("header"), subport = module.querySelector("section > div");
            that._isEnableTitlebar = util.str2val(module.getAttribute("enableTitlebar"));
            that._isEnableScroll = util.str2val(module.getAttribute("enableScroll"));
            that._isEnableTransition = util.str2val(module.getAttribute("enableTransition"));
            if (that._isEnableTitlebar) {
                module.className += " enableTitlebar";
                that.xtitlebar = xTitlebar.create(header);
                that.xtitlebar.enable();
            }
            if (that._isEnableScroll) {
                module.className += " enableScroll";
                that.xscroll = xScroll.create(subport);
                that.xscroll.enable();
            }
            if (that._isEnableTransition) {
                module.className += " enableTransition";
                that.xtransition = xTransition.create(subport);
                that.xtransition.enable();
            }
        },
        disable: function() {
            var that = this, xscroll = that.xscroll, xtransition = that.xtransition;
            xscroll && xscroll.disable();
            xtransition && xtransition.disable();
        },
        getViewport: function() {
            var that = this, module = that._module;
            if (that._isEnableTransition) {
                return that.xtransition.getViewport();
            } else if (that._isEnableScroll) {
                return that.xscroll.getViewport();
            } else {
                return module.querySelector("section > div");
            }
        }
    });
    return xViewport;
});