define("#mix/sln/0.1.0/modules/transition-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/sln/0.1.0/modules/transform-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), transform = require("mix/sln/0.1.0/modules/transform-debug");
    var STYLE = {
        element: {
            position: "relative",
            "-webkit-backface-visibility": "hidden",
            "-webkit-transform-style": "preserve-3d"
        },
        activePort: {
            display: "block",
            "-webkit-box-sizing": "border-box",
            width: "33.33%",
            position: "relative",
            left: "33.33%"
        },
        notActivePort: {
            display: "none",
            "-webkit-box-sizing": "border-box",
            width: "33.33%",
            position: "relative",
            left: "33.33%"
        }
    };
    Object.each(STYLE, function(styles, key) {
        var cssText = "";
        Object.each(styles, function(value, name) {
            cssText += name + ":" + value + ";";
        });
        STYLE[key].cssText = cssText;
    });
    var Transition = Class.create({
        Implements: Message,
        initialize: function(element) {
            var that = this;
            Message.prototype.initialize.call(that, "transition");
            that._el = element;
            that._activePort = doc.createElement("div");
            that._notActivePort = doc.createElement("div");
            element.style.cssText = STYLE.element.cssText;
            that._activePort.style.cssText = STYLE.activePort.cssText;
            that._notActivePort.style.cssText = STYLE.notActivePort.cssText;
        },
        getElement: function() {
            return this._el;
        },
        getActivePort: function() {
            return this._activePort;
        },
        getNotActivePort: function() {
            return this._notActivePort;
        },
        enable: function() {
            var that = this, el = that._el, activePort = that._activePort, notActivePort = that._notActivePort, orginHtml = el.innerHTML;
            el.innerHTML = "";
            el.style.width = "300%";
            el.style.left = "-100%";
            el.appendChild(activePort);
            el.appendChild(notActivePort);
            activePort.innerHTML = orginHtml;
        },
        disable: function() {
            var that = this, el = that._el, activePort = that._activePort, notActivePort = that._notActivePort, orginHtml = activePort.innerHTML;
            activePort.innerHTML = "";
            notActivePort.innerHTML = "";
            el.removeChild(activePort);
            el.removeChild(notActivePort);
            el.style.width = "100%";
            el.style.left = "0";
            el.innerHTML = orginHtml;
        },
        forward: function() {
            var that = this, el = that._el, lastActivePort = that._activePort, activePort = that._notActivePort, originX, originY;
            that._activePort = activePort;
            that._notActivePort = lastActivePort;
            originY = transform.getY(el);
            originX = "-33.33%";
            transform.start(el, "0.4s", "ease", 0, originX, originY, function() {
                el.style.webkitTransform = transform.getTranslate(0, 0);
                activePort.style.display = "block";
                lastActivePort.style.display = "none";
                that.trigger("forwardTransitionEnd");
            });
        },
        backward: function() {
            var that = this, el = that._el, lastActivePort = that._activePort, activePort = that._notActivePort, originX, originY;
            that._activePort = activePort;
            that._notActivePort = lastActivePort;
            originY = transform.getY(el);
            originX = "33.33%";
            transform.start(el, "0.4s", "ease", 0, originX, originY, function() {
                el.style.webkitTransform = transform.getTranslate(0, 0);
                activePort.style.display = "block";
                lastActivePort.style.display = "none";
                that.trigger("backwardTransitionEnd");
            });
        }
    });
    return Transition;
});