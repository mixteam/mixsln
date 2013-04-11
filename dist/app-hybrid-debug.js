define("#mix/sln/0.3.4/modules/gesture-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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

define("#mix/sln/0.3.4/modules/transform-debug", [], function(require, exports, module) {
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

define("#mix/sln/0.3.4/modules/scroll-debug", [ "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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
            that._originalX = null;
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
            this._scroller.style.height = "auto";
            this._refreshed = true;
        },
        getHeight: function() {
            return this._scroller.offsetHeight;
        },
        getTop: function() {
            return -Transform.getY(this._scroller);
        },
        to: function(top) {
            var that = this, scroller = that._scroller, left = Transform.getX(scroller), maxScrollTop = getMaxScrollTop(scroller);
            top = -top;
            if (top < maxScrollTop) {
                top = maxScrollTop;
            } else if (top > 0) {
                top = 0;
            }
            scroller.style.webkitTransform = Transform.getTranslate(left, top);
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
                scroller.style.height = that._scrollHeight + "px";
            }
        },
        _onPanStart: function(e) {
            var that = this, scroller = that._scroller;
            that._originalX = Transform.getX(scroller);
            that._originalY = Transform.getY(scroller);
        },
        _onPan: function(e) {
            var that = this, scroller = that._scroller, maxScrollTop = getMaxScrollTop(scroller), originalX = that._originalX, originalY = that._originalY, currentY = that._currentY = originalY + e.displacementY;
            if (currentY > 0) {
                scroller.style.webkitTransform = Transform.getTranslate(originalX, currentY / 2);
            } else if (currentY < maxScrollTop) {
                scroller.style.webkitTransform = Transform.getTranslate(originalX, (maxScrollTop - currentY) / 2 + currentY);
            } else {
                scroller.style.webkitTransform = Transform.getTranslate(originalX, currentY);
            }
        },
        _onPanEnd: function(e) {
            var that = this, scroller = that._scroller, originalX = that._originalX, currentY = that._currentY, maxScrollTop = getMaxScrollTop(scroller), translateY = null;
            if (currentY > 0) {
                translateY = 0;
            }
            if (currentY < maxScrollTop) {
                translateY = maxScrollTop;
            }
            if (translateY != null) {
                Transform.start(scroller, "0.4s", "ease-out", "0s", originalX, translateY, that._onScrollEnd);
            } else {
                that._onScrollEnd();
            }
        },
        _onFlick: function(e) {
            var that = this, scroller = that._scroller, originalX = that._originalX, currentY = that._currentY, maxScrollTop = getMaxScrollTop(scroller);
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
                Transform.start(scroller, t.toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-v0 / a, -v0 / a + t) + ")", "0s", originalX, s.toFixed(0), function() {
                    v0 = v;
                    s0 = s;
                    a = .0045 * (v0 / Math.abs(v0));
                    t = -v0 / a;
                    s = edge;
                    Transform.start(scroller, (0 - t).toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-t, 0) + ")", "0s", originalX, s.toFixed(0), that._onScrollEnd);
                });
            } else {
                Transform.start(scroller, t.toFixed(0) + "ms", "cubic-bezier(" + Transform.getBezier(-t, 0) + ")", "0s", originalX, s.toFixed(0), that._onScrollEnd);
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

define("#mix/sln/0.3.4/modules/component-debug", [ "./scroll-debug", "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
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
            if (!el.getAttribute("id")) el.setAttribute("id", "viewport-" + Date.now());
        },
        initNavibar: function(el) {
            var viewport = components["viewport"];
            viewport.className += " enableNavibar";
            components["navibar"] = el;
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
                },
                set: function(text) {
                    var that = this, wrap = el.querySelector("ul"), title = wrap.querySelector("li:first-child");
                    title.innerHTML = text;
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
            active.setAttribute("index", "0");
            inactive.setAttribute("index", "1");
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
                toggleClass: function() {
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
            // 简单的转场效果
            function action(type) {
                var wrap = el.querySelector("div"), wrapWidth = wrap.offsetWidth, active, inactive, originX, originY;
                content.fn.switchActive();
                active = content.fn.getActive();
                inactive = content.fn.getInactive();
                active.style.display = "block";
                active.style.top = "-9999px";
                wrap.appendChild(active);
                originX = Transform.getX(wrap);
                originY = Transform.getY(wrap);
                originX += type === "forward" ? -wrapWidth : wrapWidth;
                Transform.start(wrap, "0.4s", "ease", 0, originX, originY, function() {
                    content.fn.toggleClass();
                    active.style.left = -originX + "px";
                    active.style.top = "";
                    active.style.display = "";
                    inactive.innerHTML = "";
                    wrap.removeChild(inactive);
                    wrap.style.webkitTransform = Transform.getTranslate(originX, 0);
                    that.trigger(type + "TransitionEnd");
                });
            }
            // 复杂的转场效果
            /*
			function action(type) {
				var wrap = el.querySelector('div'),
					wrapWidth = wrap.offsetWidth,
					active,	inactive, originX, originY
					;

				originX = Transform.getX(wrap);
				originY = Transform.getY(wrap);

				content.fn.switchActive();
				active = content.fn.getActive();
				inactive = content.fn.getInactive();

				active.style.display = 'block';
				
				// 两个页面是在-webkit-box下，呈现并排状态，用relative定位，当有转场效果时，得重新计算各自的偏移。
				// 每单位偏移量为wrap的宽度。
				if (type === 'forward') {
					if (active.getAttribute('index') === '1') {
						// 被激活的div在原先div之后，偏移量为原始偏移量
						active.style.left = (-originX) + 'px';
					} else {
						// 被激活的div在原先div之前，两个div需要互换位置，被激活的div向右偏移一个单位，原先div向左偏移一个单位
						active.style.left = (-originX+wrapWidth) + 'px';
						inactive.style.left = (-originX-wrapWidth) + 'px';
					}
					originX -= wrapWidth;
				} else if (type === 'backward') {
					if (active.getAttribute('index') === '1') {
						// 被激活的div在原先div之后，需要向左偏移两个单位
						active.style.left = (-originX-wrapWidth*2) + 'px';
					} else {
						// 被激活的div在原先div之前，同时向左平移一个单位
						active.style.left = (-originX-wrapWidth) + 'px';
						inactive.style.left = (-originX-wrapWidth) + 'px';
					}
					originX += wrapWidth;
				}

				Transform.start(wrap, '0.4s', 'ease', 0, originX, originY, function() {
					content.fn.toggleClass();
					// 回正偏移量
					active.style.left = (-originX) + 'px';
					active.style.display = '';
					inactive.innerHTML = '';
					wrap.style.webkitTransform = Transform.getTranslate(originX, 0);
					that.trigger(type  + 'TransitionEnd');
				});
			}
			*/
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

define("#mix/sln/0.3.4/modules/view-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), views = {}, vAutoIdx = 0, View = Class.create({
        initialize: function() {
            var that = this, name = that.name;
            that._vid = name + "-" + Date.now() + "-" + vAutoIdx++;
            that.views || (that.views = {});
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
            var that = this, engine = app.config.templateEngine;
            if (engine && engine.compile && Object.isTypeof(text, "string")) {
                text = engine.compile(text);
            }
            if (callback) {
                callback(text);
            } else {
                return text;
            }
        },
        renderTemplate: function(datas, callback) {
            // can overwrite
            var that = this, engine = app.config.templateEngine, compiledTemplate = that.compiledTemplate, content = "";
            if (engine && engine.render && Object.isTypeof(datas, "object") && compiledTemplate) {
                content = engine.render(compiledTemplate, datas);
            } else {
                content = compiledTemplate;
            }
            if (callback) {
                callback(content);
            } else {
                return content;
            }
        }
    });
    View.fn = {};
    var isExtend = false;
    function extendViewFn() {
        if (!isExtend) {
            isExtend = true;
            Object.extend(View.prototype, View.fn);
        }
    }
    View.define = function(properties) {
        extendViewFn();
        var cView = View.extend(properties);
        return views[properties.name] = cView;
    };
    View.get = function(name) {
        return views[name];
    };
    View.each = function(callback) {
        Object.each(views, callback);
    };
    return View;
});

define("#mix/sln/0.3.4/modules/page-debug", [ "./view-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), View = require("./view-debug"), STATUS = {
        DEFINED: 0,
        UNLOADED: 1,
        LOADED: 2,
        READY: 3
    }, pages = {}, Page = Class.create({
        Extends: View,
        Implements: Message,
        initialize: function() {
            var that = this, name = that.name;
            Message.prototype.initialize.call(that, "page." + name);
            View.prototype.initialize.apply(that, arguments);
            that.status = STATUS.DEFINED;
        },
        getTitle: function() {
            //can overrewite
            return this.title;
        },
        fill: function(datas, callback) {
            var that = this;
            if (!Object.isTypeof(datas, "string")) {
                datas = that.renderTemplate(datas);
            }
            that.trigger("rendered", datas);
            callback && callback();
        },
        ready: function() {},
        unload: function() {}
    });
    Page.STATUS = STATUS;
    Page.global = {};
    Page.fn = {};
    var isExtend = false;
    function extendPageFn() {
        if (!isExtend) {
            isExtend = true;
            Object.extend(Page.prototype, Page.fn);
        }
    }
    Page.define = function(properties) {
        extendPageFn();
        var cPage = Page.extend(properties), iPage = new cPage();
        Object.each(Page.global, function(val, name) {
            var type = Object.isTypeof(val);
            switch (type) {
              case "array":
                iPage[name] = val.slice(0).concat(iPage[name] || []);
                break;

              case "object":
                iPage[name] = Object.extend(val, iPage[name] || {});
                break;

              case "string":
              case "number":
                iPage[name] == null && (iPage[name] = val);
                break;
            }
        });
        return pages[iPage.name] = iPage;
    };
    Page.get = function(name) {
        return pages[name];
    };
    Page.each = function(callback) {
        Object.each(pages, callback);
    };
    return Page;
});

define("#mix/sln/0.3.4/modules/navigation-debug", [ "./page-debug", "./view-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Page = require("./page-debug"), STATUS = Page.STATUS, Navigation = Class.create({
        initialize: function(state) {
            var that = this, name = state.name.split(".");
            that.pageName = name[0];
            that.routeName = name[1];
            that.state = state;
        },
        load: function(callback) {
            var that = this, page = Page.get(this.pageName), loadedState = [];
            function checkLoaded(i) {
                loadedState[i] = true;
                if (loadedState.join("").match(/^(true)*$/)) {
                    page.status = STATUS.LOADED;
                    callback();
                }
            }
            function pushViews(view) {
                var views = view.views || {};
                loadedState.push(view);
                Object.each(views, pushViews);
            }
            if (page.status < STATUS.LOADED) {
                pushViews(page);
                Object.each(loadedState, function(state, i) {
                    state.loadTemplate(function(text) {
                        state.compileTemplate(text, function(compiled) {
                            state.compiledTemplate = compiled;
                            checkLoaded(i);
                        });
                    });
                });
            }
        },
        ready: function() {
            var page = Page.get(this.pageName);
            if (page.status === STATUS.LOADED && page.status < STATUS.READY) {
                page.status = STATUS.READY;
                page.trigger("ready");
                page.ready();
            }
        },
        unload: function() {
            var that = this, page = Page.get(this.pageName);
            if (page.status > STATUS.UNLOADED) {
                page.status = STATUS.UNLOADED;
                page.trigger("unloaded");
                page.unload();
            }
        }
    });
    Object.extend(Navigation, {
        _cur: null,
        getParameter: function(name) {
            if (!this._cur) return;
            return this._cur.state.params[name];
        },
        getArgument: function(name) {
            if (!this._cur) return;
            return this._cur.state.args[name];
        },
        getData: function(name) {
            if (!this._cur) return;
            return this._cur.state.datas[name];
        },
        getPageName: function() {
            if (!this._cur) return;
            return this._cur.pageName;
        },
        getRouteName: function() {
            if (!this._cur) return;
            return this._cur.routeName;
        },
        getState: function() {
            if (!this._cur) return;
            return this._cur.state;
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

define("#mix/sln/0.3.4/app-hybrid-debug", [ "./modules/view-debug", "./modules/page-debug", "./modules/component-debug", "./modules/scroll-debug", "./modules/gesture-debug", "./modules/transform-debug", "./modules/navigation-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug", "mix/sln/0.3.4/app-hybrid-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, View = require("./modules/view-debug"), Page = require("./modules/page-debug"), Component = require("./modules/component-debug"), Navigation = require("./modules/navigation-debug"), hybridNavigation = {
        resetNavigationBar: function(successCallback, failedCallback) {
            var p = {};
            callObjMethod("TBNavigationBar", "resetNavigationBar", p, successCallback, failedCallback);
        },
        switchNavigationBar: function(navTitle, type, token, successCallback, failedCallback) {
            var p = {
                title: navTitle,
                type: type,
                t: token
            };
            callObjMethod("TBNavigationBar", "setNavigationBar", p, successCallback, failedCallback);
        },
        setTitle: function(navTitle, successCallback, failedCallback) {
            var p = {
                title: navTitle
            };
            callObjMethod("TBNavigationBar", "setNavigationTitle", p, successCallback, failedCallback);
        },
        isReady: function(successCallback, failedCallback) {
            var p = {};
            callObjMethod("TBNavigationBar", "isReady", p, successCallback, failedCallback);
        }
    }, app = {};
    function initComponent() {
        var viewport = app.config.viewport, navibar = viewport.querySelector("header.navibar"), backBtn = navibar.querySelector("li:nth-child(2) button"), funcBtn = navibar.querySelector("li:nth-child(3) button");
        content = viewport.querySelector("section.content"), toolbar = viewport.querySelector("footer.toolbar");
        Component.initViewport(viewport);
        Component.initContent(content);
        if (app.config.enableScroll) {
            Component.initScroll(content);
        }
        if (app.config.enableTransition) {
            Component.initTransition(content);
        }
    }
    function initNavigation() {
        var navibar = Component.get("navibar"), backBtn = Component.get("backBtn"), funcBtn = Component.get("funcBtn"), backBtnHandler = null, funcBtnHandler = null, content = Component.get("content"), transition = Component.get("transition");
        win.addEventListener(window.onpagehide ? "pagehide" : "unload", function() {
            hybridNavigation.resetNavigationBar();
        }, false);
        doc.addEventListener("navigation.back", function() {
            if (backBtnHandler) {
                backBtnHandler();
            } else {
                navigate.backward();
            }
        }, false);
        function setNavibar(navigation, move) {
            var pageName = navigation.pageName, transition = navigation.state.transition, page = Page.get(pageName), title = page.getTitle();
            move ? hybridNavigation.switchNavigationBar(title, transition, doc.location.href) : hybridNavigation.setTitle(title);
        }
        function switchNavigation(navigation) {
            if (app.config.enableTransition) {
                transition.fn[navigation.state.transition]();
            } else {
                content.fn.switchActive();
                content.fn.toggleClass();
            }
            if (app.navigation._cur) {
                app.navigation._cur.unload();
            }
            app.navigation._cur = navigation;
            navigation.load(function() {
                navigation.ready();
                setNavibar(navigation, false);
            });
        }
        navigate.on("forward backward", function(state) {
            var navigation = new Navigation(state);
            setNavibar(navigation, true);
            switchNavigation(navigation);
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
            page.on("rendered", function(content) {
                var scroll = Component.get("scroll"), active = Component.getActiveContent();
                active && (active.innerHTML = content);
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
            enableNavibar: false,
            enableScroll: false,
            enableTransition: false,
            enableToolbar: false,
            templateEngine: null
        },
        view: View,
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
            hybridNavigation.isReady(function() {
                router.start();
            });
        }
    });
    win["app"] = app;
});

require("mix/sln/0.3.4/app-hybrid-debug");