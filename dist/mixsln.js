(function(win, app, undef) {

var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+), [-\d.]+, \d+\)/,
	MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d.]+), ([-\d.]+)\)$/,
	TRANSFORM_REG = /^(translate|rotate|scale)(X|Y|Z|3d)?|(matrix)(3d)?|(perspective)|(skew)(X|Y)?$/i,

    isAndroid = (/android/gi).test(navigator.appVersion),
    isIOS = (/iphone|ipad/gi).test(navigator.appVersion),
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()
    ;

function addPx(v) {
	v += '';

	if (v.indexOf('px') < 0 && v.indexOf('%') < 0 && v !== '0') {
		v += 'px';
	}
	return v;
}

function addDeg(v) {
	v += '';

	if (v.indexOf('deg') < 0 & v !== '0') {
		v += 'deg';
	}

	return v;
}

function toCamelCase(str, sep) {
	sep || (sep = '-');

	str.replace(new RegExp(sep + '[a-z]', 'g'), function(v) {
		return v.split(sep)[1].toUpperCase();
	})

	return str;
}

function toDelimiterCase(str, sep) {
	sep || (sep = '-');

	return str.replace(/[a-z][A-Z]/g, '$1' + sep +'$2').toLowerCase();
}

var Animation = {
    translate: function(element, duration, timingFunction, delay, x, y, callback) {
	    this.doTransition(element, {
	    	translate: [x, y]
	    }, {
	    	duration: duration,
	    	timingFunction: timingFunction,
	    	delay: delay,
	    	callback: callback
	    });
    },

    doTransition: function(element, properties, options) {
    	var postfix = [options.duration, options.timingFunction || 'ease', options.delay || '0s'].join(' '),
    		matches, transform = '', transition = [], styles = {}
    		;

    	for (var p in properties) {
    		var v = properties[p];
    		if ((matches = p.match(TRANSFORM_REG))) {
	    		if (!(v instanceof Array)) {
	    			v = [v];
	    		}

    			var a = matches[1] || matches[3] || matches[5] || matches[6],
    				b = matches[2] || matches[4] || matches[7] || ''
    				;

    			if (a === 'translate' && b === '' && has3d) {
    				b = '3d';
    				v.push(0);
    			}
    			if (a === 'translate') {
    				v = v.map(addPx);
    			} else if (a === 'rotate' || a === 'skew') {
    				v = v.map(addDeg);
    			}
    			transform += a + b + '(' + v.join(',') + ')';
    		} else {
    			transition.push(toDelimiterCase(p) + ' ' + postfix);
    			styles[p] = v;
    		}

    		transform && transition.push('-webkit-transform ' + postfix);
    	}

    	options.callback && element.addEventListener('webkitTransitionEnd', function(e){
	    	element.removeEventListener('webkitTransitionEnd', arguments.callee, false);
	        if(e.srcElement !== element) return;
	        setTimeout(options.callback, 10);
	    }, false);

    	setTimeout(function() {
	    	element.style.webkitTransition = transition.join(', ');
	    	if (transform.length) {
	    		element.style.webkitTransform = transform;
	    	}
	    	for (var p in styles) {
	    		element.style[p] = styles[p];
	    	}
    	}, 10);
    },

    genCubicBezier: function(a, b) {
		return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        	[(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
    },

    makeTranslateString: function(x, y) {
		x = addPx(x);
		y = addPx(y);

	    if (has3d) {
	        return 'translate3d(' + x + ', ' + y + ', 0)';
	    } else {
	        return 'translate(' + x + ', ' + y + ')';
	    }
    },

    getTransformOffset: function(el) {
	    var offset = {
	    		x: 0,
	    		y: 0
	    	}, 
	    	transform = getComputedStyle(el).webkitTransform, 
	    	matchs, reg;

	    if (transform !== 'none') {
	    	reg = transform.indexOf('matrix3d') > -1 ? MATRIX3D_REG : MATRIX_REG;
	        if((matchs = transform.match(reg))) {
	            offset.x = parseInt(matchs[1]) || 0;
	            offset.y = parseInt(matchs[2]) || 0;
	        }
	    }

	    return offset;
    }
}

app.module.Animation = Animation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Content(wrapEl, options) {
	options || (options = {});
	this._wrapEl = wrapEl;
	this._cacheLength = Math.max(options.cacheLength, 1);
	this._cacheIndex = 0;

	var html = '';
	for (var i = 0; i < this._cacheLength; i++) {
		html += '<div class="inactive" index="' + i + '"></div>';
	}
	this._wrapEl.innerHTML = '<div class="wrap">' + html + '</div>';

	this.setClassName();
}

var ContentProto = {
	setClassName: function() {
		this.getActive().className = 'active';
		if (this._cacheLength > 2) {
			this.getPrevious().className = 'inactive prev';
			this.getNext().className = 'inactive next';
		} else if (this._cacheLength > 1){
			this.getPrevious().className = 'inactive';
		}
	},

	getActive : function() {
		var index = this._cacheIndex;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
	},

	getNext: function() {
		var index = (this._cacheIndex + 1) % this._cacheLength;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
	},

	getPrevious: function() {
		var index = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		return this._wrapEl.querySelector('.wrap > div:nth-child(' + (index + 1) + ')');
	},

	next: function() {
		if (this._cacheLength > 2) {
			this.getPrevious().className = 'inactive';
		}
		this._cacheIndex = (this._cacheIndex + 1) % this._cacheLength;
	},

	previous: function() {
		if (this._cacheLength > 2) {
			this.getNext().className = 'inactive';
		}
		this._cacheIndex = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
	},

	html: function(html) {
		this.getActive().innerHTML = html;
	}
}

for (var p in ContentProto) {
	Content.prototype[p] = ContentProto[p];
}

app.module.Content = Content;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document,
    docEl = doc.documentElement,
    slice = Array.prototype.slice,
    gestures = {}, lastTap = null
    ;

function getCommonAncestor (el1, el2) {
    var el = el1;
    while (el) {
        if (el.contains(el2) || el == el2) {
            return el;
        }
        el = el.parentNode;
    }    
    return null;
}

function fireEvent(element, type, extra) {
    var event = doc.createEvent('HTMLEvents');
    event.initEvent(type, false, true);

    if(typeof extra === 'object') {
        for(var p in extra) {
            event[p] = extra[p];
        }
    }

    while(event.cancelBubble === false && element) {
        element.dispatchEvent(event);
        element = element.parentNode;
    }
}

function calc(x1, y1, x2, y2, x3, y3, x4, y4) {
    var rotate = Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y2 - y1, x2 - x1),
        scale = Math.sqrt((Math.pow(y4 - y3, 2) + Math.pow(x4 - x3, 2)) / (Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))),
        translate = [x3 - scale * x1 * Math.cos(rotate) + scale * y1 * Math.sin(rotate), y3 - scale * y1 * Math.cos(rotate) - scale * x1 * Math.sin(rotate)]
        ;
    return {
        rotate: rotate,
        scale: scale,
        translate: translate,
        matrix: [
            [scale * Math.cos(rotate), -scale * Math.sin(rotate), translate[0]],
            [scale * Math.sin(rotate), scale * Math.cos(rotate), translate[1]],
            [0, 0, 1]
        ]
    }
}

function touchstartHandler(event) {

    if (Object.keys(gestures).length === 0) {
        docEl.addEventListener('touchmove', touchmoveHandler, false);
        docEl.addEventListener('touchend', touchendHandler, false);
        docEl.addEventListener('touchcancel', touchcancelHandler, false);
    }
    
    for(var i = 0 ; i < event.changedTouches.length ; i++ ) {
        var touch = event.changedTouches[i],
            touchRecord = {};

        for (var p in touch) {
            touchRecord[p] = touch[p];
        }

        var gesture = {
            startTouch: touchRecord,
            startTime: Date.now(),
            status: 'tapping',
            element: event.srcElement,
            pressingHandler: setTimeout(function(element) {
                return function () {
                    if (gesture.status === 'tapping') {
                        gesture.status = 'pressing';

                        fireEvent(element, 'press', {
                            touchEvent:event
                        });
                    }

                    clearTimeout(gesture.pressingHandler);
                    gesture.pressingHandler = null;
                }
            }(event.srcElement), 500)
        }
        gestures[touch.identifier] = gesture;
    }

    if (Object.keys(gestures).length == 2) {
        var elements = [];

        for(var p in gestures) {
            elements.push(gestures[p].element);
        }

        fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchstart', {
            touches: slice.call(event.touches),
            touchEvent: event
        });
    }
}


