/*
Copyright (c) 2012 Shanda Interactive Entertainment Limited

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//Enable Gesture Events on a element
//Supported GestureEvents: pan/panstart/panend,flick,tap,dualtouch,doubletap,press/pressend
define("#mix/sln/0.2.0/modules/gesture-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, events = [ "screenX", "screenY", "clientX", "clientY", "pageX", "pageY" ], Class = require("mix/core/0.3.0/base/class-debug");
    function calc(x1, y1, x2, y2, x3, y3, x4, y4) {
        var rotate = Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y2 - y1, x2 - x1), scale = Math.sqrt((Math.pow(y4 - y3, 2) + Math.pow(x4 - x3, 2)) / (Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))), translate = [ x3 - scale * x1 * Math.cos(rotate) + scale * y1 * Math.sin(rotate), y3 - scale * y1 * Math.cos(rotate) - scale * x1 * Math.sin(rotate) ];
        return {
            rotate: rotate,
            scale: scale,
            translate: translate,
            matrix: [ [ scale * Math.cos(rotate), -scale * Math.sin(rotate), translate[0] ], [ scale * Math.sin(rotate), scale * Math.cos(rotate), translate[1] ], [ 0, 0, 1 ] ]
        };
    }
    function copyEvents(type, src, copies) {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent(type, true, true);
        if (src) {
            if (copies) {
                Object.each(copies, function(p) {
                    ev[p] = src[p];
                });
            } else {
                Object.extend(ev, src);
            }
        }
        return ev;
    }
    var Gestrue = Class.create({
        initialize: function(element) {
            var that = this;
            that._el = element;
            that._myGestures = {};
            that._lastTapTime = NaN;
            that._onStart = that._onStart.bind(that);
            that._onDoing = that._onDoing.bind(that);
            that._onEnd = that._onEnd.bind(that);
            that._onTap = that._onTap.bind(that);
        },
        getElement: function() {
            return that._el;
        },
        enable: function() {
            var that = this, el = that._el;
            el.addEventListener("touchstart", that._onStart, false);
            el.addEventListener("tap", that._onTap, false);
        },
        disable: function() {
            var that = this, el = that._el;
            el.removeEventListener("touchstart", that._onStart, false);
            el.removeEventListener("tap", that._onTap, false);
        },
        _onStart: function(e) {
            var that = this, el = that._el, myGestures = that._myGestures;
            if (Object.keys(myGestures).length === 0) {
                doc.body.addEventListener("touchmove", that._onDoing, false);
                doc.body.addEventListener("touchend", that._onEnd, false);
            }
            Object.each(e.changedTouches, function(touch) {
                var touchRecord = {};
                for (var p in touch) touchRecord[p] = touch[p];
                var gesture = {
                    startTouch: touchRecord,
                    startTime: Date.now(),
                    status: "tapping",
                    pressingHandler: setTimeout(function() {
                        if (gesture.status === "tapping") {
                            gesture.status = "pressing";
                            var ev = copyEvents("press", touchRecord);
                            el.dispatchEvent(ev);
                        }
                        clearTimeout(gesture.pressingHandler);
                        gesture.pressingHandler = null;
                    }, 500)
                };
                myGestures[touch.identifier] = gesture;
            });
            if (Object.keys(myGestures).length == 2) {
                var ev = copyEvents("dualtouchstart");
                ev.touches = JSON.parse(JSON.stringify(e.touches));
                el.dispatchEvent(ev);
            }
        },
        _onDoing: function(e) {
            var that = this, el = that._el, myGestures = that._myGestures;
            Object.each(e.changedTouches, function(touch) {
                var gesture = myGestures[touch.identifier], displacementX, displacementY, distance, ev;
                if (!gesture) return;
                displacementX = touch.clientX - gesture.startTouch.clientX;
                displacementY = touch.clientY - gesture.startTouch.clientY;
                distance = Math.sqrt(Math.pow(displacementX, 2) + Math.pow(displacementY, 2));
                // magic number 10: moving 10px means pan, not tap
                if (gesture.status == "tapping" && distance > 10) {
                    gesture.status = "panning";
                    ev = copyEvents("panstart", touch, events);
                    el.dispatchEvent(ev);
                }
                if (gesture.status == "panning") {
                    ev = copyEvents("pan", touch, events);
                    ev.displacementX = displacementX;
                    ev.displacementY = displacementY;
                    el.dispatchEvent(ev);
                }
            });
            if (Object.keys(myGestures).length == 2) {
                var position = [], current = [], transform, ev;
                Object.each(e.touchs, function(touch) {
                    var gesture;
                    if (gesture = myGestures[touch.identifier]) {
                        position.push([ gesture.startTouch.clientX, gesture.startTouch.clientY ]);
                        current.push([ touch.clientX, touch.clientY ]);
                    }
                });
                transform = calc(position[0][0], position[0][1], position[1][0], position[1][1], current[0][0], current[0][1], current[1][0], current[1][1]);
                ev = copyEvents("dualtouch", transform);
                ev.touches = JSON.parse(JSON.stringify(e.touches));
                el.dispatchEvent(ev);
            }
        },
        _onEnd: function(e) {
            var that = this, el = that._el, myGestures = that._myGestures, ev;
            if (Object.keys(myGestures).length == 2) {
                ev = copyEvents("dualtouchend");
                ev.touches = JSON.parse(JSON.stringify(e.touches));
                el.dispatchEvent(ev);
            }
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i], id = touch.identifier, gesture = myGestures[id];
                if (!gesture) continue;
                if (gesture.pressingHandler) {
                    clearTimeout(gesture.pressingHandler);
                    gesture.pressingHandler = null;
                }
                if (gesture.status === "tapping") {
                    ev = copyEvents("tap", touch, events);
                    el.dispatchEvent(ev);
                }
                if (gesture.status === "panning") {
                    ev = copyEvents("panend", touch, events);
                    el.dispatchEvent(ev);
                    var duration = Date.now() - gesture.startTime;
                    if (duration < 300) {
                        ev = copyEvents("flick", touch, events);
                        ev.duration = duration;
                        ev.valocityX = (touch.clientX - gesture.startTouch.clientX) / duration;
                        ev.valocityY = (touch.clientY - gesture.startTouch.clientY) / duration;
                        ev.displacementX = touch.clientX - gesture.startTouch.clientX;
                        ev.displacementY = touch.clientY - gesture.startTouch.clientY;
                        el.dispatchEvent(ev);
                    }
                }
                if (gesture.status === "pressing") {
                    ev = copyEvents("pressend", touch, events);
                    el.dispatchEvent(ev);
                }
                delete myGestures[id];
            }
            if (Object.keys(myGestures).length == 0) {
                doc.body.removeEventListener("touchend", that._onEnd);
                doc.body.removeEventListener("touchmove", that._onDoing);
            }
        },
        _onTap: function(e) {
            var that = this, el = that._el, lastTapTime = that._lastTapTime;
            if (Date.now() - lastTapTime < 500) {
                var ev = document.createEvent("HTMLEvents");
                ev.initEvent("doubletap", true, true);
                Object.each(events, function(p) {
                    ev[p] = e[p];
                });
                el.dispatchEvent(ev);
            }
            that._lastTapTime = Date.now();
        }
    });
    return Gestrue;
});

define("#mix/sln/0.2.0/modules/transform-debug", [], function(require, exports, module) {
    var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/, MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/, TRANSITION_NAME = "-webkit-transform", appVersion = navigator.appVersion, isAndroid = /android/gi.test(appVersion), isIOS = /iphone|ipad/gi.test(appVersion), has3d = "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix();
    function quadratic2cubicBezier(a, b) {
        return [ [ (a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a) ], [ (b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a) ] ];
    }
    function getTransformX(el) {
        var transform, matchs;
        transform = getComputedStyle(el).webkitTransform;
        if (transform !== "none") {
            if (matchs = transform.match(MATRIX3D_REG)) {
                return parseInt(matchs[1]) || 0;
            } else if (matchs = transform.match(MATRIX_REG)) {
                return parseInt(matchs[1]) || 0;
            }
        }
        return 0;
    }
    function getTransformY(el) {
        var transform, matchs;
        transform = getComputedStyle(el).webkitTransform;
        if (transform !== "none") {
            if (matchs = transform.match(MATRIX3D_REG)) {
                return parseInt(matchs[2]) || 0;
            } else if (matchs = transform.match(MATRIX_REG)) {
                return parseInt(matchs[2]) || 0;
            }
        }
        return 0;
    }
    function getTranslate(x, y) {
        x += "";
        y += "";
        if (x.indexOf("%") < 0 && x !== "0") {
            x += "px";
        }
        if (y.indexOf("%") < 0 && y !== "0") {
            y += "px";
        }
        if (isIOS && has3d) {
            return "translate3d(" + x + ", " + y + ", 0)";
        } else {
            return "translate(" + x + ", " + y + ")";
        }
    }
    function waitTransition(el, time, callback) {
        var isEnd = false;
        function transitionEnd(e) {
            if (isEnd || e && (e.srcElement !== el || e.propertyName !== TRANSITION_NAME)) {
                return;
            }
            isEnd = true;
            el.style.webkitTransition = "none";
            el.removeEventListener("webkitTransitionEnd", transitionEnd, false);
            callback && setTimeout(callback, 50);
        }
        el.addEventListener("webkitTransitionEnd", transitionEnd, false);
        setTimeout(transitionEnd, parseFloat(time) * 1e3);
    }
    function doTransition(el, time, timeFunction, delay, x, y, callback) {
        waitTransition(el, time, callback);
        el.style.webkitTransition = [ TRANSITION_NAME, time, timeFunction, delay ].join(" ");
        el.style.webkitTransform = getTranslate(x, y);
    }
    exports.getY = getTransformY;
    exports.getX = getTransformX;
    exports.getTranslate = getTranslate;
    exports.getBezier = quadratic2cubicBezier;
    exports.start = doTransition;
});

define("#mix/sln/0.2.0/modules/scroll-debug", [ "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("./gesture-debug"), transform = require("./transform-debug"), prevented = false;
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
            el.removeEventListener("touchstart", that._onTouchStart, false);
            el.removeEventListener("panstart", that._onPanStart, false);
            el.removeEventListener("pan", that._onPan, false);
            el.removeEventListener("panend", that._onPanEnd, false);
            el.removeEventListener("flick", that._onFlick, false);
        },
        refresh: function() {
            var that = this, el = that._el;
            el.style.height = "auto";
        },
        _preventBodyTouch: function(e) {
            e.preventDefault();
            return false;
        },
        _onTouchStart: function(e) {
            var that = this, el = that._el;
            el.style.webkitTransition = "none";
            el.style.webkitTransform = getComputedStyle(el).webkitTransform;
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

define("#mix/sln/0.2.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
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

define("#mix/sln/0.2.0/components/xBase-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), components = {}, xBase = Class.create({
        initialize: function(name, module) {
            var that = this;
            that._name = name;
            that._module = module;
            that._isEnable = false;
        },
        getModule: function() {
            return this._module;
        },
        enable: function() {
            // overwrite
            var that = this, module = that._module;
            if (module && !that._isEnabled) {
                that._isEnabled = true;
                return true;
            }
        },
        disable: function() {
            // overwrite
            var that = this, module = that._module;
            if (module && that._isEnabled) {
                that._isEnabled = false;
                return true;
            }
        }
    });
    function createXComponent(xName, className, properties) {
        var _init, _extends, _implements, _enable, _disable, extentions, xComponent, component;
        if (arguments.length === 2) {
            properties = className;
            className = xName;
        }
        if (properties.hasOwnProperty("Implements")) {
            _implements = properties.Implements;
            delete properties.Implments;
        }
        if (properties.hasOwnProperty("init")) {
            _init = properties.init;
            delete properties.init;
        }
        if (properties.hasOwnProperty("enable")) {
            _enable = properties.enable;
            delete properties.enable;
        }
        if (properties.hasOwnProperty("disable")) {
            _disable = properties.disable;
            delete properties.disable;
        }
        extentions = Object.extend({
            Extends: xBase,
            Implements: _implements,
            initialize: function(module) {
                var that = this;
                xComponent.superclass.initialize.call(that, xName, module);
                _init && _init.call(that);
            }
        }, properties);
        if (_enable) {
            extentions.enable = function() {
                var is;
                if (xComponent.superclass.enable.call(this)) {
                    is = _enable.call(this);
                    is == null || (is = true);
                }
                return is;
            };
        }
        if (_disable) {
            extentions.disable = function() {
                var is;
                if (xComponent.superclass.disable.call(this)) {
                    is = _disable.call(this);
                    is == null || (is = true);
                }
                return is;
            };
        }
        xComponent = Class.create(extentions);
        component = components[xName] = {
            name: xName,
            klass: xComponent,
            count: 0,
            instances: [],
            map: {}
        };
        xComponent.create = function(el) {
            var cid = xName + "-" + Date.now() + "-" + (component.count + 1), instances = component.instances, map = component.map, instance;
            el.setAttribute("cid", cid);
            el.className += (el.className ? " " : "") + className;
            instance = new xComponent(el);
            instances.push(instance);
            map[cid] = instances.length - 1;
            return instance;
        };
        return xComponent;
    }
    function getXComponent(cid) {
        var name, component, matched;
        if (matched = cid.match(/^(x-[^-]+)/)) {
            name = matched[1];
        }
        component = components[name];
        if (cid === name) {
            return component.instances;
        } else {
            return component.instances[component.map[cid]];
        }
    }
    function parseXComponents() {
        Object.each(components, function(component, name) {
            var elements = doc.querySelectorAll('*[is="' + name + '"]');
            Object.each(elements, function(el) {
                if (!el.getAttribute("cid")) {
                    component.klass.create(el).enable();
                }
            });
        });
    }
    xBase.create = createXComponent;
    xBase.get = getXComponent;
    xBase.parse = parseXComponents;
    return xBase;
});

define("#mix/sln/0.2.0/components/xBack-debug", [ "./xBase-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/util-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), util = require("mix/core/0.3.0/base/util-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, xBase = require("./xBase-debug"), xName = "x-back", className = "x-button " + xName, xBack = xBase.create(xName, className, {
        init: function() {
            var that = this;
            that._isAutoHide = false;
            that._changeVisibility = that._changeVisibility.bind(that);
            that._clickHandler = that._clickHandler.bind(that);
        },
        enable: function() {
            var that = this, module = that._module, isAutoHide = util.str2val(module.getAttribute("autoHide"));
            module.addEventListener("click", that._clickHandler, false);
            that.autoHide(isAutoHide);
        },
        disable: function() {
            var that = this, module = that._module;
            module.removeEventListener("click", that._clickHandler, false);
            that.autoHide(false);
        },
        autoHide: function(is) {
            var that = this, module = that._module;
            if (is === null) {}
            if (module && that._isAutoHide !== is) {
                is ? navigate.on("forward backward", that._changeVisibility) : navigate.off("forward backward", that._changeVisibility);
                that._isAutoHide = is;
                that._changeVisibility();
            }
        },
        setText: function(text) {
            var that = this, module = that._module;
            module.innerText = text;
        },
        _clickHandler: function(e) {
            navigate.backward();
            e.preventDefault();
            return false;
        },
        _changeVisibility: function() {
            var that = this, module = that._module, isEnabled = that._isEnabled, visibility = navigate.getStateIndex() < 1 && isEnabled ? "hidden" : "";
            if (module.style.visibility !== visibility) {
                module.style.visibility = visibility;
            }
        }
    });
    return xBack;
});

define("#mix/sln/0.2.0/components/xScroll-debug", [ "../modules/scroll-debug", "../modules/gesture-debug", "../modules/transform-debug", "./xBase-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Scroll = require("../modules/scroll-debug"), xBase = require("./xBase-debug"), xName = "x-scroll", className = xName, xScroll = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module, scrollport = module.children[0];
            if (!scrollport) {
                scrollport = doc.createElement("div");
                module.appendChild(scrollport);
            }
            that._scroller = new Scroll(scrollport);
        },
        enable: function() {
            var that = this, scroller = that._scroller;
            scroller.enable();
        },
        disable: function() {
            var that = this, scroller = that._scroller;
            scroller.disable();
        },
        refresh: function() {
            var that = this, scroller = that._scroller;
            scroller.refresh();
        },
        getViewport: function() {
            return this._module.children[0];
        }
    });
    return xScroll;
});

define("#mix/sln/0.2.0/components/xTransition-debug", [ "../modules/transform-debug", "./xBase-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, transform = require("../modules/transform-debug");
    xBase = require("./xBase-debug"), xName = "x-transition", className = xName, xTransition = xBase.create(xName, className, {
        Implements: Message,
        init: function() {
            var that = this, module = that._module, orginHtml = module.innerHTML, transitionPort = module.children[0], activePort, inactivePort;
            Message.prototype.initialize.call(that, "transition");
            if (!transitionPort) {
                transitionPort = doc.createElement("div");
                module.appendChild(transitionPort);
            }
            activePort = that._activePort = doc.createElement("div");
            inactivePort = that._inactivePort = doc.createElement("div");
            activePort.className = "active";
            inactivePort.className = "inactive";
            activePort.innerHTML = orginHtml;
            transitionPort.innerHTML = "";
            transitionPort.appendChild(activePort);
            transitionPort.appendChild(inactivePort);
        },
        getViewport: function() {
            var that = this;
            return that._activePort;
        },
        action: function(type) {
            var that = this, isEnabled = that._isEnabled, module = that._module, transitionPort = module.children[0], lastActivePort = that._activePort, activePort = that._inactivePort, originX, originY;
            that._activePort = activePort;
            that._inactivePort = lastActivePort;
            activePort.innerHTML = "";
            if (isEnabled) {
                originY = transform.getY(transitionPort);
                originX = (type === "forward" ? "-" : "") + "33.33%";
                transform.start(transitionPort, "0.4s", "ease", 0, originX, originY, function() {
                    transitionPort.style.webkitTransform = transform.getTranslate(0, 0);
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

define("#mix/sln/0.2.0/components/xTitlebar-debug", [ "./xBase-debug", "./xBack-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/util-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), xBase = require("./xBase-debug"), xBack = require("./xBack-debug"), xName = "x-titlebar", className = xName, xTitlebar = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module, wrap, center, left, right, button;
            wrap = doc.createElement("div");
            center = doc.createElement("section");
            left = doc.createElement("section");
            right = doc.createElement("section");
            button = doc.createElement("button");
            left.appendChild(button);
            wrap.appendChild(center);
            wrap.appendChild(left);
            wrap.appendChild(right);
            module.appendChild(wrap);
        },
        enable: function() {
            var that = this, module = that._module, button = module.querySelector("div > section:nth-child(2) button");
            that.xback = xBack.create(button);
            that.xback.enable();
        },
        disable: function() {
            var that = this;
            that.xback.disable();
        },
        change: function(contents, movement) {
            var that = this, isEnabled = that._isEnabled, module = that._module, wrap = module.querySelector("div");
            if (isEnabled) {
                function handler(e) {
                    wrap.className = "";
                    wrap.removeEventListener("webkitTransitionEnd", handler);
                }
                wrap.className = movement;
                that.set(contents);
                setTimeout(function() {
                    wrap.className += " transition";
                    wrap.addEventListener("webkitTransitionEnd", handler, false);
                }, 1);
            }
        },
        set: function(contents) {
            var that = this, isEnabled = that._isEnabled, module = that._module, center = module.querySelector("div > section:first-child"), left = module.querySelector("div > section:nth-child(2)"), right = module.querySelector("div > section:last-child");
            if (isEnabled) {
                setContent(center, contents.center);
                setContent(left, contents.left);
                setContent(right, contents.right);
            }
        }
    });
    function setContent(el, content) {
        if (content != null) {
            var isType = Object.isTypeof(content);
            if (isType === "string") {
                el.innerHTML = content;
            } else {
                if (isType !== "array") {
                    content = [ content ];
                }
                el.innerHTML = "";
                Object.each(content, function(item) {
                    el.appendChild(item);
                });
            }
        }
    }
    return xTitlebar;
});

define("#mix/sln/0.2.0/components/xViewport-debug", [ "./xBase-debug", "./xTitlebar-debug", "./xBack-debug", "./xScroll-debug", "../modules/scroll-debug", "../modules/gesture-debug", "../modules/transform-debug", "./xTransition-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/util-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, util = require("mix/core/0.3.0/base/util-debug").singleton, xBase = require("./xBase-debug"), xTitlebar = require("./xTitlebar-debug"), xScroll = require("./xScroll-debug"), xTransition = require("./xTransition-debug"), xName = "x-viewport", className = xName, xViewport = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module, header, section, footer, subport;
            that._isEnableTitlebar = false;
            that._isEnableScroll = false;
            that._isEnableTransition = false;
            header = doc.createElement("header");
            section = doc.createElement("section");
            footer = doc.createElement("footer");
            module.appendChild(header);
            module.appendChild(section);
            module.appendChild(footer);
        },
        enable: function() {
            var that = this, module = that._module, header = module.querySelector("header"), sectionport = module.querySelector("section");
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
                that.xscroll = xScroll.create(sectionport);
                that.xscroll.enable();
            }
            if (that._isEnableTransition) {
                module.className += " enableTransition";
                that.xtransition = xTransition.create(sectionport);
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

define("#mix/sln/0.2.0/controllers/cNavigation-debug", [ "../modules/page-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, AppPage = require("../modules/page-debug"), pages = {}, status = AppPage.STATUS, NavigationController = Class.create({
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
                    setTimeout(function() {
                        app.queryComponent('*[is="x-viewport"]').xscroll.refresh();
                    }, 1);
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

define("#mix/sln/0.2.0/app-debug", [ "./modules/page-debug", "./controllers/cNavigation-debug", "./components/xBase-debug", "./components/xBack-debug", "./components/xScroll-debug", "./modules/scroll-debug", "./modules/gesture-debug", "./modules/transform-debug", "./components/xTransition-debug", "./components/xTitlebar-debug", "./components/xViewport-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/util-debug", "mix/sln/0.2.0/app-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, AppPage = require("./modules/page-debug"), Navigation = require("./controllers/cNavigation-debug"), xBase = require("./components/xBase-debug"), xBack = require("./components/xBack-debug"), xScroll = require("./components/xScroll-debug"), xTransition = require("./components/xTransition-debug"), xTitlebar = require("./components/xTitlebar-debug"), xViewport = require("./components/xViewport-debug"), app = {
        theme: "ios",
        routePrefix: 0,
        // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
        routePrefixSep: "/"
    };
    function initNavigation() {
        var curNav, xviewport = app.queryComponent('*[is="x-viewport"]'), xtitlebar = xviewport.xtitlebar, xtransition = xviewport.xtransition;
        xback = xtitlebar.xback;
        function parseButtons(meta) {
            var buttons = [];
            Object.each(meta, function(item) {
                var type = item.type, button;
                switch (type) {
                  case "backStack":
                    xback.setText(item.text);
                    xback.autoHide(item.autoHide);
                    break;

                  case "rightExtra":
                    button = document.createElement("button");
                    button.className = "x-button";
                    button.innerText = item.text;
                    button.addEventListener("click", item.handler, false);
                    buttons.push(button);
                    break;

                  default:
                    break;
                }
            });
            return buttons;
        }
        function setTitlebar(navigation) {
            var appName = navigation.appName, transition = navigation.state.transition, page = app.getPage(appName), title = page.getTitle(), buttons = parseButtons(page.buttons);
            xtitlebar.change({
                center: title,
                right: buttons
            }, transition);
        }
        function doTransition(navigation) {
            var transition = navigation.state.transition;
            xtransition[transition]();
        }
        function switchNavigation(newNav) {
            if (curNav) {
                curNav.unload();
            }
            curNav = newNav;
            newNav.ready();
            newNav.compile();
        }
        function handler(state) {
            var navigation = new Navigation(state);
            doTransition(navigation);
            switchNavigation(navigation);
            setTitlebar(navigation);
        }
        Navigation.listen(handler);
    }
    Object.extend(app, {
        init: function(properties) {
            var Page = AppPage.extend(properties), page = new Page({
                routePrefix: app.routePrefix,
                routePrefixSep: app.routePrefixSep
            });
            Navigation.addPage(page);
            return page;
        },
        getPage: function(name) {
            return Navigation.getPage(name);
        },
        getViewport: function() {
            return this.queryComponent('*[is="x-viewport"]').getViewport();
        },
        fillViewport: function(content) {
            var that = this, viewport = that.getViewport();
            viewport.innerHTML = content;
        },
        getComponent: function(cid) {
            if (arguments[0] instanceof HTMLElement) {
                cid = arguments[0].getAttribute("cid");
            }
            return xBase.get(cid);
        },
        queryComponent: function(selector) {
            var el = doc.querySelector(selector);
            return this.getComponent(el);
        },
        loadFile: function(url, callback) {
            var xhr = new win.XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                    callback(xhr.responseText);
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        },
        start: function() {
            xBase.parse();
            initNavigation();
            router.start();
        }
    });
    win["app"] = app;
});

require("mix/sln/0.2.0/app-debug");