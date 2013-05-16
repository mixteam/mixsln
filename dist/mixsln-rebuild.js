/*! mixsln 2013-05-16 */
(function(win, app, undef) {

function EventSource() {
	this._handlers = {};
}

var EventSourceProto = {
	addEventListener: function(type, handler) {
		var handlers = this._handlers, list;

		list = handlers[event] || (handlers[event] = []);
		list.push(handler);
	},

	removeEventListener: function(type, handler) {
		var handlers = this._handlers;

		if (!handlers[event]) return;

		handlers[event] = handlers[event].filter(function(h) {
			return h != handler;
		});

		if (!handlers[event].length) {
			delete handlers[event];
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
			list = that._cache[event]
			;

        for (i = 0; i < list.length; i += 2) {
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
			list
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
			list
			;

        if (events) {
        	events = events.split(SPLITER_REG);
        } else {
        	events = Object.keys(cache);
        }

        while (event = events.shift()) {
        	!(callback || context) && (cache[event] = []);

        	list = cache[event];

            for (i = list.length - 2; i >= 0; i -= 2) {
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


	trigger: function(events) {
		var that = this,
			cache = that._cache,
			source = that._source,
			args
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
        console.log('[Message]', {scope:this._scope, event: event, args:args});
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
	return SCOPES[scope];
}

app.module.EventSource = EventSource;
app.module.MessageScope = MessageScope;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

function StateStack() {

}

var stateStackProto = {
	pushState: function() {},
	getState: function() {},
	getIndex: function() {}
}

StateStack.isEquals = function() {

}

function convertParams() {}
function extractNames() {}
function extractArgs() {}
function getHash() {}
function setHash() {}

function Navigation() {

}

var navigationProto = {
	_resetHandler: function() {},
	_changeHanlder: function() {},
	_matchRoute: function() {},
	_parseRoute: function() {},
	startRoute: function() {},
	stopRoute: function() {},
	addRoute: function() {},
	removeRoute: function() {},
	push: function() {},
	pop: function() {}
}

app.module.StateStack = StateStack;
app.module.Navigation = Navigation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Model() {

}

function Collection() {

}

function View() {

}

var viewProto = {
	loadTemplate: function(url, callback) {},
	compileTemplate: function(text, callback) {},
	renderTemplate: function(datas, callback) {}
}

View.fn = {};
View.define = function(propeties) {}
View.get = function(name) {}

app.module.Model = Model;
app.module.Collection = Collection;
app.module.View = View;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Page() {

}

var pageProto = {
	navigation: {
		push: function(fragment, options) {},
		pop: function() {},
		getParameter: function(name) {},
		getData: function(name) {},
		setData: function(name, value) {},
		setTitle: function(title) {},
		setButton: function(options) {}
	},
	viewport: {
		fill: function(html) {},
		el: null,
		$el: null
	},
	ready : function() {/*implement*/},
	unload : function() {/*implement*/}	
}

Page.fn = {};
Page.define = function() {}
Page.get = function() {}
Page.registerPlugin = function() {}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


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
    var event = document.createEvent('HTMLEvents');
    event.initEvent(type, true, true);

    if(typeof extra == "object")
    {
        for(var p in extra) {
            event[p] = extra[p];
        }
    }    

    while(event.cancelBubble == false && element)
    {
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

function Gesture() {

}

var gestureProto = {
	getElement: function() {}
}

app.module.Gesture = Gesture;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Animation() {

}

var animationProto = {
    doTransition: function(el, time, timeFunction, delay, x, y, callback) {},
    getTranslate: function(x, y) {},
    getBezier: function(a, b) {},
    getTransform: function(el) {}

}

app.module.Animation = Animation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Scroll() {

}

var scrollProto = {
	refresh : function() {},
	getHeight: function() {},
	getTop: function() {},
	to: function() {}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function NavBar() {

}

var navBarProto = {
	anime: function() {},
    setTitle: function(title) {},
    setButton: function(options) {},
    showButton: function(type) {},
    hideButton: function(type) {}
}

app.module.NavBar = NavBar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {


function Viewport() {

}

var viewportProto = {
	getActive : function() {},
	getInactive: function() {},
	switchActive: function() {},
	toggleClass: function() {},
	fill: function(html) {}
}

app.module.Viewport = Viewport;

})(window, window['app']||(window['app']={module:{},plugin:{}}));
(function(win, app, undef) {

app.config = {}
app.start = function() {}
app.registerPlugin = function() {}

app.view = app.module.View;
app.page = app.module.Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));