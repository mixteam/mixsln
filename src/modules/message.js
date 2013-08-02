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
				states[event] = Array.prototype.slice.call(arguments);
				if (checkState()) {
					that.trigger(eventName, states);
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