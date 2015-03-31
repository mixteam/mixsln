;(function(win, app, undef) {

var MATRIX3D_REG = /^matrix3d\((?:[-\d.]+,\s*){12}([-\d.]+),\s*([-\d.]+)(?:,\s*[-\d.]+){2}\)/,
	MATRIX_REG = /^matrix\((?:[-\d.]+,\s*){4}([-\d.]+),\s*([-\d.]+)\)$/,
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

function str2ms(s) {
	var unit = (/ms|s|m|h$/).exec(s)[0],
		convert = {ms:1, s:1000, m:60000, h:3600000};

	return parseFloat(s) * convert[unit];
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

    	var isTransitionEnd = false;
    	function webkitTransitionEnd(e){
    		if (isTransitionEnd) return;
	    	element.removeEventListener('webkitTransitionEnd', webkitTransitionEnd, false);
	        if(e && e.srcElement !== element) return;
	        isTransitionEnd = true;
	        setTimeout(options.callback, 10);
	    }
    	options.callback && element.addEventListener('webkitTransitionEnd', webkitTransitionEnd, false);
	    setTimeout(webkitTransitionEnd, str2ms(options.duration) * 1.2);
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

function Event() {
	this._handlers = {};
}

var EventProto = {
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

for (var p in EventProto) {
	Event.prototype[p] = EventProto[p];
} 

var SCOPES = {},
	SPLITER_REG = /\s+/
	;


function log(scope, event, args) {
	if (MessageScope.isLogging) {
    	console.log('[Message]', {scope:scope, event: event, args:args});
	}
}

function MessageScope(scope) {
	var that = this;

	this._scope = scope;
	this._event = new Event();
	this._cache = {};

	this._handler = function(e) {
		var type = e.type, args = e.args,
			list = that._cache[type].slice()
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
			event = that._event,
			list, eventName
			;

		if (!callback) return that;

		events = events.split(SPLITER_REG);	

        while (eventName = events.shift()) {
            list = cache[eventName] || (cache[eventName] = []);
            if (!list.length) {
            	event.addEventListener(eventName, this._handler);	
            }
            list.push(callback, context);
        }

        return that; 
	},

	off: function(events, callback, context) {
		var that = this,
			cache = that._cache,
			event = that._event,
			list, eventName
			;

        if (!events) {
        	events = Object.keys(cache);
        } else {
        	events = events.split(SPLITER_REG);
        }

        while (eventName = events.shift()) {
        	!(callback || context) && (cache[eventName] = []);

        	list = cache[eventName];

            for (var i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback ||
                        context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }

            if (!list.length) {
            	delete cache[eventName];
            	event.removeEventListener(eventName, this._handler);
        	}
        }

        return that;
	},

	once: function(events, callback, context) {
        var that = this;

        function onceHandler() {
            callback.apply(this, arguments);
            that.off(events, onceHandler, context);
        }

        return that.on(events, onceHandler, context);
	},

	after: function(events, callback, context) {
		var that = this,
			states = {}, eventName
			;

		if (!callback) return that;

		events = events.split(SPLITER_REG);
		eventName = events.join('&&');

		function checkState() {
			for (var e in states) {
				if (!states[e]) return false;
			}
			return true;
		}

		function resetState() {
			for (var e in states) {
				states[e] = false;
			}
		}

		events.forEach(function(event) {
			states[event] = false;
			that.on(event, function() {
				states[event] = true;
				if (checkState()) {
					that.trigger(eventName);
					resetState();
				}
			});
		});

		that.on(eventName, callback, context);
	},

	trigger: function(events) {
		var that = this,
			cache = that._cache,
			event = that._event,
			args, eventName
			;

		events = events.split(SPLITER_REG);
		args = Array.prototype.slice.call(arguments, 1);

		while (eventName = events.shift()) {
			log(this._scope, eventName, args);

			if (cache[eventName]) {
				event.dispatchEvent({
					type: eventName, 
					args: args
				});
			}
		}

		return that;
	}
}

for (var p in MessageScopeProto) {
	MessageScope.prototype[p] = MessageScopeProto[p];
}

MessageScope.isLogging = false;

MessageScope.mixto = function(obj, scope) {
	var context = MessageScope.get(scope);

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
	if (typeof scope === 'string') {
		return SCOPES[scope] || (SCOPES[scope] = new MessageScope(scope));
	} else if (scope instanceof MessageScope){
		return scope;
	} else {
		throw new TypeError();
	}
}

app.module.Event = Event;
app.module.MessageScope = MessageScope;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

var doc = win.document
	;

function Template() {
}

var TemplateProto = {
	load: function(url, callback) {
		var engine = Template.engine
			;

		if (engine.load && typeof url === 'string') {
			engine.load(url, callback);
		} else {
			callback && callback(url);
		}
	},

	compile: function(text) {
		var engine = Template.engine;

		this.originTemplate = text;

		if (engine.compile && typeof text === 'string') {
			this.compiledTemplate = engine.compile(text);
		} else {
			this.compiledTemplate = function() {return text};
		}

		return this.compiledTemplate;
	},

	render: function(datas) {
		var engine = Template.engine,
			compiledTemplate = this.compiledTemplate
			;

		if (engine.render && compiledTemplate && typeof datas === 'object') {
			this.content = engine.render(compiledTemplate, datas);
		} else {
			this.content = compiledTemplate?compiledTemplate(datas):Object.prototype.toString.call(datas);
		}

		return this.content;
	}
}

for (var p in TemplateProto) {
	Template.prototype[p] = TemplateProto[p];
} 

Template.engine = {}

app.module.Template = Template;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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
	var $ = win['$'];

	if (typeof this.el === 'string') {
		var selectors = this.el.split(/\s*\>\s*/),
			wrap = this.el = document.createElement('div')
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

		this.el = this.el.removeChild(this.el.childNodes[0]);
	}


	if ($) {
		this.$el = $(this.el);
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
	var ParentView = views[properties.parent] || View;

	function ChildView() {
		ParentView.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
	}
	inherit(ChildView, ParentView);
	extend(ChildView.prototype, ParentView.fn);
	extend(ChildView.prototype, properties);
	
	return (views[properties.name] = ChildView);
}

View.get = function(name) {
	return views[name];
}

app.module.View = View;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {


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
	ready : function() {/*implement*/},
	startup : function() {/*implement*/},
	teardown : function() {/*implement*/},
	show : function() {/*implement*/},
	hide : function() {/*implement*/}
}

for (var p in PageProto) {
	Page.prototype[p] = PageProto[p];
} 

Page.fn = {};

Page.define = function(properties) {
	function ChildPage() {
		Page.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

var doc = win.document
	;

function _setButton(btn, options) {
	(options.id != null) && btn.setAttribute('data-id', options.id);
	(options['class'] != null) && (btn.className = options['class']);
	(options.text != null) && (btn.innerHTML = options.text);
	(options.bg != null) && (btn.style.background = options.bg);
	(options.icon != null) && (btn.innerHTML = '<img src="' + options.icon + '" border="0" width="100%" height="100%" />');
	(options.hide === true) ? (btn.style.display = 'none'):(btn.style.display = '');
	options.onChange && options.onChange.call(btn, options);
	if (options.handler) {
		btn.handler && btn.removeEventListener('click', btn.handler, false);
		btn.addEventListener('click', (btn.handler = options.handler), false);
	}
}

function Navbar(wrapEl) {
	this.wrapEl = wrapEl;
	this.wrapEl.appendChild(this.animWrapEl = doc.createElement('ul'));
	this.animWrapEl.appendChild(this.titleWrapEl = doc.createElement('li'));
	this.animWrapEl.appendChild(this.backWrapEl = doc.createElement('li'));	
	this.animWrapEl.appendChild(this.funcWrapEl = doc.createElement('li'));
}

var NavbarProto = {
    setTitle: function(title) {
    	if (typeof title === 'string') {
    		this.titleWrapEl.innerHTML = title;
    	} else if (title instanceof HTMLElement) {
    		this.titleWrapEl.innerHTML = '';
    		this.titleWrapEl.appendChild(title);
    	}
    },

    setButton: function(options) {
    	var wrap, btn;
    	if (options.type === 'back') {
    		wrap = this.backWrapEl;
    		btn = wrap.querySelector('a');
    	} else if (options.type === 'func') {
    		wrap = this.funcWrapEl;
    		btn = wrap.querySelector('a[data-id="' + options.id + '"]');
    	} else if (options.id) {
    		btn = this.wrapEl.querySelector('a[data-id="' + options.id + '"]');
    		btn && (wrap = btn.parentNode);
    	}

		if (!btn && wrap) {
			btn = doc.createElement('a');
			btn.className = options.type;
			wrap.appendChild(btn);
		}
		_setButton(btn, options);
    },

    getButton: function(id) {
    	return this.wrapEl.querySelector('a[data-id="' + id + '"]');
    },

    removeButton: function(id) {
    	function remove(btn) {
			if (btn) {
				btn.handler && btn.removeEventListener('click', btn.handler);
				btn.parentNode.removeChild(btn);
			}
    	}

    	if (!id) {
    		var btns = this.funcWrapEl.querySelectorAll('a');
    		for (var i = 0; i < btns.length; i++) {
    			remove(btns[i]);
    		}
    	} else {
	    	if (typeof id === 'string') {
	    		var btn = this.getButton(id);
	    	} else if (id instanceof HTMLElement) {
	    		var btn = id;
	    	}
	    	remove(btn);
		}
    }
}

for (var p in NavbarProto) {
	Navbar.prototype[p] = NavbarProto[p];
}

app.module.Navbar = Navbar;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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
        options.html && (this._wrapEl.innerHTML = options.html);
        options.el && ((this._wrapEl.innerHTML = '') || this._wrapEl.appendChild(options.el));
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {


function Content(wrapEl, options) {
	options || (options = {});
	this._wrapEl = wrapEl;
	this._cacheLength = Math.max(options.cacheLength, 1);
	this._cacheIndex = 0;

	var html = '';
	for (var i = 0; i < this._cacheLength; i++) {
		html += '<div class="inactive" index="' + i + '"></div>';
	}
	this._wrapEl.innerHTML = '<div class="wrap">' + html + '</div><div class="trans"><div></div></div>';
	this.contentEl = this._wrapEl.childNodes[0];
	this.transEl = this._wrapEl.childNodes[1];
	this.transShadeEl = this.transEl.childNodes[0];

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
		return this.contentEl.childNodes[index];
	},

	getNext: function() {
		var index = (this._cacheIndex + 1) % this._cacheLength;
		return this.contentEl.childNodes[index];
	},

	getPrevious: function() {
		var index = (this._cacheIndex - 1 + this._cacheLength) % this._cacheLength;
		return this.contentEl.childNodes[index];
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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
    event.initEvent(type, true, true);

    if(typeof extra === 'object') {
        for(var p in extra) {
            event[p] = extra[p];
        }
    }

    element.dispatchEvent(event);
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
            var duration = Date.now() - gesture.startTime,
                velocityX = (touch.clientX - gesture.startTouch.clientX) / duration,
                velocityY = (touch.clientY - gesture.startTouch.clientY) / duration,
                displacementX = touch.clientX - gesture.startTouch.clientX,
                displacementY = touch.clientY - gesture.startTouch.clientY
                ;

            fireEvent(gesture.element, 'panend', {
                isflick: duration < 300,
                touch: touch,
                touchEvent: event
            });
            
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
        var touch = event.changedTouches[i],
            id = touch.identifier,
            gesture = gestures[id];

        if (!gesture) continue;

        if (gesture.pressingHandler) {
            clearTimeout(gesture.pressingHandler);
            gesture.pressingHandler = null;
        }

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
        delete gestures[id];
    }

    if (Object.keys(gestures).length === 0) {
        docEl.removeEventListener('touchmove', touchmoveHandler, false);
        docEl.removeEventListener('touchend', touchendHandler, false);
        docEl.removeEventListener('touchcancel', touchcancelHandler, false);
    }
}

docEl.addEventListener('touchstart', touchstartHandler, false);

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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
			element.style.webkitBackfaceVisibility = '';
			element.style.webkitTransformStyle = '';
			element.style.webkitTransition = '';
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
				element.style.webkitBackfaceVisibility = '';
				element.style.webkitTransformStyle = '';
				element.style.webkitTransition = '';
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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
		} else if (move === 'replace') {
			cur.referer = location.href.replace(/#[^#]*/, '#' + states[stateIdx].fragment);
			states[stateIdx] = cur;
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
	ARGS_SPLITER = '?',
	his = win.history,
	loc = win.location
	//Message = app.module.MessageScope
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

	var split = str.split('&'),
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

	return new RegExp('^(' + routeText + ')$');
}


function getFragment() {
	return loc.hash.slice(1) || '';
}

function setFragment(fragment, isReplace) {
	if (isReplace) {
		loc.replace('#' + fragment);
	} else {
		loc.hash = fragment;
	}
}

function Navigation() {
	var that = this;

	that._started = false;
	that._routes = {};
	that._stack = new StateStack();

	//Message.mixto(this, 'navigation');
}

var NavigationProto = {
	getStack: function() {
		return this._stack;
	},

	handleEvent: function() {
    	var that = this,
    		routes = that._routes,
    		route, fragment, defaultRoute,
    		unmatched = true
			;

		if (!that._started) return;

		fragment = getFragment();

		for (var name in routes) {
			route = routes[name];

			if (route['default']) {
				defaultRoute = route;
			} else if(route.routeReg.test(fragment.split(ARGS_SPLITER)[0])) {
                unmatched = false;
				route.callback(fragment);
				if (route.last) break;
			}
		}

		if (unmatched) {
			if (defaultRoute) {
				defaultRoute.callback(fragment);
			} else {
				this._stack.pushState('unmatched', fragment, {}, {});
			}
		}
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
			state.isDefault = !!options['default'];
			options.callback && options.callback(state);
			//that.trigger(state.move, state);
		}

		if (options['default']) {
			that._routes[name] = {
				'default': true,
				callback: function(fragment) {
					var args = extractArgs(fragment.split(ARGS_SPLITER)[1] || '');
					routeHandler(fragment, {}, args);
				}
			}
		} else if (name && routeText) {
			routeText = convertParams(routeText);
			routeNames = extractNames(routeText);
			routeReg = parseRoute(routeText);

			that._routes[name] = {
				routeText: routeText,
				routeReg: routeReg,
				callback: function(fragment) {
					var split = fragment.split(ARGS_SPLITER),
						matched = split[0].match(routeReg).slice(2),
						args = extractArgs(split[1] || ''),
						params = {}
						;

					for (var name in routeNames) {
						params[name] = matched[routeNames[name]];
					}

					routeHandler(fragment, params, args);
				},
				last: options.last
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
            stateIdx = stack.getIndex()
			args = []
			;

        fragment || (fragment = '');
		options || (options = {});
		stack.move = !!options.replace?'replace':'forward';
		stack.transition = 'forward';

		if ((/^(https?\:)?\/\//i).test(fragment)) {
            location.href = fragment;
        } else if (fragment) {
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
				setFragment(fragment + (args.length ? ARGS_SPLITER + args.join('&') : ''), !!options.replace);
			}
		} else if (stateIdx < stack._states.length - 1){
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
				PERL_REGEXP.lastIndex = 0;
				var name = PERL_REGEXP.exec(m)[1];
				return params[name] || 'undefined';
			}).replace('\\/?', '').replace('\\', '');
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

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

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

	that.push = function(value) {
		data.push(value);
		that.addProperty(data.length - 1, value);
	}

	that.pop = function() {
		var value = data.pop();
		that[data.length] = null;
		return value;
	}

	Object.defineProperty(that, 'length', {
		get: function() {
			return data.length;
		}
	});

	Model.call(that, data);
}

app.module.Model = Model;
app.module.Collection = Collection;


})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

var doc = win.document,
	docEl = doc.documentElement,
	anim = app.module.Animation,
	element, panFixRatio = 2,
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

function getBoundaryOffset(el, y) {
	if(y > el.minScrollTop) {
        return y - el.minScrollTop;
    } else if (y < el.maxScrollTop){
        return el.maxScrollTop - y;
    }
}

function touchBoundary(el, y) {
	if (y > el.minScrollTop) {
		y = el.minScrollTop;
	} else if (y < el.maxScrollTop) {
		y = el.maxScrollTop;
	}
	return y;
}

function fireEvent(el, eventName, extra) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, true, true);
	for (var p in extra) {
		event[p] = extra[p];
	}
    el.dispatchEvent(event);
}

function touchstartHandler(e) {
	if (stopBounce) return;

	var parentElement = e.srcElement;
	while (!parentElement.boundScrollEvent) {
		parentElement = parentElement.parentNode || parentElement.offsetParent;
	}
	element = parentElement.boundScrollElement;

	if (!element) return;
	var offset = anim.getTransformOffset(element);

	element.style.webkitBackfaceVisibility = 'hidden';
	element.style.webkitTransformStyle = 'preserve-3d';
	element.style.webkitTransition = '';
	element.style.webkitTransform = anim.makeTranslateString(offset.x, offset.y);
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

	element.transformOffset = anim.getTransformOffset(element);
	element.minScrollTop = getMinScrollTop(element);
	element.maxScrollTop = getMaxScrollTop(element);
	panFixRatio = 2.5;
	stopBounce = false;
	cancelScrollEnd = false;
	fireEvent(element, 'scrollstart');
}

function panHandler(e) {
	if (stopBounce || !element) return;

    var y = element.transformOffset.y + e.displacementY
        ;

    if(y > element.minScrollTop) {
    	y = element.minScrollTop + (y - element.minScrollTop) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    } else if(y < element.maxScrollTop) {
    	y = element.maxScrollTop - (element.maxScrollTop - y) / panFixRatio;
    	panFixRatio *= 1.003;
    	if (panFixRatio > 4) panFixRatio = 4;
    }

    if ((getBoundaryOffset(element, y))) {
    	if (y > element.minScrollTop) {
    		var name = 'pulldown',
    			offset = Math.abs(y - element.minScrollTop);

    	} else if (y < element.maxScrollTop) {
    		var name = 'pullup',
    			offset = Math.abs(element.maxScrollTop - y);
    	}
    	element.bounceOffset = offset;
    	fireEvent(element, name);
    }

    element.style.webkitTransition = '';
    element.style.webkitTransform = anim.makeTranslateString(element.transformOffset.x, y);
}

function panendHandler(e) {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y
	if (getBoundaryOffset(element, y)) {
		bounceEnd();
	} else {
		scrollEnd();
	}
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
    	element.transformOffset.x, s.toFixed(0),
		bounceEnd
    );
}

function bounceEnd() {
	if (stopBounce || !element) return;

	var y = anim.getTransformOffset(element).y;
	y = touchBoundary(element, y);

    anim.translate(element, 
    	'0.4s', 'ease-in-out', '0s', 
    	element.transformOffset.x, y,
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

    if(s0 > element.minScrollTop || s0 < element.maxScrollTop) {
    	bounceStart(v);
    } else {
    	v = e.velocityY;
        if (v > 1.5) v = 1.5;
        if (v < -1.5) v = -1.5;
        a = 0.0015 * ( v / Math.abs(v));
		t = v / a;
        s = s0 + t * v / 2;

        if (s > element.minScrollTop) {
    	    _s = element.minScrollTop - s0;
            _t = (v - Math.sqrt(-2 * a *_s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	element.transformOffset.x, element.minScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
            
        } else if (s < element.maxScrollTop) {
            _s = element.maxScrollTop - s0;
            _t = (v + Math.sqrt(-2 * a * _s + v * v)) / a;
            _v = v - a * _t;

	        anim.translate(element, 
	        	_t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, -t + _t) + ')', '0s', 
	        	element.transformOffset.x, element.maxScrollTop,
	        	function() {
	        		bounceStart(_v)
	        	}
	        );
        } else {
	        anim.translate(element, 
	        	t.toFixed(0) + 'ms', 'cubic-bezier(' + anim.genCubicBezier(-t, 0) + ')', '0s', 
	        	element.transformOffset.x, s.toFixed(0),
	        	scrollEnd
	        );
        }
	}
}

function scrollEnd() {
	if (stopBounce || !element) return;
	
	cancelScrollEnd = false;

	setTimeout(function() {
		if (!cancelScrollEnd && element) {
			element.style.webkitBackfaceVisibility = 'initial';
			element.style.webkitTransformStyle = 'flat';
			element.style.webkitTransition = '';
			fireEvent(element, 'scrollend');
		}
	}, 10);
}

var Scroll = {
	enable: function(el, options) {
		var parentElement = el.parentNode || el.offsetParent
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
	    parentElement.boundScrollElement = el;

		if (options) {
			el.bounceTop = options.bounceTop;
			el.bounceBottom = options.bounceBottom;
		} else {
			el.bounceTop = 0;
			el.bounceBottom = 0;
		}

		var x = anim.getTransformOffset(el).x,
			y = - el.bounceTop;

		el.style.webkitTransition = '';
		el.style.webkitTransform = anim.makeTranslateString(x, y);
	},

	disable: function(el) {
		var parentElement = el.parentNode || el.offsetParent, offset;

		if (parentElement.boundScrollElement === el) {
			offset = anim.getTransformOffset(el);
			element = parentElement.boundScrollElement = null;
			setTimeout(function() {
				el.style.webkitTransition = '';
				el.style.webkitTransform = anim.makeTranslateString(offset.x, offset.y);
			}, 50);
		}
	},

	getScrollHeight: function(el) {
		return el.getBoundingClientRect().height - (el.bounceTop||0) - (el.bounceBottom||0);
	},

    getScrollTop: function(el) {
    	var offset = anim.getTransformOffset(el);
		return -(offset.y + (el.bounceTop||0));
	},

    refresh: function(el) {
        el.style.height = 'auto';
        el.style.height = el.offsetHeight + 'px';
        el.offset = anim.getTransformOffset(el);
        el.minScrollTop = getMinScrollTop(el);
        el.maxScrollTop = getMaxScrollTop(el);
        this.scrollTo(el, -el.offset.y - el.bounceTop);
    },

    offset: function(el, child) {
    	var elRect = el.getBoundingClientRect(),
    		childRect = child.getBoundingClientRect(),
    		offsetRect = {
	        	top: childRect.top - ((el.bounceTop || 0) + elRect.top),
	        	left: childRect.left - elRect.left,
	        	right: elRect.right - childRect.right,
	        	width: childRect.width,
	        	height: childRect.height
	        };

	    offsetRect.bottom = offsetRect.top + childRect.height;
	    return offsetRect;
    },

    scrollTo: function(el, y) {
    	var x = anim.getTransformOffset(el).x,
    		y = -y - (el.bounceTop || 0);

    	y = touchBoundary(el, y);
		el.style.webkitTransition = '';
        el.style.webkitTransform = anim.makeTranslateString(x, y);
    },

    scrollToElement: function(el, child) {
    	var offset = this.offset(el, child);
    	this.scrollTo(el, offset.top);
    },

    getViewHeight: function(el) {
    	return el.parentNode.getBoundingClientRect().height;
    },

    getBoundaryOffset: function(el) {
	    var y = anim.getTransformOffset(el).y;
	    return getBoundaryOffset(el, y);
    },

    stopBounce: function(el) {
    	stopBounce = true;

    	var offset = anim.getTransformOffset(el),
    		minScrollTop = getMinScrollTop(el),
    		maxScrollTop = getMaxScrollTop(el),
    		y = null
    		;

    	if (offset.y > minScrollTop + (el.bounceTop||0)) {
    		y = minScrollTop + (el.bounceTop||0);
    	} else if (offset.y < maxScrollTop - (el.bounceBottom||0)) {
    		y = maxScrollTop - (el.bounceBottom||0);
    	}

    	if (y != null) {
    		anim.translate(el,
    			'0.4s', 'ease-in-out', '0s',
    			offset.x, y);
    	}
    },

    resumeBounce: function(el) {
    	stopBounce = false;

    	var offset = anim.getTransformOffset(el),
    		minScrollTop = getMinScrollTop(el),
    		maxScrollTop = getMaxScrollTop(el),
    		y
    		;

    	if (offset.y > minScrollTop) {
    		y = minScrollTop;
    	} else if (offset < maxScrollTop){
    		y = maxScrollTop;
    	}

    	if (y != null) {
    		anim.translate(el,
    			'0.4s', 'ease-in-out', '0s',
    			offset.x, y);
    	}
    }
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}))
;(function(win, app, undef) {

var doc = win.document,	$ = win['$'],
 	appVersion = navigator.appVersion,
	isIOS = (/iphone|ipad/gi).test(appVersion),

	am = app.module,
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
	pagecache = {},
	pagemeta = {},
	templatecache = {}, 
	resourcecache = {},
	config = app.config = {
		viewport : null,
		templateEngine : null,
		resourceCombo: null,
		resourceBase: './',
		enableMessageLog: false,
		enableContent: true,
		enableNavbar : false,
		enableToolbar : false,
		enableScroll : false,
		enableTransition : false,
		pushState: false,
		basePath: '/'
	};


// Message Initial
var hooks = Message.get('hooks');

// Config Initial
hooks.on('app:start', function() {
	var config = app.config;

	Navbar || (config.enableNavbar = false);
	Toolbar || (config.enableToolbar = false);
	Scroll || (config.enableScroll = false);
	Transition || (config.enableTransition = false);

	Message.isLogging = config.enableMessageLog;

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

//DOM Event Initial
if ('onorientationchange' in win) {
	window.addEventListener('onorientationchange', function(e){
		setTimeout(function() {
			hooks.trigger('orientaion:change');
		}, 10);
	}, false);
}
window.addEventListener('resize', function(e){
	setTimeout(function() {
		hooks.trigger('screen:resize');
	}, 10);
});


//View Intial
hooks.on('view:extend', function(view) {
	var render = view.prototype.render,
		destory = view.prototype.destory
		;

	view.prototype.render = function() {
		var that = this, args = arguments;
		checkTemplate(that, 'template', function() {
			hooks.trigger('view:render', that, arguments);
			render.apply(that, args);
		});
	}

	view.prototype.destory = function() {
		hooks.trigger('view:destory', this, arguments);
		destory.apply(this, arguments);
	}
});

//Page Initial
hooks.on('page:define', function(page) {
	var ready = page.ready,
		startup = page.startup,
		teardown = page.teardown,
		show = page.show,
		hide = page.hide,
		isReady = false, persisted = false;

	page.ready = function(state) {
		if (isReady) return;
		hooks.trigger('page:ready', state, page);
		ready.call(page);
		isReady = true;
	}

	page.startup = function(state) {
		hooks.trigger('page:startup', state, page);
		startup.call(page);
	}

	page.show = function(state) {
		hooks.trigger('page:show', state, page);
		show.call(page, persisted);
		persisted = true;
	}

	page.hide = function(state) {
		hooks.trigger('page:hide', state, page);
		hide.call(page, persisted);
	}

	page.teardown = function(state) {
		hooks.trigger('page:teardown', state, page);
		teardown.call(page);
		persisted = false;
	}

	page.html = function(html) {
		this.el.innerHTML = html;
		//config.enableContent.instance.html(html);
	}
});


// Navigation Initial
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
		callback: function(state) {
			Message.get('navigation').trigger(state.move, state);
		},
		last: true
	});
});

// UI Initial
function q(selector, el) {
	el || (el = doc);
	return el.querySelector(selector);
}

function fireEvent(el, eventName) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, true, true);
    el.dispatchEvent(event);
} 