function touchmoveHandler(event) {
    for(var i = 0 ; i < event.changedTouches.length ; i++ ) {
        var touch = event.changedTouches[i],
            gesture = gestures[touch.identifier];

        if (!gesture) {
            return;
        }

        var displacementX = touch.clientX - gesture.startTouch.clientX,
            displacementY = touch.clientY - gesture.startTouch.clientY,
            distance = Math.sqrt(Math.pow(displacementX, 2) + Math.pow(displacementY, 2));

        // magic number 10: moving 10px means pan, not tap
        if (gesture.status === 'tapping' && distance > 10) {
            gesture.status = 'panning';
            fireEvent(gesture.element, 'panstart', {
                touch:touch,
                touchEvent:event
            });

            if(Math.abs(displacementX) > Math.abs(displacementY)) {
                fireEvent(gesture.element, 'horizontalpanstart', {
                    touch: touch,
                    touchEvent: event
                });
                gesture.isVertical = false;
            } else {
                fireEvent(gesture.element, 'verticalpanstart', {
                    touch: touch,
                    touchEvent: event
                });
                gesture.isVertical = true;
            }
        }

        if (gesture.status === 'panning') {
            gesture.panTime = Date.now();
            fireEvent(gesture.element, 'pan', {
                displacementX: displacementX,
                displacementY: displacementY,
                touch: touch,
                touchEvent: event
            });


            if(gesture.isVertical) {
                fireEvent(gesture.element, 'verticalpan',{
                    displacementY: displacementY,
                    touch: touch,
                    touchEvent: event
                });
            } else {
                fireEvent(gesture.element, 'horizontalpan',{
                    displacementX: displacementX,
                    touch: touch,
                    touchEvent: event
                });
            }
        }
    }

    if (Object.keys(gestures).length == 2) {
        var position = [],
            current = [],
            elements = [],
            transform
            ;
        
        for(var i = 0 ; i < event.touches.length ; i++ ) {
            var touch = event.touches[i];
            var gesture = gestures[touch.identifier];
            position.push([gesture.startTouch.clientX, gesture.startTouch.clientY]);
            current.push([touch.clientX, touch.clientY]);
        }

        for(var p in gestures) {
            elements.push(gestures[p].element);
        }

        transform = calc(position[0][0], position[0][1], position[1][0], position[1][1], current[0][0], current[0][1], current[1][0], current[1][1]);
        fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouch',{
            transform : transform,
            touches : event.touches,
            touchEvent: event
        });
    }
}


function touchendHandler(event) {

    if (Object.keys(gestures).length == 2) {
        var elements = [];
        for(var p in gestures) {
            elements.push(gestures[p].element);
        }
        fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchend', {
            touches: slice.call(event.touches),
            touchEvent: event
        });
    }
    
    for (var i = 0; i < event.changedTouches.length; i++) {
        var touch = event.changedTouches[i],
            id = touch.identifier,
            gesture = gestures[id];

        if (!gesture) continue;

        if (gesture.pressingHandler) {
            clearTimeout(gesture.pressingHandler);
            gesture.pressingHandler = null;
        }

        if (gesture.status === 'tapping') {
            gesture.timestamp = Date.now();
            fireEvent(gesture.element, 'tap', {
                touch: touch,
                touchEvent: event
            });

            if(lastTap && gesture.timestamp - lastTap.timestamp < 300) {
                fireEvent(gesture.element, 'doubletap', {
                    touch: touch,
                    touchEvent: event
                });
            }

            this.lastTap = gesture;
        }

        if (gesture.status === 'panning') {
            fireEvent(gesture.element, 'panend', {
                touch: touch,
                touchEvent: event
            });

            var duration = Date.now() - gesture.startTime,
                velocityX = (touch.clientX - gesture.startTouch.clientX) / duration,
                velocityY = (touch.clientY - gesture.startTouch.clientY) / duration,
                displacementX = touch.clientX - gesture.startTouch.clientX,
                displacementY = touch.clientY - gesture.startTouch.clientY
                ;
            
            if (duration < 300) {
                fireEvent(gesture.element, 'flick', {
                    duration: duration,
                    velocityX: velocityX,
                    velocityY: velocityY,
                    displacementX: displacementX,
                    displacementY: displacementY,
                    touch: touch,
                    touchEvent: event
                });

                if(gesture.isVertical) {
                    fireEvent(gesture.element, 'verticalflick', {
                        duration: duration,
                        velocityY: velocityY,
                        displacementY: displacementY,
                        touch: touch,
                        touchEvent: event
                    });
                } else {
                    fireEvent(gesture.element, 'horizontalflick', {
                        duration: duration,
                        velocityX: velocityX,
                        displacementX: displacementX,
                        touch: touch,
                        touchEvent: event
                    });
                }
            }
        }

        if (gesture.status === 'pressing') {
            fireEvent(gesture.element, 'pressend', {
                touch: touch,
                touchEvent: event
            });
        }

        delete gestures[id];
    }

    if (Object.keys(gestures).length === 0) {
        docEl.removeEventListener('touchmove', touchmoveHandler, false);
        docEl.removeEventListener('touchend', touchendHandler, false);
        docEl.removeEventListener('touchcancel', touchcancelHandler, false);
    }
}

function touchcancelHandler(event) {

    if (Object.keys(gestures).length == 2) {
        var elements = [];
        for(var p in gestures) {
            elements.push(gestures[p].element);
        }
        fireEvent(getCommonAncestor(elements[0], elements[1]), 'dualtouchend', {
            touches: slice.call(event.touches),
            touchEvent: event
        });
    }

    for (var i = 0; i < event.changedTouches.length; i++) {
        if (gesture.status === 'panning') {
            fireEvent(gesture.element, 'panend', {
                touch: touch,
                touchEvent: event
            });
        }
        if (gesture.status === 'pressing') {
            fireEvent(gesture.element, 'pressend', {
                touch: touch,
                touchEvent: event
            });
        }
        delete gestures[event.changedTouches[i].identifier];
    }

    if (Object.keys(gestures).length === 0) {
        docEl.removeEventListener('touchmove', touchmoveHandler, false);
        docEl.removeEventListener('touchend', touchendHandler, false);
        docEl.removeEventListener('touchcancel', touchcancelHandler, false);
    }
}

docEl.addEventListener('touchstart', touchstartHandler, false);

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

function EventSource() {
	this._handlers = {};
}

var EventSourceProto = {
	addEventListener: function(type, handler) {
		var handlers = this._handlers, list;

		list = handlers[type] || (handlers[type] = []);
		list.push(handler);
	},

	removeEventListener: function(type, handler) {
		var handlers = this._handlers;

		if (!handlers[type]) return;

		handlers[type] = handlers[type].filter(function(h) {
			return h != handler;
		});

		if (!handlers[type].length) {
			delete handlers[type];
		}
	},

	dispatchEvent: function(e) {
		var handlers = this._handlers,
			type = e.type;

		handlers.hasOwnProperty(type)  &&
			handlers[type].forEach(function(handler) {
				handler(e);
			});

		this['on' + type] && this['on' + type](e);
	}
}

for (var p in EventSourceProto) {
	EventSource.prototype[p] = EventSourceProto[p];
} 

var SCOPES = {},
	SPLITER_REG = /\s+/
	;

function MessageScope(scope) {
	var that = this;

	this._scope = scope;
	this._source = new EventSource();
	this._cache = {};

	this._handler = function(e) {
		var type = e.type, args = e.args,
			list = that._cache[type]
			;

        for (var i = 0; i < list.length; i += 2) {
            list[i].apply(list[i + 1], args);
        }
	}

	SCOPES[scope] = this;
}

var MessageScopeProto = {
	on: function(events, callback, context) {
		var that = this,
			cache = that._cache,
			source = that._source,
			list, event
			;

		if (!callback) return that;

		events = events.split(SPLITER_REG);

        while (event = events.shift()) {
            list = cache[event] || (cache[event] = []);
            if (!list.length) {
            	source.addEventListener(event, this._handler);	
            }
            list.push(callback, context);
        }

        return that; 
	},

	off: function(events, callback, context) {
		var that = this,
			cache = that._cache,
			source = that._source,
			list, event
			;

        if (events) {
        	events = events.split(SPLITER_REG);
        } else {
        	events = Object.keys(cache);
        }

        while (event = events.shift()) {
        	!(callback || context) && (cache[event] = []);

        	list = cache[event];

            for (var i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback ||
                        context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }

            if (!list.length) {
            	delete cache[event];
            	source.removeEventListener(event, this._handler);
        	}
        }

        return that;
	},

	once: function(events, callback, context) {
        var that = this
            ;

        function onceHandler() {
            callback.apply(this, arguments);
            that.off(events, onceHandler, context);
        }

        return that.on(events, onceHandler, context);
	},

	after: function(events, callback, context) {
		var that = this,
			state = {}
			;

		if (!callback) return that;

		function checkState() {
			for (var ev in state) {
				if (!state[ev]) return;
			}
			callback.apply(context);
		}

		events = events.split(SPLITER_REG);

		events.forEach(function(ev) {
			state[ev] = false;
			that.once(ev, function() {
				state[ev] = true;
				checkState();
			});
		});
	},

	trigger: function(events) {
		var that = this,
			cache = that._cache,
			source = that._source,
			args, event
			;

		events = events.split(SPLITER_REG);
		args = Array.prototype.slice.call(arguments, 1);

		while (event = events.shift()) {
			that.log(event, args);

			if (cache[event]) {
				source.dispatchEvent({
					type: event, 
					args: args
				});
			}
		}

		return that;
	},

    log : function(event, args) {
    	if (app.config && app.config.enableMessageLog) {
        	console.log('[Message]', {scope:this._scope, event: event, args:args});
    	}
    }
}

