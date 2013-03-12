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
    }
    function startTransition(el, time, timeFunction, delay, x, y, callback) {
        waitTransition(el, time, callback);
        el.style.webkitTransition = [ TRANSITION_NAME, time, timeFunction, delay ].join(" ");
        el.style.webkitTransform = getTranslate(x, y);
    }
    exports.getY = getTransformY;
    exports.getX = getTransformX;
    exports.getTranslate = getTranslate;
    exports.getBezier = quadratic2cubicBezier;
    exports.start = startTransition;
});

define("#mix/sln/0.2.0/modules/scroll-debug", [ "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("./gesture-debug"), Transform = require("./transform-debug"), prevented = false;
    function getMaxScrollTop(el) {
        var parentEl = el.parentNode, parentStyle = getComputedStyle(parentEl);
        var maxTop = 0 - el.scrollHeight + parentEl.offsetHeight - parseInt(parentStyle.paddingTop) - parseInt(parentStyle.paddingBottom);
        if (maxTop > 0) maxTop = 0;
        return maxTop;
    }
    var Scroll = Class.create({
        initialize: function(element) {
            var that = this;
            that._wrap = element;
            that._scroller = element.children[0];
            that._gesture = new Gesture(that._scroller);
            that._originalY = null;
            that._currentY = null;
            that._scrollHeight = null;
            that._scrollEndHandler = null;
            that._scrollEndCancel = false;
            that._refreshed = false;
            that._preventBodyTouch = that._preventBodyTouch.bind(that);
            that._onTouchStart = that._onTouchStart.bind(that);
            that._onPanStart = that._onPanStart.bind(that);
            that._onPan = that._onPan.bind(that);
            that._onPanEnd = that._onPanEnd.bind(that);
            that._onFlick = that._onFlick.bind(that);
            that._onScrollEnd = that._onScrollEnd.bind(that);
        },
        enable: function() {
            var that = this, scroller = that._scroller;
            that._gesture.enable();
            scroller.addEventListener("touchstart", that._onTouchStart, false);
            scroller.addEventListener("panstart", that._onPanStart, false);
            scroller.addEventListener("pan", that._onPan, false);
            scroller.addEventListener("panend", that._onPanEnd, false);
            scroller.addEventListener("flick", that._onFlick, false);
            if (!prevented) {
                prevented = true;
                doc.body.addEventListener("touchmove", that._preventBodyTouch, false);
            }
        },
        disable: function() {
            var that = this, scroller = that._scroller;
            that._gesture.disable();
            scroller.removeEventListener("touchstart", that._onTouchStart, false);
            scroller.removeEventListener("panstart", that._onPanStart, false);
            scroller.removeEventListener("pan", that._onPan, false);
            scroller.removeEventListener("panend", that._onPanEnd, false);
            scroller.removeEventListener("flick", that._onFlick, false);
            if (prevented) {
                prevented = false;
                doc.body.removeEventListener("touchmove", that._preventBodyTouch, false);
            }
        },
        refresh: function() {
            this._refreshed = true;
        },
        getHeight: function() {
            return this._scroller.offsetHeight;
        },
        getTop: function() {
            return -Transform.getY(this._scroller);
        },
        to: function(top) {
            var that = this, scroller = that._scroller, maxScrollTop = getMaxScrollTop(scroller);
            top = -top;
            if (top < maxScrollTop) {
                top = maxScrollTop;
            } else if (top > 0) {
                top = 0;
            }
            scroller.style.webkitTransform = Transform.getTranslate(0, top);
            that._onScrollEnd();
        },
        _preventBodyTouch: function(e) {
            e.preventDefault();
            return false;
        },
        _onTouchStart: function(e) {
            var that = this, scroller = that._scroller;
            scroller.style.webkitTransition = "none";
            scroller.style.webkitTransform = getComputedStyle(scroller).webkitTransform;
            if (that._refreshed) {
                that._refreshed = false;
                that._scrollHeight = scroller.offsetHeight;
                scroller.style.height = "auto";
                scroller.style.height = that._scrollHeight + "px";
            }
        },
        _onPanStart: function(e) {
            var that = this, scroller = that._scroller;
            that._originalY = Transform.getY(scroller);
        },
        _onPan: function(e) {
            var that = this, scroller = that._scroller, maxScrollTop = getMaxScrollTop(scroller), originalY = that._originalY, currentY = that._currentY = originalY + e.displacementY;
            if (currentY > 0) {
                scroller.style.webkitTransform = Transform.getTranslate(0, currentY / 2);
            } else if (currentY < maxScrollTop) {
                scroller.style.webkitTransform = Transform.getTranslate(0, (maxScrollTop - currentY) / 2 + currentY);
            } else {
                scroller.style.webkitTransform = Transform.getTranslate(0, currentY);
            }
        },
        _onPanEnd: function(e) {
            var that = this, scroller = that._scroller, currentY = that._currentY, maxScrollTop = getMaxScrollTop(scroller), translateY = null;
            if (currentY > 0) {
                translateY = 0;
            }
            if (currentY < maxScrollTop) {
                translateY = maxScrollTop;
            }
            if (translateY != null) {
                Transform.start(scroller, "0.4s", "ease-out", "0s", 0, translateY, that._onScrollEnd);
            } else {
                that._onScrollEnd();
            }
        },
        _onFlick: function(e) {
            var that = this, scroller = that._scroller, currentY = that._currentY, maxScrollTop = getMaxScrollTop(scroller);
            that._scrollEndCancel = true;
            if (currentY < maxScrollTop || currentY > 0) return;
            var s0 = Transform.getY(scroller), v0 = e.valocityY;
            if (v0 > 1.5) v0 = 1.5;
            if (v0 < -1.5) v0 = -1.5;
            var a = .0015 * (v0 / Math.abs(v0)), t = v0 / a, s = s0 + t * v0 / 2;
            if (s > 0 || s < maxScrollTop) {
                var sign = s > 0 ? 1 : -1, edge = s > 0 ? 0 : maxScrollTop;
                s = (s - edge) / 2 + edge;
                t = (sign * Math.sqrt(2 * a * (s - s0) + v0 * v0) - v0) / a;
                v = v0 - a * t;
                Transform.start(scroller, t.toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-v0 / a, -v0 / a + t) + ")", "0s", 0, s.toFixed(0), function() {
                    v0 = v;
                    s0 = s;
                    a = .0045 * (v0 / Math.abs(v0));
                    t = -v0 / a;
                    s = edge;
                    Transform.start(scroller, (0 - t).toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-t, 0) + ")", "0s", 0, s.toFixed(0), that._onScrollEnd);
                });
            } else {
                Transform.start(scroller, t.toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-t, 0) + ")", "0s", 0, s.toFixed(0), that._onScrollEnd);
            }
        },
        _onScrollEnd: function() {
            var that = this;
            that._scrollEndCancel = false;
            setTimeout(function() {
                if (!that._scrollEndCancel) {
                    that._scrollEndHandler && that._scrollEndHandler();
                }
            }, 10);
        }
    });
    return Scroll;
});

