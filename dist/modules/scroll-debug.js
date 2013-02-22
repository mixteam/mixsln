define("#mix/sln/0.1.0/modules/scroll-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/sln/0.1.0/modules/gesture-debug", "mix/sln/0.1.0/modules/transform-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("mix/sln/0.1.0/modules/gesture-debug"), transform = require("mix/sln/0.1.0/modules/transform-debug"), prevented = false;
    function getMaxScrollTop(el) {
        var parentEl = el.parentNode, parentStyle = getComputedStyle(parentEl);
        var maxTop = 0 - el.scrollHeight + parentEl.offsetHeight - parseInt(parentStyle.paddingTop) - parseInt(parentStyle.paddingBottom);
        if (maxTop > 0) maxTop = 0;
        return maxTop;
    }
    var Scroll = Class.create({
        initialize: function(element) {
            var that = this;
            that._el = element;
            that._gesture = new Gesture(element);
            that._originalY = null;
            that._currentY = null;
            that._preventBodyTouch = that._preventBodyTouch.bind(that);
            that._onTouchStart = that._onTouchStart.bind(that);
            that._onPanStart = that._onPanStart.bind(that);
            that._onPan = that._onPan.bind(that);
            that._onPanEnd = that._onPanEnd.bind(that);
            that._onFlick = that._onFlick.bind(that);
            if (!prevented) {
                prevented = true;
                doc.body.addEventListener("touchmove", that._preventBodyTouch, false);
            }
        },
        getElement: function() {
            return this._el;
        },
        enable: function() {
            var that = this, el = that._el;
            that._gesture.enable();
            el.addEventListener("touchstart", that._onTouchStart, false);
            el.addEventListener("panstart", that._onPanStart, false);
            el.addEventListener("pan", that._onPan, false);
            el.addEventListener("panend", that._onPanEnd, false);
            el.addEventListener("flick", that._onFlick, false);
        },
        disable: function() {
            var that = this, el = that._el;
            that._gesture.disable();
            el.removeEventListener("touchstart", that._onTouchStart);
            el.removeEventListener("panstart", that._onPanStart);
            el.removeEventListener("pan", that._onPan);
            el.removeEventListener("panend", that._onPanEnd);
            el.removeEventListener("flick", that._onFlick);
        },
        _preventBodyTouch: function(e) {
            e.preventDefault();
            return false;
        },
        _onTouchStart: function(e) {
            var that = this, el = that._el;
            el.style.webkitTransition = "none";
            el.style.webkitTransform = getComputedStyle(el).webkitTransform;
            el.style.height = "auto";
            el.style.height = el.offsetHeight + "px";
        },
        _onPanStart: function(e) {
            var that = this, el = that._el;
            that._originalY = transform.getY(el);
        },
        _onPan: function(e) {
            var that = this, el = that._el, maxScrollTop = getMaxScrollTop(el), originalY = that._originalY, currentY;
            currentY = that._currentY = originalY + e.displacementY;
            if (currentY > 0) {
                el.style.webkitTransform = transform.getTranslate(0, currentY / 2);
            } else if (currentY < maxScrollTop) {
                el.style.webkitTransform = transform.getTranslate(0, (maxScrollTop - currentY) / 2 + currentY);
            } else {
                el.style.webkitTransform = transform.getTranslate(0, currentY);
            }
        },
        _onPanEnd: function(e) {
            var that = this, el = that._el, currentY = that._currentY, maxScrollTop = getMaxScrollTop(el), translateY = null;
            if (currentY > 0) {
                translateY = 0;
            }
            if (currentY < maxScrollTop) {
                translateY = maxScrollTop;
            }
            if (translateY != null) {
                transform.start(el, "0.4s", "ease-out", "0s", 0, translateY);
            }
        },
        _onFlick: function(e) {
            var that = this, el = that._el, currentY = that._currentY, maxScrollTop = getMaxScrollTop(el);
            if (currentY < maxScrollTop || currentY > 0) return;
            var s0 = transform.getY(el), v0 = e.valocityY;
            if (v0 > 1.5) v0 = 1.5;
            if (v0 < -1.5) v0 = -1.5;
            var a = .0015 * (v0 / Math.abs(v0)), t = v0 / a, s = s0 + t * v0 / 2;
            if (s > 0 || s < maxScrollTop) {
                var sign = s > 0 ? 1 : -1, edge = s > 0 ? 0 : maxScrollTop;
                s = edge;
                t = (sign * Math.sqrt(2 * a * (s - s0) + v0 * v0) - v0) / a;
                v = v0 - a * t;
                transform.start(el, t.toFixed(0) + "ms", "cubic-bezier(" + transform.getBezier(-v0 / a, -v0 / a + t) + ")", "0s", 0, s.toFixed(0), function() {
                    v0 = v;
                    s0 = s;
                    a = .0045 * (v0 / Math.abs(v0));
                    t = v0 / a;
                    s = s0 + t * v0 / 2;
                    transform.start(el, t.toFixed(0) + "ms", "cubic-bezier(" + transform.getBezier(-t, 0) + ")", "0s", 0, s.toFixed(0), function() {
                        transform.start(el, "0.4s", "ease-out", "0s", 0, edge);
                    });
                });
            } else {
                transform.start(el, t.toFixed(0) + "ms", "cubic-bezier(" + transform.getBezier(-t, 0) + ")", "0s", 0, s.toFixed(0));
            }
        }
    });
    return Scroll;
});