for (var p in MessageScopeProto) {
	MessageScope.prototype[p] = MessageScopeProto[p];
}

MessageScope.mixto = function(obj, scope) {
	var context;

	if (typeof scope === 'string') {
		context = SCOPES[scope] || new MessageScope(scope);
	} else {
		context = scope;
	}

    obj.prototype && (obj = obj.prototype);

    for (var name in MessageScopeProto) {
		void function(func) {
			obj[name] = function() {
        		func.apply(context, arguments);
    		}
    	}(MessageScopeProto[name]);
    }
}

MessageScope.get = function(scope) {
	return SCOPES[scope] || (SCOPES[scope] = new MessageScope(scope));
}

app.module.EventSource = EventSource;
app.module.MessageScope = MessageScope;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document
	;

function _setButton(btn, options) {
	(options.id != null) && btn.setAttribute('id', options.id);
	(options['class'] != null) && (btn.className = options['class']);
	(options.text != null) && (btn.innerHTML = options.text);
	(options.bg != null) && (btn.style.background = options.bg);
	(options.icon != null) && (btn.innerHTML = '<img src="' + options.icon + '" border="0" />');
	(options.hide === true) ? (btn.style.display = 'none'):(btn.style.display = '');
	options.onChange && options.onChange.call(btn, options);
	if (options.handler) {
		btn.handler && btn.removeEventListener('click', btn.handler, false);
		btn.addEventListener('click', (btn.handler = options.handler), false);
	}
}

function Navbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
	this._animWrapEl = options.animWrapEl;
	this._backWrapEl = options.backWrapEl;
	this._funcWrapEl = options.funcWrapEl;
	this._titleWrapEl = options.titleWrapEl;
}

var NavbarProto = {
    setTitle: function(title) {
    	this._titleWrapEl && (this._titleWrapEl.innerHTML = title);
    },

    setButton: function(options) {
    	var wrap, btn;
    	if (options.type === 'back') {
    		wrap = this._backWrapEl;
    		btn = wrap.querySelector('button');
    	} else if (options.type === 'func') {
    		wrap = this._funcWrapEl;
    		btn = wrap.querySelector('#' + options.id);
    	} else if (options.id) {
    		btn = this._wrapEl.querySelector('#' + options.id);
    		btn && (wrap = btn.parentNode);
    	}

		if (!btn && wrap) {
			btn = doc.createElement('button');
			wrap.appendChild(btn);
		}
		_setButton(btn, options);
    },

    getButton: function(id) {
    	return this._funcWrapEl.querySelector('button#' + id);
    },

    removeButton: function(id) {
    	if (!id) {
    		var btns = this._funcWrapEl.querySelectorAll('button');
    		for (var i = 0; i < btns.length; i++) {
    			this.removeButton(btns[i]);
    		}
    	} else {
	    	if (typeof id === 'string') {
	    		var btn = this.getButton(id);
	    	} else if (id instanceof HTMLElement) {
	    		var btn = id;
	    	}
			if (btn) {
				btn.handler && btn.removeEventListener('click', btn.handler);
				btn.parentNode.removeChild(btn);
			}
		}
    }
}

for (var p in NavbarProto) {
	Navbar.prototype[p] = NavbarProto[p];
}

app.module.Navbar = Navbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


var Message = app.module.MessageScope,
	pages = {}
	;

function extend(target, properties) {
	for (var key in properties) {
		if (properties.hasOwnProperty(key)) {
			target[key] = properties[key];
		}
	}
}

function inherit(child, parent) {
	function Ctor() {}
	Ctor.prototype = parent.prototype;
	var proto = new Ctor();
	extend(proto, child.prototype);
	proto.constructor = child;
	child.prototype = proto;
}

function Page() {
}

var PageProto = {
	startup : function() {/*implement*/},
	teardown : function() {/*implement*/}	
}

for (var p in PageProto) {
	Page.prototype[p] = PageProto[p];
} 

Page.fn = {};

Page.define = function(properties) {
	function ChildPage() {
		Page.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
		Message.mixto(this, 'page.' + this.name);
	}
	inherit(ChildPage, Page);
	extend(ChildPage.prototype, Page.fn);
	extend(ChildPage.prototype, properties);

	return (pages[properties.name] = new ChildPage());
}

Page.get = function(name) {
	return pages[name];
}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document
	;

function Template() {
}

var TemplateProto = {
	load: function(url, callback) {
		// can overwrite
		var that = this, engine
			;

		if (app && app.config) {
			engine = app.config.templateEngine;
		}

		function loaded(text) {
			callback && callback(text);
		}

		if (engine && engine.load && typeof url === 'string') {
			engine.load(url, loaded);
		} else {
			loaded(url);
		}
	},

	compile: function(text) {
		// can overwrite
		var that = this, engine 
			;

		if (app && app.config) {
			engine = app.config.templateEngine;
		}

		that.originTemplate = text;

		if (engine && engine.compile && typeof text === 'string') {
			that.compiledTemplate = engine.compile(text);
		} else {
			that.compiledTemplate = function() {return text};
		}

		return that.compiledTemplate;
	},

	render: function(datas) {
		// can overwrite
		var that = this, engine,
			compiledTemplate = that.compiledTemplate
			;

		if (app && app.config) {
			engine = app.config.templateEngine;
		}

		if (engine && engine.render && typeof datas === 'object' && compiledTemplate) {
			that.content = engine.render(compiledTemplate, datas);
		} else {
			that.content = compiledTemplate(datas);
		}

		return that.content;
	}
}

for (var p in TemplateProto) {
	Template.prototype[p] = TemplateProto[p];
} 

app.module.Template = Template;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document
	;


function Toolbar(wrapEl, options) {
	options || (options = {});

	this._wrapEl = wrapEl;
    this.set(options);
}

var ToolbarProto = {
    set: function(options) {
        options || (options = {});
        this._wrapEl.innerHTML = '';
        options.html && (this._wrapEl.innerHTML = options.html);
        options.el && (this._wrapEl.appendChild(options.el));
        options.height && (this._wrapEl.style.height = options.height + 'px');
    },

    show: function(options) {
        options && this.set(options);
    	this._wrapEl.style.display = '';
    },

    hide: function() {
    	this._wrapEl.style.display = 'none';
    }
}

for (var p in ToolbarProto) {
	Toolbar.prototype[p] = ToolbarProto[p];
}

app.module.Toolbar = Toolbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

var doc = win.document,
	views = {}
	;

function extend(target, properties) {
	for (var key in properties) {
		if (properties.hasOwnProperty(key)) {
			target[key] = properties[key];
		}
	}
}

function inherit(child, parent) {
	function Ctor() {}
	Ctor.prototype = parent.prototype;
	var proto = new Ctor();
	extend(proto, child.prototype);
	proto.constructor = child;
	child.prototype = proto;
}
	