define("#mix/sln/0.2.0/modules/component-debug", [ "./scroll-debug", "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Scroll = require("./scroll-debug"), Transform = require("./transform-debug"), components = {}, emptyFunc = function() {}, extendFns = function(el, fns) {
        el.fn || (el.fn = {});
        Object.extend(el.fn, fns);
    }, Compontent = Class.create({
        Implements: Message,
        initialize: function() {
            Message.prototype.initialize.call(this, "component");
        },
        get: function(name) {
            return components[name];
        },
        initViewport: function(el) {
            components["viewport"] = el;
            el.setAttribute("id", "viewport-" + Date.now());
        },
        initTitlebar: function(el) {
            var viewport = components["viewport"];
            viewport.className += " enableTitlebar";
            components["titlebar"] = el;
            extendFns(el, {
                change: function(text, movement) {
                    var that = this, wrap = el.querySelector("ul"), title = wrap.querySelector("li:first-child");
                    function handler(e) {
                        wrap.className = "";
                        wrap.removeEventListener("webkitTransitionEnd", handler);
                    }
                    title.innerHTML = text;
                    wrap.className = movement;
                    setTimeout(function() {
                        wrap.className += " transition";
                        wrap.addEventListener("webkitTransitionEnd", handler, false);
                    }, 1);
                }
            });
        },
        initBtn: function(name, el) {
            components[name] = el;
            var that = this;
            extendFns(el, {
                setText: function(text) {
                    el.innerText = text;
                },
                show: function() {
                    el.style.visibility = "";
                },
                hide: function() {
                    el.style.visibility = "hidden";
                }
            });
            el.addEventListener("click", function(e) {
                that.trigger(name + "Click");
                e.preventDefault();
                return false;
            });
            return el;
        },
        initBackBtn: function(el) {
            this.initBtn("backBtn", el);
        },
        initFuncBtn: function(el) {
            this.initBtn("funcBtn", el);
        },
        initContent: function(el) {
            components["content"] = el;
            var active = el.querySelector("div > .active"), inactive = el.querySelector("div > .inactive");
            extendFns(el, {
                getActive: function() {
                    return active;
                },
                getInactive: function() {
                    return inactive;
                },
                switchActive: function() {
                    swap = inactive;
                    inactive = active;
                    active = swap;
                },
                setClass: function() {
                    inactive.className = "inactive";
                    active.className = "active";
                }
            });
        },
        getActiveContent: function() {
            return components["content"].fn.getActive();
        },
        initScroll: function(el) {
            components["scroll"] = el;
            var that = this, children = el.children[0], scroller = new Scroll(el), viewport = components["viewport"];
            viewport.className += " enableScroll";
            el.className += " scroll";
            scroller._scrollEndHandler = function() {
                that.trigger("scrollEnd");
            };
            scroller.enable();
            extendFns(el, {
                refresh: function() {
                    scroller.refresh();
                },
                getScrollHeight: function() {
                    return scroller.getHeight();
                },
                getScrollTop: function() {
                    return scroller.getTop();
                },
                scrollTo: function(top) {
                    scroller.to(top);
                }
            });
        },
        initTransition: function(el) {
            components["transition"] = el;
            var that = this, viewport = components["viewport"], content = components["content"];
            viewport.className += " enableTransition";
            el.className += " transition";
            function action(type) {
                var wrap = el.querySelector("div"), active, originX, originY;
                content.fn.switchActive();
                active = content.fn.getActive(), active.innerHTML = "";
                originY = Transform.getY(wrap);
                originX = (type === "forward" ? "-" : "") + "33.33%";
                Transform.start(wrap, "0.4s", "ease", 0, originX, originY, function() {
                    content.fn.setClass();
                    originY = Transform.getY(wrap);
                    wrap.style.webkitTransform = Transform.getTranslate(0, originY);
                    that.trigger(type + "TransitionEnd");
                });
            }
            extendFns(el, {
                forward: function() {
                    action("forward");
                },
                backward: function() {
                    action("backward");
                }
            });
        }
    });
    return new Compontent();
});

