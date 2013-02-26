define("#mix/sln/0.1.0/components/xTransition-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/transform-debug", "mix/sln/0.1.0/components/xBase-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, transform = require("mix/sln/0.1.0/modules/transform-debug");
    xBase = require("mix/sln/0.1.0/components/xBase-debug"), xName = "x-transition", 
    className = xName, xTransition = xBase.create(xName, className, {
        Implements: Message,
        init: function() {
            var that = this, module = that._module, orginHtml = module.innerHTML, activePort, inactivePort;
            Message.prototype.initialize.call(that, "transition");
            activePort = that._activePort = doc.createElement("div");
            inactivePort = that._inactivePort = doc.createElement("div");
            activePort.className = "active";
            inactivePort.className = "inactive";
            activePort.innerHTML = orginHtml;
            module.innerHTML = "";
            module.appendChild(activePort);
            module.appendChild(inactivePort);
        },
        getViewport: function() {
            var that = this;
            return that._activePort;
        },
        action: function(type) {
            var that = this, isEnabled = that._isEnabled, module = that._module, lastActivePort = that._activePort, activePort = that._inactivePort, originX, originY;
            that._activePort = activePort;
            that._inactivePort = lastActivePort;
            activePort.innerHTML = "";
            if (isEnabled) {
                originY = transform.getY(module);
                originX = (type === "forward" ? "-" : "") + "33.33%";
                transform.start(module, "0.4s", "ease", 0, originX, originY, function() {
                    module.style.webkitTransform = transform.getTranslate(0, 0);
                    activePort.className = "active";
                    lastActivePort.className = "inactive";
                    that.trigger(type + "TransitionEnd");
                });
            } else {
                activePort.className = "active";
                lastActivePort.className = "inactive";
            }
        },
        forward: function() {
            this.action("forward");
        },
        backward: function() {
            this.action("backward");
        }
    });
    return xTransition;
});