function View() {
	var el = document.createElement('div'), $el, $ = win['$'];

	if (this.el) {
		var selectors = this.el.split(/\s*\>\s*/),
			wrap = el
			;

		selectors.forEach(function(selector) {
			var matches;
			if ((matches = selector.match(/^(\w+)?(?:\#([^.]+))?(?:\.(.+))?$/i))) {
				var node = document.createElement(matches[1] || 'div');
				matches[2] && node.setAttribute('id', matches[2]);
				matches[3] && (node.className = matches[3]);
				wrap.appendChild(node);
			} else {
				wrap.innerHTML = selector;
			}
			wrap = wrap.childNodes[0];
		});

		el = el.childNodes[0];
	}


	Object.defineProperty(this, 'el', {
		get: function() {
			return el;
		}
	});

	if ($) {
		$el = $(el);
		Object.defineProperty(this, '$el', {
			get: function() {
				return $el;
			}
		});
	}
}

var ViewProto = {
	render: function(callback) {/*implement*/},
	destory: function(callback) {/*implement*/}
}

for (var p in ViewProto) {
	View.prototype[p] = ViewProto[p];
} 

View.fn = {};

View.extend = function(properties) {
	function ChildView() {
		View.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
	}
	inherit(ChildView, View);
	extend(ChildView.prototype, View.fn);
	extend(ChildView.prototype, properties);
	
	return (views[properties.name] = ChildView);
}

View.get = function(name) {
	return views[name];
}

app.module.View = View;

})(window, window['app']||(window['app']={module:{},plugin:{}}));


(function(win, app, undef) {

var doc = win.document,
	anim = app.module.Animation,
	TYPE_XY = {
		'L': 'x',
		'R': 'x',
		'T': 'y',
		'B': 'y'
	},
	TYPE_RATIO = {
		'L': -1,
		'R': 1,
		'T': -1,
		'B': 1
	}
	;

function anime(element, type, delegate, callback) {
	var TYPE = this.TYPE, xy, ratio,
		offset = anim.getTransformOffset(element),
		from = {
			translate: {
				x: offset.x,
				y: offset.y
			}
		},
		to = {
			translate: {
				x: offset.x,
				y: offset.y
			}
		}
		;

	type = type.split('');
	delegate(from, to, type[0], type[1]);

	for (var p in from) {
		if (p === 'translate') {
			element.style.webkitTransition = '';
			element.style.webkitTransform = anim.makeTranslateString(from[p].x, from[p].y);
		} else {
			element.style[p] = from[p];
		}
	}
	to.translate = [to.translate.x, to.translate.y];
	
	element.style.webkitBackfaceVisibility = 'hidden';
	element.style.webkitTransformStyle = 'preserve-3d';

	anim.doTransition(element, to, {
		duration: '0.4s',
		timingFunction: 'ease',
		callback : function() {
			element.style.webkitBackfaceVisibility = 'initial';
			element.style.webkitTransformStyle = 'flat';
			callback && callback();
		}
	});	 
}


var Transition = {
	TYPE : {
		LEFT_IN: 'LI',
		LEFT_OUT: 'LO',
		RIGHT_IN: 'RI',
		RIGHT_OUT: 'RO',
		TOP_IN: 'TI',
		TOP_OUT: 'TO',
		BOTTOM_IN: 'BI',
		BOTTOM_OUT: 'BO'
	},

	move: function(element, offsetX, offsetY, callback) {
		var offset = anim.getTransformOffset(element)
			;

		element.style.webkitBackfaceVisibility = 'hidden';
		element.style.webkitTransformStyle = 'preserve-3d';

		anim.translate(element,
			'0.4s', 'ease', '0s',
			offset.x + offsetX, offset.y + offsetY,
			function() {
				element.style.webkitBackfaceVisibility = 'initial';
				element.style.webkitTransformStyle = 'flat';
				callback && callback();
			}
		)
	},

	slide: function(element, type, offset, callback) {
		anime(element, type, function(from, to, type1, type2) {
			var xy = TYPE_XY[type1],
				ratio = TYPE_RATIO[type1];

			if (type2 === 'I') {
				from.translate[xy] += ratio * offset;
			} else {
				to.translate[xy] += ratio * offset;
			}
		}, callback);		
	},

	float: function(element, type, offset, callback) {
		anime(element, type, function(from, to, type1, type2) {
			var xy = TYPE_XY[type1],
				ratio = TYPE_RATIO[type1];

			if (type2 === 'I') {
				from.translate[xy] += ratio * offset;
				from.opacity = 0;
				to.opacity = 1;
			} else {
				to.translate[xy] += ratio * offset;
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},

	fadeIn: function(element, callback) {
		anime(element, 'FI', function(from, to, type1, type2) {
			if (type2 === 'I') {
				from.opacity = 0;
				to.opacity = 1;
			} else {
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},

	fadeOut: function(element, options) {
		anime(element, 'FO', function(from, to, type1, type2) {
			if (type2 === 'I') {
				from.opacity = 0;
				to.opacity = 1;
			} else {
				from.opacity = 1;
				to.opacity = 0;
			}
		}, callback);
	},


	zoomIn: function(element, options) {

	},

	zoomOut: function(element, options) {

	}
}

app.module.Transition = Transition;

})(window, window['app']||(window['app']={module:{},plugin:{}}));



(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	element, offset, minScrollTop, maxScrollTop,
	panFixRatio = 2,
	cancelScrollEnd = false,
	lockTouched = 0;
	stopBounce = false,
	prevented = false
	;

function getMinScrollTop(el) {
	return 0 - (el.bounceTop || 0);
}

function getMaxScrollTop(el) {
    var rect = el.getBoundingClientRect(),
    	pRect = el.parentNode.getBoundingClientRect(),
    	minTop = getMinScrollTop(el),
    	maxTop = 0 - rect.height + pRect.height
    	;

    return Math.min(maxTop + (el.bounceBottom || 0), minTop);
}

function fireEvent(element, eventName, extra) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, false, true);
	for (var p in extra) {
		event[p] = extra[p];
	}
    element.dispatchEvent(event);
}

function touchstartHandler(e) {
	if (stopBounce) return;

	var parentElement = e.srcElement;
	while (!parentElement.boundScrollEvent) {
		parentElement = parentElement.parentNode || parentElement.offsetParent;
	}
	element = parentElement.boundScrollElement;

	if (!element) return;
	element.style.webkitBackfaceVisibility = 'hidden';
	element.style.webkitTransformStyle = 'preserve-3d';
	element.style.webkitTransition = '';
	element.style.webkitTransform = getComputedStyle(element).webkitTransform;
}

function touchmoveHandler(e) {	
	e.preventDefault();
	return false;
}

function touchendHandler(e) {
	// TODO
}

function panstartHandler(e) {
	if (stopBounce || !element) return;

	offset = anim.getTransformOffset(element);
	minScrollTop = getMinScrollTop(element);
	maxScrollTop = getMaxScrollTop(element);
	panFixRatio = 2.5;
	stopBounce = false;
	cancelScrollEnd = false;
	fireEvent(element, 'scrollstart');
}

function panHandler(e) {
	if (stopBounce || !element) return;

    var y = offset.y + e.displacementY
        ;

    if(y > minScrollTop) {
    	y = minScrollTop + (y - minScrollTop) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    } else if(y < maxScrollTop) {
    	y = maxScrollTop - (maxScrollTop - y) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    }

    if ((getBoundaryOffset(y))) {
    	if (y > minScrollTop) {
    		var name = 'pulldown';
    	} else if (y < maxScrollTop) {
    		var name = 'pullup';
    	}
    	fireEvent(element, name);
    }

    element.style.webkitTransition = '';
    element.style.webkitTransform = anim.makeTranslateString(offset.x, y);
}

function panendHandler(e) {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y
	if (getBoundaryOffset(y)) {
		bounceEnd();
	} else {
		scrollEnd();
	}
}

function getBoundaryOffset(y) {
	if(y > minScrollTop) {
        return y - minScrollTop;
    } else if (y < maxScrollTop){
        return maxScrollTop - y;
    }
}

function touchBoundary(y) {
	if (y > minScrollTop) {
		y = minScrollTop;
	} else if (y < maxScrollTop) {
		y = maxScrollTop;
	}

	return y;
}

function bounceStart(v) {
	if (stopBounce || !element) return;

    var s0 = anim.getTransformOffset(element).y,
    	a = 0.008 * ( v / Math.abs(v));
    	t = v / a;
    	s = s0 + t * v / 2
    	;

    fireEvent(element, 'bouncestart');

    anim.translate(element, 
    	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
    	offset.x, s.toFixed(0),
		bounceEnd
    );
}

function bounceEnd() {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y;
	y = touchBoundary(y);

    anim.translate(element, 
    	'0.4s', 'ease-in-out', '0s', 
    	offset.x, y,
    	function() {
    		fireEvent(element, 'bounceend');
    		scrollEnd();
    	}
    );
}

function flickHandler(e) {
	if (stopBounce || !element) return;
	
    var s0 = anim.getTransformOffset(element).y,
        v, a, t, s,
        _v, _s, _t
        ;

    cancelScrollEnd = true;

    if(s0 > minScrollTop || s0 < maxScrollTop) {
    	bounceStart(v);
    } else {
    	v = e.velocityY;
        if (v > 1.5) v = 1.5;
        if (v < -1.5) v = -1.5;
        a = 0.0015 * ( v / Math.abs(v));
		t = v / a;
        s = s0 + t * v / 2;

        if (s > minScrollTop) {
    	    _s = minScrollTop - s0;
            _t = (v - Math.sqrt(-2 * a *_s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	offset.x, minScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
            
        } else if (s < maxScrollTop) {
            _s = maxScrollTop - s0;
            _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	offset.x, maxScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
        } else {
	        anim.translate(element, 
	        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
	        	offset.x, s.toFixed(0),
	        	scrollEnd
	        );
        }
	}
}

function scrollEnd() {
	if (stopBounce || !element) return;
	
	cancelScrollEnd = false;

	setTimeout(function() {
		if (!cancelScrollEnd) {
			element.style.webkitBackfaceVisibility = 'initial';
			element.style.webkitTransformStyle = 'flat';
			fireEvent(element, 'scrollend');
		}
	}, 10);
}

var Scroll = {
	enable: function(element, options) {
		var parentElement = element.parentNode || element.offsetParent
			;

	    if (!prevented) {
	    	prevented = true;
	    	docEl.addEventListener('touchmove', touchmoveHandler, false);
	    }

	    if (!parentElement.boundScrollEvent) {
	    	parentElement.boundScrollEvent = true;
			parentElement.addEventListener('touchstart', touchstartHandler, false);
			parentElement.addEventListener('touchend', touchendHandler, false);
		    parentElement.addEventListener('panstart', panstartHandler, false);
		    parentElement.addEventListener('pan', panHandler, false);
		    parentElement.addEventListener('panend', panendHandler, false);
		    parentElement.addEventListener('flick', flickHandler, false);
	    }
	    parentElement.boundScrollElement = element;

		if (options) {
			element.bounceTop = options.bounceTop;
			element.bounceBottom = options.bounceBottom;
		} else {
			element.bounceTop = 0;
			element.bounceBottom = 0;
		}

	    if (!element.refresh) {
	    	element.getScrollHeight = function() {
	    		return element.getBoundingClientRect().height - (element.bounceTop||0) - (element.bounceBottom||0);
	    	}

		    element.getScrollTop = function() {
		    	var offset = anim.getTransformOffset(element);
	    		return -(offset.y + (element.bounceTop||0));
	    	}

		    element.refresh = function() {
		        element.style.height = 'auto';
		        element.style.height = element.offsetHeight + 'px';
		        offset = anim.getTransformOffset(element);
		        minScrollTop = getMinScrollTop(element);
		        maxScrollTop = getMaxScrollTop(element);
		        this.scrollTo(-offset.y-element.bounceTop);
		    }

		    element.offset = function(el) {
		    	var elRect = el.getBoundingClientRect(), 
		    		elementRect = element.getBoundingClientRect();

		    	elRect.top -= (element.bounceTop + elementRect.top);
		    	elRect.bottom = elRect.top + elRect.height;
		    	elRect.left -= elementRect.left;
		    	elRect.right -= elementRect.right;

		        return elRect;
		    }

		    element.scrollTo = function(y) {
		    	var x = anim.getTransformOffset(element).x,
		    		y = -y - (element.bounceTop || 0);

		    	y = touchBoundary(y);
				element.style.webkitTransition = '';
		        element.style.webkitTransform = anim.makeTranslateString(x, y);
		    }

		    element.scollToElement = function(el) {
		    	var offset = this.offset(el);
		    	this.scrollTo(offset.top);
		    }

		    element.getBoundaryOffset = function() {
			    var y = anim.getTransformOffset(element).y;
			    return getBoundaryOffset(y);
		    }

		    element.getViewHeight = function() {
		    	return element.parentNode.getBoundingClientRect().height;
		    }

		    element.stopBounce = function() {
		    	stopBounce = true;

		    	var y = anim.getTransformOffset(element).y,
		    		minScrollTop = getMinScrollTop(element),
		    		maxScrollTop = getMaxScrollTop(element),
		    		_y
		    		;

		    	if (y > minScrollTop + (element.bounceTop||0)) {
		    		_y = minScrollTop + (element.bounceTop||0);
		    	} else if (y < maxScrollTop - (element.bounceBottom||0)) {
		    		_y = maxScrollTop - (element.bounceBottom||0);
		    	}

		    	if (_y != null) {
		    		anim.translate(element,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }

		    element.resumeBounce = function() {
		    	stopBounce = false;

		    	var y = anim.getTransformOffset(element).y,
		    		minScrollTop = getMinScrollTop(element),
		    		maxScrollTop = getMaxScrollTop(element),
		    		_y
		    		;

		    	if (y > minScrollTop) {
		    		_y = minScrollTop;
		    	} else if (y < maxScrollTop){
		    		_y = maxScrollTop;
		    	}

		    	if (_y != null) {
		    		anim.translate(element,
		    			'0.4s', 'ease-in-out', '0s',
		    			offset.x, _y);
		    	}
		    }
		}

		var x = anim.getTransformOffset(element).x,
			y = - element.bounceTop;

		element.style.webkitTransition = '';
		element.style.webkitTransform = anim.makeTranslateString(x, y);
	},

	disable: function(element) {
		var parentElement = element.parentNode || element.offsetParent;

		if (parentElement.boundScrollElement === element) {
			var offset = anim.getTransformOffset(element);
			console.log(offset);
			element.style.webkitTransition = '';
			element.style.webkitTransform = anim.makeTranslateString(offset.x, offset.y);
			parentElement.boundScrollElement = null;
		}
	}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));


(function(win, app, undef) {

var Message = app.module.MessageScope,
	mid = 0, cid = 0;

function Model(data) {
	var that = this,
		initializing  = true,
		children = {}
		;

	Message.mixto(that, 'model-' + mid++);

	that.addProperty = function(key, value) {
		Object.defineProperty(that, key, {
			get: function() {
				return children[key] || data[key];
			},
			set: function(value) {
				if (children[key]) {
					children[key].destory();
					delete children[key];
				}

				if (value != null) {
					data[key] = value;
					if (typeof value === 'object') {
						children[key] = new Model(value);
						children[key].on('propertyChange',  function(e) {
							that.trigger('propertyChange', {
								target: e.target,
								value: e.value,
								name: e.name,
								path: key + '.' + e.path
							});
						});
					}
				}

				!initializing && that.trigger('propertyChange', {
					target: that,
					value: children[key] || data[key],
					name: key,
					path: key
				});
			}
		});

		that[key] = value;
	}

	that.update = function(data) {
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (!(data[i] instanceof Model)) {
					this.addProperty(i, data[i]);
				}
			}
		} else {
			for (var key in data) {
				if (that.hasOwnProperty(key)) {
					throw new Error('property conflict "' + key + '"');
				}

				if (data.hasOwnProperty(key) && !(data[key] instanceof Model)) {
					this.addProperty(key, data[key]);
				}
			}
		}
	}

	that.destory = function() {
		for (var key in children) {
			children[key].destory();
		}
		that.off();
	}

	that.on('propertyChange', function(e) {
		that.trigger('change:' + e.path, e.value);
	});

	that.update(data);

	initializing = false;
}

function Collection(data) {
	var that = this
		;

	if (!data instanceof Array) return;

	that.length = data.length;

	that.push = function(value) {
		data.push(value);
		that.length = data.length;
		that.addProperty(data.length - 1, value);
	}

	that.pop = function() {
		var value = data.pop();
		that.length = data.length;
		that[data.length] = null;
		return value;
	}

	Model.call(that, data);
}

app.module.Model = Model;
app.module.Collection = Collection;


})(window, window['app']||(window['app']={module:{},plugin:{}}));


(function(win, app, undef) {

function StateStack() {
	var that = this;

	that.move = null;
	that.transition = null;
	that.datas = null;

	that._states = [];
	that._stateIdx = 0;
	that._stateLimit = 100;
}

var StateStackProto = {
	reset: function() {
		var that = this;

		that.move = null;
		that.transition = null;
		that.datas = null;
		that.type = null;

		that._states = [];
		that._stateIdx = 0;
		that._stateLimit = 100;
	},

	pushState: function(name, fragment, params, args) {
		var that = this,				
			states = that._states,
			stateIdx = that._stateIdx,
			stateLimit = that._stateLimit,
			stateLen = states.length,
			move = that.move,
			transition = that.transition,
			datas = that.datas,
			type = that.type,

			prev = states[stateIdx - 1],
			next = states[stateIdx + 1],
			cur = {
				name : name,
				fragment : fragment,
				type: type,
				params : params || {},
				datas : datas || {}
			}
			;

		for (var p in args) {
			cur.datas[p] = args[p];
		}

		if (move == null) {
			if (!datas && StateStack.isEquals(prev, cur)) {
				transition = move = 'backward';
			} else {
				transition = move = 'forward';
			}
		}

		if (move === 'backward') {
			if (stateIdx === 0 && stateLen > 0) {
				states.unshift(cur);
			} else if (stateIdx > 0) {
				stateIdx--;
				cur = prev;
			}
		} else if (move === 'forward') {
			if (stateIdx === stateLimit - 1) {
				states.shift();
				states.push(cur);
				cur.referer = location.href.replace(/#[^#]*/, '#' + states[stateIdx - 1].fragment);
			} else if (stateIdx === 0 && stateLen === 0) {
				states.push(cur);
				cur.referer = document.referer || '';
			} else if (!datas && StateStack.isEquals(next, cur)){
				stateIdx++;
				cur = next;
			} else if (StateStack.isEquals(states[stateIdx], cur)){
				cur = states[stateIdx];
			} else {
				stateIdx++;
				states.splice(stateIdx);
				states.push(cur);
				cur.referer = location.href.replace(/#[^#]*/, '#' + states[stateIdx - 1].fragment);
			}
		}

		cur.move = move;
		cur.transition = transition;
		cur.index = stateIdx;

		that.move = null;
		that.transition = null;
		that.datas = null;
		that._stateIdx = stateIdx;

		return cur;
	},

	getState: function() {
		return this._states[this._stateIdx];
	},

	getIndex: function() {
		return this._stateIdx;
	}
}

for (var p in StateStackProto) {
	StateStack.prototype[p] = StateStackProto[p];
}

StateStack.isEquals = function(state1, state2) {
	if (!state1 || !state2) return false;

	if (state1.name !== state2.name || 
			state1.fragment !== state2.fragment)
		return false;

	return true;
}

var NAMED_REGEXP = /\:([a-z0-9_-][a-z0-9_-]*)/gi,
	SPLAT_REGEXP = /\*([a-z0-9_-][a-z0-9_-]*)/gi,
	PERL_REGEXP = /P\<([a-z0-9_-][a-z0-9_-]*?)\>/gi,
	ARGS_SPLITER = '!',
	his = win.history,
	loc = win.location,
	Message = app.module.MessageScope
	;

function convertParams(routeText) {
	return routeText.replace(NAMED_REGEXP, '(P<$1>[^\\/]*?)')
				.replace(SPLAT_REGEXP, '(P<$1>.*?)');
}

function extractNames(routeText) {
	var matched = routeText.match(PERL_REGEXP),
		names = {}
		;


	matched && matched.forEach(function(name, i) {
		names[name.replace(PERL_REGEXP, '$1')] = i;
	});

	return names;
}

function extractArgs(str) {
	if (!str) return {};

	var split = str.substring(1).split('&'),
		args = {}
		;

	split.forEach(function(pair) {
		if (pair) {
			var s = pair.split('=')
				;

			args[s[0]] = s[1];
		}
	});

	return args;
}

function parseRoute(routeText) {
	routeText = routeText.replace(PERL_REGEXP, '');

	return new RegExp('^(' + routeText + ')(' + ARGS_SPLITER + '.*?)?$');
}


function getFragment() {
	return loc.hash.slice(1) || '';
}

function setFragment(fragment) {
	loc.hash = fragment;
}

function Navigation() {
	var that = this;

	that._started = false;
	that._routes = {};
	that._stack = new StateStack();

	Message.mixto(this, 'navigation');
}

var NavigationProto = {
	getStack: function() {
		return this._stack;
	},

	handleEvent: function() {
    	var that = this,
    		routes = that._routes,
    		route, fragment, 
    		unmatched = true
			;

		if (!that._started) return;

		fragment = getFragment();

		for (var name in routes) {
			route = routes[name];
			
			if(route.routeReg.test(fragment)) {
                unmatched = false;
				route.callback(fragment);
				if (route.last) break;
			}
		}

		unmatched && that.trigger('unmatched', fragment);
	},

	addRoute: function(name, routeText, options) {
		var that = this,
			routeNames, routeReg
			;

		if (arguments.length === 1) {
			options = arguments[0];
			name = null;
			routeText = null;
		}

		options || (options = {});

		function routeHandler(fragment, params, args) {
			var state = that._stack.pushState(name, fragment, params, args);
			options.callback && options.callback(state);
			that.trigger(state.move, state);
		}

		if (options['default']) {
			this.on('unmatched', routeHandler);
		} else if (name && routeText) {
			routeText = convertParams(routeText);
			routeNames = extractNames(routeText);
			routeReg = parseRoute(routeText);

			that._routes[name] = {
				routeText: routeText,
				routeReg: routeReg,
				callback: function(fragment) {
					var matched = fragment.match(routeReg).slice(2),
						args = extractArgs(matched.pop() || ''),
						params = {}
						;

					for (var name in routeNames) {
						params[name] = matched[routeNames[name]];
					}

					routeHandler(fragment, params, args);
				},
				last: !!options.last
			}
		}
	},

	removeRoute: function(name) {
		if (this._routes[name]) {
			delete this._routes[name];
		}
	},

	hasRoute: function(name) {
		return !!this._routes[name];
	},

	start: function() {
		if(this._started) return false;

	    this._started = true;
		win.addEventListener('hashchange', this, false);
		this.handleEvent();
		return true;
	},

	stop: function() {
    	if (!this._started) return false;
    	
    	this._routes = {};
    	this._stack.reset();
    	this._started = false;
    	win.removeEventListener('hashchange', this, false);
    	return true;
	},

	push: function(fragment, options) {
		var that = this,
			stack = that._stack,
			state = stack.getState(),
			args = []
			;

		options || (options = {});
		stack.move = 'forward';
		stack.transition = 'forward';

		if (fragment != null) {
			if (!state || state.fragment !== fragment || 
					options.data) {

				options.type || (options.type = 'GET');
				options.data || (options.data = {});

				if (options.type.toUpperCase() === 'GET') {
					for (var key in options.data) {
						args.push(key + '=' + options.data[key]);
					}
				}

				if (options.type.toUpperCase() === 'POST') {
					stack.datas = options.data;
				}

				if (options.transition === 'backward') {
					stack.transition = 'backward';
				}

				stack.type = options.type.toUpperCase();
				setFragment(fragment + (args.length ? ARGS_SPLITER + args.join('&') : ''));
			}
		} else {
			his.forward();
		}
	},

	pop: function(options) {
		var that = this,
			stack = that._stack,
			stateIdx = stack.getIndex()
			;

		if (stateIdx === 0) return;

		stack.move = 'backward';
		stack.transition = 'backward';

		if (options && options.transition === 'forward') {
			stack.transition = 'forward';
		}

		his.back();
	},

	resolve: function(name, params) {
		var route = this._routes[name], routeText, resolved = '';

		if (route) {
			routeText = route.routeText;
			resolved = routeText.replace(/\(P<[a-z0-9_-][a-z0-9_-]*?>.*?\)/g, function(m) {
				var name = PERL_REGEXP.exec(m)[1];
				return params[name] || 'undefined';
			}).replace('\\', '');
		}

		return resolved;
	}
}

for (var p in NavigationProto) {
	Navigation.prototype[p] = NavigationProto[p];
}

Navigation.instance = new Navigation();

app.module.StateStack = StateStack;
app.module.Navigation = Navigation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));












(function(win, app, undef) {

var doc = win.document,	$ = win['$'],

	am = app.module,
	StateStack = am.StateStack,
	Message = am.MessageScope,
	Navigation = am.Navigation,
	navigation = Navigation.instance,
	Template = am.Template,
	View = am.View,
	Page = am.Page,
	Navbar = am.Navbar,
	Toolbar = am.Toolbar,
	Content = am.Content,
	Scroll = am.Scroll,
	Animation = am.Animation,
	Transition = am.Transition,
	hooks = Message.get('hooks'),
	pagecache = {},
	pagemeta = {},
	templatecache = {}, 
	resourcecache = {},
	config = app.config = {
		viewport : null,
		templateEngine : null,
		enableMessageLog: false,
		resourceBase: './',
		enableContent: true,
		enableNavbar : false,
		enableToolbar : false,
		enableScroll : false,
		enableTransition : false
	};

// Config Initial
hooks.on('app:start', function() {
	var config = app.config;

	Navbar || (config.enableNavbar = false);
	Toolbar || (config.enableToolbar = false);
	Scroll || (config.enableScroll = false);
	Transition || (config.enableTransition = false);

	config.enableNavbar === true && (config.enableNavbar = {});
	config.enableToolbar === true && (config.enableToolbar = {});
	config.enableScroll === true && (config.enableScroll = {});
	config.enableTransition === true && (config.enableTransition = {});
	if (typeof config.enableContent === 'number') {
		config.enableContent = {cacheLength: config.enableContent};
	} else if (config.enableContent instanceof HTMLElement) {
		config.enableContent = {wrapEl: config.enableContent};
	} else if (typeof config.enableContent !== 'object') {
		config.enableContent = {};
	}
});

// Message Initial

//DOM Event Initial
var orientationEvent = 'onorientationchange' in win?'orientationchange':'resize';
window.addEventListener(orientationEvent, function(e){
	setTimeout(function() {
		hooks.trigger('orientaion:change');
	}, 10);
}, false);

// Navigation Initial
var lastState, lastPage, isFirstSwitch = true;

hooks.on('page:define page:defineMeta', function(page) {
	var name = page.name,
		route = page.route;

	if (navigation.hasRoute(name)) return;

	if (!route) {
		route = {name: name, 'default': true}
	} else if (typeof route === 'string') {
		route = {name: name, text: route}
	}

	navigation.addRoute(route.name, route.text, {
		'default': route['default'],
		callback: route.callback,
		last: route.last
	});
});

navigation.on('forward backward', function(state) {
	var meta, page = Page.get(state.name);

	function pageReady() {
		page = Page.get(state.name);

		hooks.trigger('navigation:switch', state, page, {
			isSamePage: lastPage && (lastPage.name === page.name),
			isSameState: lastState && StateStack.isEquals(lastState, state),
			isFirstSwitch: isFirstSwitch
		});
		lastState = state;
		lastPage = page;
		isFirstSwitch = false;
	}

	state.pageMeta || (state.pageMeta = {});
	if (!page) {
		if ((meta = pagemeta[state.name])) {
			var	jsLoaded = {};

			meta.css && app.loadResource(meta.css);
			meta.js && app.loadResource(meta.js, pageReady);
		}
	} else {
		pageReady();
	}
});

// UI Initial
function q(selector, el) {
	el || (el = doc);
	return el.querySelector(selector);
}

hooks.on('app:start', function() {
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent, i_content,
		c_transition = config.enableTransition,
		c_scroll = config.enableScroll
		;

	config.viewport || (config.viewport = q('.viewport') || doc.body);

	c_content.wrapEl || (c_content.wrapEl = q('.content', config.viewport) || config.viewport);
	c_content.cacheLength || (c_content.cacheLength = (c_content.wrapEl === config.viewport?1:5));
	i_content = c_content.instance = new Content(c_content.wrapEl, {
		cacheLength: c_content.cacheLength
	});

	if (c_navbar) {
		config.viewport.className += ' enableNavbar';
		c_navbar.wrapEl || (c_navbar.wrapEl = q('.navbar', config.viewport));
		c_navbar.titleWrapEl || (c_navbar.titleWrapEl = q('.navbar > ul > li:first-child', config.viewport));
		c_navbar.backWrapEl || (c_navbar.backWrapEl = q('.navbar > ul > li:nth-child(2)', config.viewport));
		c_navbar.funcWrapEl || (c_navbar.funcWrapEl = q('.navbar > ul > li:last-child', config.viewport));
		c_navbar.instance = new Navbar(c_navbar.wrapEl, c_navbar);
	}

	if (c_toolbar) {
		config.viewport.className += ' enableToolbar';
		c_toolbar.wrapEl || (c_toolbar.wrapEl = q('.toolbar', config.viewport));
		c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
	}

	if (c_scroll) {
		config.viewport.className += ' enableScroll';
		c_scroll.wrapEl = i_content.getActive();
	}

	if (c_transition) {
		config.viewport.className += ' enableTransition';
		c_transition.wrapEl = i_content.getActive().parentNode;
	}
});

hooks.on('navigation:switch', function(state, page, options){
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent,
		c_transition = config.enableTransition,
		c_scroll = config.enableScroll,
		move = state.move,
		transition = state.transition
		;

	if (c_navbar) {
		var i_navbar = c_navbar.instance
			title = state.pageMeta.title || page.title,
			buttons = state.pageMeta.buttons || page.buttons
			;

		app.navigation.setTitle(title);
		i_navbar.removeButton();

		if (buttons) {
			buttons.forEach(function(button) {
				var handler = button.handler;

				if (button.type === 'back') {
					if (button.autoHide !== false && state.index < 1) {
						button.hide = true;
					} else {
						button.hide = false;
					}
					if (!handler) {
						handler = button.handler = function() {
							app.navigation.pop();
						}
					}
				}

				if (typeof handler === 'string') {
					handler = page[handler];
				}
				button.handler = function(e) {
					handler.call(page, e, state.index);
				}

				app.navigation.setButton(button);
			});
		} else {
			app.navigation.setButton({
				type: 'back',
				text: 'back',
				hide: state.index < 1?true:false,
				handler: function() {
					app.navigation.pop();
				}
			});
		}

		if (!options.isSamePage && !options.isFirstSwitch){
			Transition.float(c_navbar.titleWrapEl.parentNode, transition === 'backward'?'LI':'RI', 50);
		}
	}

	if (c_toolbar) {
		var i_toolbar = c_toolbar.instance, 
			o_toolbar = state.pageMeta.toolbar || page.toolbar
			;

		if (typeof o_toolbar === 'number') {
			o_toolbar = {height: o_toolbar};
		}
		if (o_toolbar) {
			app.navigation.setToolbar(o_toolbar);
			i_toolbar.show();
		} else {
			i_toolbar.hide();
		}
	}

	if (!options.isSamePage) {
		var i_content = c_content.instance;
		
		move === 'backward' ? i_content.previous() : i_content.next();

		if (c_scroll) {
			Scroll.disable(c_scroll.wrapEl);
			c_scroll.wrapEl = i_content.getActive();
			Scroll.enable(c_scroll.wrapEl, page.scroll);
		}

		if (c_transition && !options.isFirstSwitch) {
			var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1),
				className = c_transition.wrapEl.className += ' ' + transition,
				activeEl = i_content.getActive()
				;

			Transition.move(c_transition.wrapEl, offsetX, 0, function() {
				c_transition.wrapEl.className = className.replace(' ' + transition, '');
				c_transition.wrapEl.style.left = (-Animation.getTransformOffset(c_transition.wrapEl).x) + 'px';
				i_content.setClassName();
			});
		} else {
			i_content.setClassName();
		}
	}
});

hooks.on('navigation:switch orientaion:change', function() {
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent
		;

	var offsetHeight = config.viewport.offsetHeight;
	if (c_navbar) {
		offsetHeight -= c_navbar.wrapEl.offsetHeight;
	}
	if (c_toolbar) {
		offsetHeight -= c_toolbar.wrapEl.offsetHeight;
	}
	c_content.wrapEl.style.height = offsetHeight + 'px';
});

//Plugin Initial
hooks.on('app:start', function() {
	for (var name in app.plugin) {
		var plugin = app.plugin[name];
		plugin.onAppStart && plugin.onAppStart();
	}
});

hooks.on('navigation:switch', function(state, page) {
	for (var name in app.plugin) {
		var plugin = app.plugin[name], pluginOpt;

		if (page.plugins) {
			pluginOpt = page.plugins[name];
		}

		if (plugin) {
			state.plugins || (state.plugins = {});
			state.plugins[name] || (state.plugins[name] = {});
			if (typeof pluginOpt === 'object') {
				for (var p in pluginOpt) {
					state.plugins[name][p] = pluginOpt[p];
				}
			}
			plugin.onNavigationSwitch && plugin.onNavigationSwitch(page, state.plugins[name]);
		}
	}
});

hooks.on('view:render', function(view) {
	if (view.plugins) {
		for (var name in view.plugins) {
			var plugin = app.plugin[name], pluginOpt = view.plugins[name]
				;

			pluginOpt === true && (pluginOpt = view.plugins[name] = {});
			if (plugin && pluginOpt) {
				plugin.onViewRender && plugin.onViewRender(view, pluginOpt);
			}
		}
	}
});

hooks.on('view:destory', function(view) {
	if (view.plugins) {
		for (var name in view.plugins) {
			var plugin = app.plugin[name], pluginOpt = view.plugins[name]
				;

			if (plugin && pluginOpt) {
				plugin.onViewTeardown && plugin.onViewTeardown(view, pluginOpt);
			}
		}
	}
});

hooks.on('page:define', function(page) {
	if (page.plugins) {
		for (var name in page.plugins) {
			var plugin = app.plugin[name], pluginOpt = page.plugins[name]
				;

			if (plugin && pluginOpt) {
				plugin.onPageDefine && plugin.onPageDefine(page, pluginOpt);
			}
		}
	}
});

hooks.on('page:startup', function(state, page) {
	if (page.plugins) {
		for (var name in page.plugins) {
			var plugin = app.plugin[name], pluginOpt = state.plugins[name]
				;

			if (plugin && pluginOpt) {
				plugin.onPageStartup && plugin.onPageStartup(page, pluginOpt);
			}
		}
	}
});

hooks.on('page:teardown', function(state, page) {
	if (page.plugins) {
		for (var name in page.plugins) {
			var plugin = app.plugin[name], pluginOpt = state.plugins[name]
				;

			if (plugin && page.plugins[name]) {
				plugin.onPageTeardown && plugin.onPageTeardown(page, pluginOpt);
			}
		}
	}
});

//Template Initial
function checkTemplate(obj, name, callback) {
	var tpl = obj[name];

	if (typeof tpl === 'string') {
		hooks.on('template:loaded', function(_tpl) {
			if (tpl === _tpl) {
				hooks.off('template:loaded', arguments.callee);
				callback && callback();
			}
		});
	} else if (typeof tpl === 'object') {
		for (var name in tpl) {
			checkTemplate(tpl, name, function() {
				var complete = true;
				for (var name in tpl) {
					if (typeof tpl[name] !== 'function') {
						complete = false;
						break;
					}
				}
				if (complete) {
					callback && callback();
				}
			});
		}
	} else {
		callback && callback();
	}
}

function compileTemplate(template, text) {
	template.compile(text);
	return function(datas) {
		return template.render(datas);
	}
}

function preloadTemplate(obj, name) {
	var tpl = obj[name];

	if (typeof tpl === 'string') {
		var template;

		if (templatecache[tpl]) {
			obj[name] = templatecache[tpl];
		} else if (tpl.match(/\.tpl$/g)) {
			template = new Template();
			template.load(tpl, function(text) {
				obj[name] = templatecache[tpl] = compileTemplate(template, text);
				hooks.trigger('template:loaded', tpl);
			});
		} else {
			template = new Template();
			obj[name] = templatecache[tpl] = compileTemplate(template, tpl);
		}
	} else if (typeof tpl === 'object') {
		for (var name in tpl) {
			preloadTemplate(tpl, name);
		}
	}
}

hooks.on('view:extend', function(view) {
	if (view.prototype.template) {
		preloadTemplate(view.prototype, 'template');
	}
});

hooks.on('page:define', function(page) {
	if (page.template) {
		preloadTemplate(page, 'template');
	}
});

//View Intial
hooks.on('view:extend', function(view) {
	var render = view.prototype.render,
		destory = view.prototype.destory,
		templateLoaded = {}
		;

	view.prototype.render = function() {
		var that = this, args = arguments;
		hooks.trigger('view:render', that, arguments);
		if (!templateLoaded[that.name]) {
			checkTemplate(that, 'template', function() {
				templateLoaded[that.name] = true;
				render.apply(that, args);
			});
		} else {
			render.apply(that, args);
		}
	}

	view.prototype.destory = function() {
		hooks.trigger('view:destory', this, arguments);
		destory.apply(this, arguments);
	}
});

//Page Initial
hooks.on('page:define', function(page) {
	var startup = page.startup,
		teardown = page.teardown;

	page.startup = function(state) {
		hooks.trigger('page:startup', state, page);
		startup.call(page);
	}

	page.teardown = function(state) {
		hooks.trigger('page:teardown', state, page);
		teardown.call(page);
	}

	page.html = function(html) {
		config.enableContent.instance.html(html);
	}

	Object.defineProperty(page, 'el', {
		get: function() {
			return config.enableContent.instance.getActive();
		}
	});

	if ($) {
		Object.defineProperty(page, '$el', {
			get: function() {
				return $(config.enableContent.instance.getActive());
			}
		});
	}
});

hooks.on('navigation:switch', function(state, page, options) {
	var c_content = app.config.enableContent,
		lastDataFragment = page.el.getAttribute('data-fragment'),
		curDataFragment = state.fragment, 
		lastCache, templateLoaded = {}
		;

	if (lastDataFragment === curDataFragment && state.move === 'backward') return;

	if ((lastCache = pagecache[lastDataFragment])) {
		lastCache.page.teardown(lastCache.state);
		delete pagecache[lastDataFragment];
	}

	pagecache[curDataFragment] = {state:state, page:page};
	page.el.setAttribute('data-fragment', curDataFragment);

	if (!templateLoaded[page.name]) {
		checkTemplate(page, 'template', function() {
			templateLoaded[page.name] = true;
			page.startup(state);
		});
	} else {
		page.startup(state);
	}
});

// Func Initial
hooks.on('app:start', function() {
	var c_scroll = config.enableScroll;

	if (c_scroll) {
		Object.defineProperty(app, 'scroll', {
			get: function() {
				return c_scroll.wrapEl;
			}
		})
	}
});

app.start = function(config) {
	for (var p in config) {
		app.config[p] = config[p];
	}
	hooks.trigger('app:start');
	navigation.start();
}

app.setTemplate = function(id, tpl) {
	if (typeof tpl === 'string') {
		templatecache[id] = compileTemplate(new Template(), tpl);
	} else if (typeof tpl === 'function') {
		templatecache[id] = tpl;
	}
}

app.extendView = function(properties) {
	var ChildView = View.extend(properties);
	hooks.trigger('view:extend', ChildView);
	return ChildView;
}

app.getView = function(name) {
	return new (View.get(name));
}

app.definePage = function(properties) {
	var page = Page.define(properties);
	hooks.trigger('page:define', page);
	return page;
}

app.definePageMeta = function(meta)  {
	pagemeta[meta.name] = meta;
	hooks.trigger('page:defineMeta', meta);
}

app.getPage = function(name) {
	return Page.get(name);
}

var aEl = document.createElement('a');
app.loadResource = function(urls, callback) {
	if (typeof urls === 'string') {
		urls = [urls];
	} else {
		urls = urls.slice(0);
	}

	function load(url, callback) {
		aEl.href = app.config.resourceBase + url;
		url = aEl.href;

		if (resourcecache[url]) {
			callback();
		} else {
			var id = resourcecache[url] = 'resource-' + Date.now() + '-' + Object.keys(resourcecache).length;

			if (url.match(/\.js$/)) {
				var script = document.createElement('script'), loaded = false;
				script.id = id;
				script.async = true;
				script.onload = script.onreadystatechange  = function() {
					if (!loaded) {
						loaded = true;
						callback && callback(url);
					}
				}
				script.src = url;
				doc.body.appendChild(script);
			} else if (url.match(/\.css$/)) {
				var link = document.createElement('link');
				link.id = id;
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = url;
				doc.body.appendChild(link);
				callback();
			}
		}
	}

	load(urls.shift(), function() {
		if (urls.length) {
			load(urls.shift(), arguments.callee);
		} else {
			callback && callback();
		}
	});
}

function getState() {
	return navigation.getStack().getState();
}

app.navigation = {
	push: function(fragment, options) {
		navigation.push(fragment, options);
	},

	pop: function() {
		navigation.pop();
	},

	resolveFragment: function(name, params) {
		navigation.resolve(name, params);
	},

	getReferer: function() {
		var state = getState();
		return state.referer;
	},

	getParameter: function(name) {
		var state = getState();
		return state.params[name] || state.datas[name];
	},

	getParameters: function() {
		var state = getState(),
			params = {};

		for (var n in state.params) {
			params[n] = state.params[n];
		}

		for (var n in state.datas) {
			params[n] = state.datas[n];
		}

		return params;
	},

	setData: function(name, value) {
		var state = getState();
		state.datas[name] = value;
	},

	setTitle: function(title) {
		var state = getState();
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setTitle(title);
		}
		state.pageMeta.title = title;
	},

	setButton: function(options) {
		var state = getState();
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setButton(options);
		}
		if (!state.pageMeta.buttons) {
			state.pageMeta.buttons = [options];
		} else {
			for (var i = 0; i < state.pageMeta.buttons.length; i++) {
				var button = state.pageMeta.buttons[i];
				if (button.type === 'back' && options.type === 'back' ||
						button.id === options.id) {
					for (var p in options) {
						button[p] = options[p];
					}
					return;
				}
			}
			state.pageMeta.buttons.push(options);
		}
	},

	setToolbar: function(options) {
		var state = getState();
		if (app.config.enableToolbar) {
			app.config.enableToolbar.instance.set(options);
		}
		state.pageMeta.toolbar = options;
	}
}

})(window, window['app']||(window['app']={module:{},plugin:{}}));