define("#mix/sln/0.2.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), STATUS = {
        UNKOWN: 0,
        UNLOADED: 0,
        READY: 1,
        COMPILED: 2
    }, pages = {}, Page = Class.create({
        Implements: Message,
        initialize: function() {
            var that = this, name = that.name;
            Message.prototype.initialize.call(that, "app." + name);
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
        fill: function(datas, callback) {
            var that = this;
            function _fill() {
                that.renderTemplate(datas, function(content) {
                    that.trigger("rendered", content);
                    callback && callback();
                });
            }
            if (!that.compiledTemplate) {
                that.once("compiled", _fill);
            } else {
                _fill();
            }
        },
        ready: function(navigation) {},
        unload: function() {}
    });
    Page.STATUS = STATUS;
    Page.fn = {};
    Page.define = function(properties) {
        var cPage = Page.extend(properties), page;
        cPage.implement(Page.fn);
        page = new cPage();
        return pages[page.name] = page;
    };
    Page.get = function(name) {
        return pages[name];
    };
    Page.each = function(callback) {
        Object.each(pages, callback);
    };
    return Page;
});

define("#mix/sln/0.2.0/modules/navigation-debug", [ "./page-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Page = require("./page-debug"), STATUS = Page.STATUS, Navigation = Class.create({
        initialize: function(state) {
            var that = this, name = state.name.split(".");
            that.appName = name[0];
            that.routeName = name[1];
            that.state = state;
        },
        ready: function() {
            var page = Page.get(this.appName);
            if (page.status < STATUS.READY) {
                page.status = STATUS.READY;
                page.trigger("ready");
            }
        },
        compile: function() {
            var page = Page.get(this.appName);
            function _compiled() {
                if (page.status < STATUS.COMPILED) {
                    page.status = STATUS.COMPILED;
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
            var that = this, page = Page.get(this.appName);
            if (page.status > STATUS.UNLOADED) {
                page.status = STATUS.UNLOADED;
                page.trigger("unloaded");
            }
        }
    });
    Object.extend(Navigation, {
        _cur: null,
        getParameter: function(name) {
            return this._cur.state.params[name];
        },
        getArgument: function(name) {
            return this._cur.state.args[name];
        },
        getData: function(name) {
            return this._cur.state.datas[name];
        },
        push: function(fragment, options) {
            navigate.forward(fragment, options);
        },
        pop: function() {
            navigate.backward();
        }
    });
    return Navigation;
});