function handlerScrollEvent() {
	if (isIOS) {
		fireEvent(window, 'scrollend');
	} else {
		var scrollY = window.scrollY;
		setTimeout(function(){
			if (window.scrollY === scrollY) {
				fireEvent(window, 'scrollend');
			}
		}, 150);
	}
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
		c_navbar.instance = new Navbar(c_navbar.wrapEl);
	}

	if (c_toolbar) {
		config.viewport.className += ' enableToolbar';
		c_toolbar.wrapEl || (c_toolbar.wrapEl = q('.toolbar', config.viewport));
		c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
	}

	if (c_scroll) {
		config.viewport.className += ' enableScroll';
		c_scroll.wrapEl = i_content.getActive();
	} else {
		window.addEventListener('scroll', handlerScrollEvent, false);
	}

	if (c_transition) {
		config.viewport.className += ' enableTransition';
		c_transition.wrapEl = i_content.contentEl;
	}
});

//Plugin Initial
hooks.on('app:start', function() {
	for (var name in app.plugin) {
		var plugin = app.plugin[name];
		plugin.onAppStart && plugin.onAppStart();
	}
});

function viewPluginRun(view, funcName) {
	if (view.plugins) {
		for (var name in view.plugins) {
			var plugin = app.plugin[name], pluginOpt = view.plugins[name]
				;

			pluginOpt === true && (pluginOpt = view.plugins[name] = {});
			if (plugin && pluginOpt) {
				plugin[funcName] && plugin[funcName](view, pluginOpt);
			}
		}
	}
}