define("#mix/sln/0.2.0/app-debug", [ "./modules/page-debug", "./modules/component-debug", "./modules/scroll-debug", "./modules/gesture-debug", "./modules/transform-debug", "./modules/navigation-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug", "mix/sln/0.2.0/app-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Page = require("./modules/page-debug"), Component = require("./modules/component-debug"), Navigation = require("./modules/navigation-debug");
    app = {};
    function initComponent() {
        var viewport = app.config.viewport, titlebar = viewport.querySelector("header.titlebar"), backBtn = titlebar.querySelector("button.back"), funcBtn = titlebar.querySelector("button.func");
        content = viewport.querySelector("section.content"), toolbar = viewport.querySelector("footer.toolbar");
        Component.initViewport(viewport);
        if (app.config.enableTitlebar) {
            Component.initTitlebar(titlebar);
            Component.initBackBtn(backBtn);
            Component.initFuncBtn(funcBtn);
        }
        Component.initContent(content);
        if (app.config.enableScroll) {
            Component.initScroll(content);
        }
        if (app.config.enableTransition) {
            Component.initTransition(content);
        }
        if (app.config.enableToolbar) {
            Component.initToolbar();
        }
    }
    function initNavigation() {
        var titlebar = Component.get("titlebar"), backBtn = Component.get("backBtn"), funcBtn = Component.get("funcBtn"), funcBtnHandler = null, content = Component.get("content"), transition = Component.get("transition");
        Component.on("backBtnClick", function(el) {
            navigate.backward();
        });
        Component.on("funcBtnClick", function(el) {
            funcBtnHandler && funcBtnHandler(el);
        });
        function setButtons(navigation) {
            var appName = navigation.appName, page = Page.get(appName), buttons = page.buttons;
            backBtn.fn.hide();
            funcBtn.fn.hide();
            buttons && Object.each(buttons, function(item) {
                var type = item.type;
                switch (type) {
                  case "back":
                    backBtn.fn.setText(item.text);
                    if (navigate.getStateIndex() >= 1) {
                        backBtn.fn.show();
                    }
                    break;

                  case "func":
                    funcBtn.fn.setText(item.text);
                    funcBtnHandler = item.handler;
                    funcBtn.fn.show();
                    break;

                  default:
                    break;
                }
            });
        }
        function setTitlebar(navigation) {
            var appName = navigation.appName, transition = navigation.state.transition, page = Page.get(appName), title = page.getTitle();
            titlebar.fn.change(title, transition);
        }
        function switchNavigation(navigation) {
            if (app.config.enableTransition) {
                transition.fn[navigation.state.transition]();
            } else {
                content.fn.switchActive();
                content.fn.setClass();
            }
            if (app.navigation._cur) {
                app.navigation._cur.unload();
            }
            app.navigation._cur = navigation;
            navigation.ready();
            navigation.compile();
        }
        navigate.on("forward backward", function(state) {
            var navigation = new Navigation(state);
            switchNavigation(navigation);
            if (app.config.enableTitlebar) {
                setButtons(navigation);
                setTitlebar(navigation);
            }
        });
        Page.each(function(page) {
            var name = page.name, route = page.route;
            if (!route) {
                route = {
                    name: "default",
                    "default": true
                };
            } else if (Object.isTypeof(route, "string")) {
                route = {
                    name: "anonymous",
                    text: route
                };
            }
            navigate.addRoute(name + "." + route.name, route.text, route);
            page.on("rendered", function(html) {
                var scroll = Component.get("scroll"), active = Component.getActiveContent();
                active && (active.innerHTML = html);
                scroll && scroll.fn.refresh();
            });
        });
    }
    Object.extend(app, {
        config: {
            viewport: null,
            theme: "iOS",
            routePrefix: 0,
            // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
            routePrefixSep: "/",
            enableTitlebar: false,
            enableScroll: false,
            enableTransition: false,
            enableToolbar: false
        },
        page: Page,
        component: Component,
        navigation: Navigation,
        plugin: {},
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
            initComponent();
            initNavigation();
            app.plugin.init && app.plugin.init();
            router.start();
        }
    });
    win["app"] = app;
});

require("mix/sln/0.2.0/app-debug");