hooks.on('view:render', function(view) {
	viewPluginRun(view, 'onViewRender');
});

hooks.on('view:destory', function(view) {
	viewPluginRun(view, 'onViewTeardown');
});

function pagePluginRun(state, page, funcName) {
	if (arguments.length === 2) {
		funcName = page;
		page = state;
		state = null;
	}

	if (page.plugins) {
		for (var name in page.plugins) {
			var plugin = app.plugin[name], pluginOpt = page.plugins[name]
				;

			if (plugin && pluginOpt) {
				if (pluginOpt === true) {
					pluginOpt = page.plugins[name] = {};
				}

				if (state) {
					state.plugins[name] || (state.plugins[name] = {});
					for (var p in pluginOpt) {
						if (state.plugins[name][p] == null) {
							state.plugins[name][p] = page.plugins[name][p];
						}
					}
					pluginOpt = state.plugins[name];
				}
				plugin[funcName] && plugin[funcName](page, pluginOpt);
			}
		}
	}
}

hooks.on('page:define', function(page) {
	pagePluginRun(page, 'onPageDefine');
});

hooks.on('page:startup', function(state, page) {
	pagePluginRun(state, page, 'onPageStartup');
});

hooks.on('page:show', function(state, page) {
	pagePluginRun(state, page, 'onPageShow');
});

hooks.on('page:hide', function(state, page) {
	pagePluginRun(state, page, 'onPageHide');
});

hooks.on('page:teardown', function(state, page) {
	pagePluginRun(state, page, 'onPageTeardown');
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

hooks.once('view:extend page:define', function() {
	Template.engine = config.templateEngine || {};
});

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

// forward backwrad Initial
hooks.on('app:start', function(){
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent,
		i_content = c_content.instance,
		c_transition = config.enableTransition,
		c_scroll = config.enableScroll,
		state, page, lastState, lastPage,
		isSamePage = false, isSameState = false
		;

	// navbar
	function setNavbar() {
		var title = state.pageMeta.title || page.title,
			buttons = state.pageMeta.buttons || page.buttons
			;

		if (buttons) {
			for (var i = 0; i < buttons.length; i++)  {
				var button = buttons[i],
					handler = button.handler;

				button.id || (button.id = 'btn-' + Date.now() + '-' + parseInt(Math.random() * 10));

				if (typeof handler === 'string') {
					handler = page[handler];
				}

				if (button.type === 'back') {
					button.hide = (button.autoHide !== false && state.index < 1);
					handler || (handler = function() {
						app.navigation.pop();
					});
				}

				button.handler = (function(handler) {
					return function(e) {
						handler && handler.call(page, e, state.index);
					}
				})(handler);
			}
		} else {
			buttons = [{
				id: 'back',
				type: 'back',
				text: 'back',
				hide: state.index < 1?true:false,
				handler: function() {
					app.navigation.pop();
				}
			}];
		}

		// 第一次页面或同一个页面
		if (isSamePage || !lastPage) {
			app.navigation.resetNavbar();
			app.navigation.setTitle(title);
			for (var i = 0; i < buttons.length; i++) {
				app.navigation.setButton(buttons[i]);
			}
		} else {
			app.navigation.switchNavbar(title, state.transition, buttons);
		}
	}

	// toolbar
	function setToolbar() {
		if (c_toolbar) {
			var i_toolbar = c_toolbar.instance, 
				o_toolbar = state.pageMeta.toolbar || page.toolbar
				;

			c_toolbar.wrapEl.innerHTML = '';

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
	}

	// content
	function setContent() {
		if (!isSamePage) {		
			state.move === 'backward' ? i_content.previous() : i_content.next();
		}
	}

	function refreshContent() {
		var offsetHeight = c_scroll?config.viewport.offsetHeight:window.innerHeight;
		if (c_navbar) {
			offsetHeight -= c_navbar.wrapEl.offsetHeight;
		}
		if (c_toolbar) {
			offsetHeight -= c_toolbar.wrapEl.offsetHeight;
		}
		if (c_scroll) {
			c_content.wrapEl.style.height = offsetHeight + 'px';
		} else {
			c_content.wrapEl.style.minHeight = offsetHeight + 'px';
			c_content.instance.getActive().style.minHeight = offsetHeight + 'px';
		}
	}

	// scroll
	function setScroll() {
		if (!isSamePage && c_scroll) {
			Scroll.disable(c_scroll.wrapEl);
			c_scroll.wrapEl = i_content.getActive();
			Scroll.enable(c_scroll.wrapEl, page.scroll);
		}
	}

	// transition
	function setTransition() {
		if (!isSamePage) {
			var transition = state.transition;

			// 不是第一次页面
			if (c_transition && lastPage) {
				var wrapEl = c_transition.wrapEl,
					transEl = i_content.transEl,
					transShadeEl = i_content.transShadeEl,
					offsetWidth = wrapEl.getBoundingClientRect().width,
					offsetX = offsetWidth * (transition === 'backward'?1:-1),
					className = wrapEl.className += ' ' + transition
					;

				transShadeEl.style[(transition === 'backward'?'right':'left')] = offsetWidth + 'px';
				transEl.style.display = 'block';

				Transition.move(transShadeEl, offsetX, 0, function() {
					i_content.setClassName();
					wrapEl.className = className.replace(' ' + transition, '');
					transShadeEl.style.cssText = '';
					transEl.style.cssText = '';
					hooks.trigger('navigation:switchend', state);
				});
			} else {
				i_content.setClassName();
				hooks.trigger('navigation:switchend', state);
			}
		} else {
			hooks.trigger('navigation:switchend', state);
		}
	}

	// plugin
	function setPlugin(funcName) {
		for (var name in app.plugin) {
			var plugin = app.plugin[name];

			if (plugin) {
				state.plugins[name] || (state.plugins[name] = {});
				plugin[funcName] && plugin[funcName](state.plugins[name]);
			}
		}
	}

	// page
	function pageLoad() {
		var meta;
		if ((meta = pagemeta[state.name])) {
			meta.css && app.loadResource(meta.css, 'css');
			meta.js && app.loadResource(meta.js, 'js', function() {
				page = Page.get(state.name);
				if (page) {
					page.ready();
					pageReady();
				}
			});
		}
	}

	function pageReady() {
		page.el = i_content.getActive();
		$ && (page.$el = $(page.el));

		setNavbar();
		setToolbar();
		setScroll();
		setTransition();

		checkTemplate(page, 'template', pageShow);
	}

	function pageShow() {
		var oldFragment = page.el.getAttribute('data-fragment'), 
			oldCache = pagecache[oldFragment];


		// 如果前一个页面和当前页面的hash值不同（!isSameState）
		// 并且两个页面都不是默认页面（也就是说如果是默认页面，不管怎么改变hash都不再会进入startup和show）
		if (!isSameState && !(isSamePage && state.isDefault)) {
			lastPage && lastPage.hide(lastState); //如果有上一个页面，就先执行上一个页面的hide方法
			page.el.setAttribute('data-fragment', state.fragment);

			// 如果被替换的这个dom上的state和当前页面的state不同
			// 且是不同页面（也就是，在有dom缓存的清空下，页面只有当被别的页面替换时才会被销毁（teardown））
			if (oldFragment !== state.fragment && !isSamePage) {
				if (oldCache) {
					oldCache.page.teardown(oldCache.state); // 销毁这个dom缓存的page
					delete pagecache[oldFragment];
				}

				pagecache[state.fragment] = {state:state, page:page};
				page.el.innerHTML = '';
				page.startup(state);	// 新的page执行startup
			}

			page.show(state);

			lastState = state;
			lastPage = page;
		}		

		hooks.trigger('page:domready');
	}

	Message.get('navigation').on('forward backward replace', function() {
		state = arguments[0];
		state.pageMeta || (state.pageMeta = {});
		state.plugins || (state.plugins = {});
		page = Page.get(state.name);

		if (lastState) {
			isSamePage = lastState.name === state.name;
			isSameState = lastState.fragment === state.fragment;
		}
		hooks.trigger('navigation:switch', state);
		page?pageReady():pageLoad();
	});

	hooks.on('navigation:switch', function() {
		setContent();
		setPlugin('onNavigationSwitch');
	});

	hooks.on('navigation:switchend', function() {
		refreshContent();
		setPlugin('onNavigationSwitchEnd');
	});

	hooks.after('page:domready navigation:switchend', function() {
		setPlugin('onDomReady');
	});

	hooks.on('orientaion:change screen:resize', function() {
		refreshContent();
	});
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
	var ChildView = View.get(name);
	if (!ChildView) return;

	var context = Object.create(ChildView.prototype),
		args = Array.prototype.slice.call(arguments, 1);
	ChildView.apply(context, args);
	return context;
}

app.definePage = function(properties) {
	var page = Page.define(properties);
	hooks.trigger('page:define', page);
	return page;
}

app.definePageMeta = function(meta)  {
	if (!(meta instanceof Array)) meta = [meta]
	meta.forEach(function(m) {
		pagemeta[m.name] = m;
		hooks.trigger('page:defineMeta', m);
	});
}

app.getPage = function(name) {
	return Page.get(name);
}

var aEl = document.createElement('a');
app.loadResource = function(urls, type, callback) {
	if (arguments.length === 2) {
		if (typeof arguments[1] === 'function') {
			callback = arguments[1];
			type = null;
		}
	}

	if (typeof urls === 'string') {
		urls = [urls];
	}

	function createid() {
		return 'resource-' + Date.now() + '-' + Object.keys(resourcecache).length;
	}

	function createurl(url) {
		if (!!url.match(/^(https?\:)?\/\//)) {
			return url;
		} else {
			return app.config.resourceBase + url;
		}
	}

	function load(url, callback) {
		if (!url) {
			return callback();
		}

		url = aEl.href = createurl(url);

		if (typeof resourcecache[url] === 'string') {
			return callback();
		}

		var id = resourcecache[url] = createid();

		if (type === 'js' || url.match(/\.js$/)) {
			var script = document.createElement('script'), loaded = false;
			script.id = id;
			script.async = true;
			script.onload = script.onreadystatechange = function() {
				if (!loaded) {
					loaded = true;
					callback && callback(url);
				}
			}
			script.src = url;
			doc.body.appendChild(script);
		} else if (type === 'css' || url.match(/\.css$/)) {
			var link = document.createElement('link');
			link.id = id;
			link.type = 'text/css';
			link.rel = 'stylesheet';
			link.href = url;
			doc.body.appendChild(link);
			callback();
		}
	}

	var u = [], combo = config.resourceCombo;
	urls.forEach(function(url) {
		aEl.href = createurl(url);
		if (!resourcecache[aEl.href]) {
			resourcecache[aEl.href] = true;
			u.push(url);
		}
	});

	if (combo) {
		u = combo(u);
		if (typeof u === 'string') {
			u = [u];
		}
	}

	load(u.shift(), function() {
		if (u.length) {
			load(u.shift(), arguments.callee);
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

	replace: function(fragment, options) {
		options || (options = {});
		options.replace = true;
		navigation.push(fragment, options);
	},

	pop: function() {
		navigation.pop();
	},

	resolveFragment: function(name, params) {
		return navigation.resolve(name, params);
	},

	getReferer: function() {
		return getState().referer;
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
		getState().datas[name] = value;
	},

	setTitle: function(title) {
		var state = getState();
		if (config.enableNavbar) {
			config.enableNavbar.instance.setTitle(title);
		}
		state.pageMeta.title = title;
	},

	setButton: function(options) {
		if (options instanceof Array) {
			for (var i = 0; i < options.length; i++) {
				this.setButton(options[i]);
			}
			return;
		}

		var state = getState();
		if (config.enableNavbar) {
			config.enableNavbar.instance.setButton(options);
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

	switchNavbar: function(title, type, buttons) {
		if (config.enableNavbar) {
			this.resetNavbar();
			this.setTitle(title);
			for (var i = 0; i < buttons.length; i++) {
				this.setButton(buttons[i]);
			}
			Transition.float(config.enableNavbar.instance.animWrapEl, type === 'backward'?'LI':'RI', 50);
		}
	},

	resetNavbar: function() {
		var state = getState();

		if (config.enableNavbar) {
			config.enableNavbar.instance.removeButton();
		}
		state.pageMeta.buttons = [];
	},

	setToolbar: function(options) {
		var state = getState();
		if (config.enableToolbar) {
			config.enableToolbar.instance.set(options);
		}
		state.pageMeta.toolbar = options;
	}
}

app.scroll = {
	getScrollHeight: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getScrollHeight(c_scroll.wrapEl);
		} else {
			return doc.body.scrollHeight;
		}
	},

	getScrollTop: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getScrollTop(c_scroll.wrapEl);
		} else {
			return doc.body.scrollTop;
		}
	},

	refresh: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.refresh(c_scroll.wrapEl);
		}
	},

	offset: function(el) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.offset(c_scroll.wrapEl, el);
		} else {
			return Scroll.offset(doc.body, el);
		}
	},

	scrollTo: function(y) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.scrollTo(c_scroll.wrapEl, y);
		} else {
			doc.body.scrollTop = y;
		}
	},

	scrollToElement: function(el) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.scrollToElement(c_scroll.wrapEl, el);
		} else {
			el.scrollIntoView();
		}
	},

	getViewHeight: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getViewHeight(c_scroll.wrapEl);
		} else {
			return window.innerHeight;
		}
	},


	getBoundaryOffset: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getBoundaryOffset(c_scroll.wrapEl);
		} else {
			return 0;
		}
	},

	stopBounce: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.stopBounce(c_scroll.wrapEl);
		}
	},

	resumeBounce: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.resumeBounce(c_scroll.wrapEl);
		}
	},

	addEventListener: function(name, func, isBubble) {
		var c_scroll = config.enableScroll,
			i_content = config.enableContent.instance,
			el = c_scroll?c_scroll.wrapEl:window;
		el.addEventListener(name, func, isBubble);
	},

	removeEventListener: function(name, func) {
		var c_scroll = config.enableScroll,
			i_content = config.enableContent.instance,
			el = c_scroll?c_scroll.wrapEl:window;
		el.removeEventListener(name, func);
	},

	getElement: function() {
		var c_scroll = config.enableScroll;
		return (c_scroll?c_scroll.wrapEl:doc.body);
	}
}

})(window, window['app']||(window['app']={module:{},plugin:{}}))