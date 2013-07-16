(function(win, app, undef) {

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
	SPLITER_REG = /\s+/,
	AND_SPLITER_REG = /\s*\&\&\s*/,
	OR_SPLITER_REG = /\s*\|\|\s*/
	;

function MessageScope(scope) {
	var that = this;

	this._scope = scope;
	this._event = new Event();
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
	_wrapAND: function(events) {
		var that = this, 
			states = {}, list = events.split(AND_SPLITER_REG);

		function checkState() {
			for (var e in states) {
				if (!states[e]) return;
			}
			that.trigger(events);
			resetState();
		}

		function resetState() {
			for (var e in states) {
				states[e] = false;
			}
		}

		list.forEach(function(event) {
			states[event] = false;
			that.on(event, function() {
				states[event] = true;
				checkState();
			});
		});
	},

	_wrapOR: function(events) {
		var that = this, 
			states = {}, list = events.split(OR_SPLITER_REG),
			isTrigger = false;

		function checkState() {
			!isTrigger && that.trigger(events);
			var state = true;
			for (var e in states) {
				state = state && states[e];
			}
			state && resetState();
		}

		function resetState() {
			for (var e in states) {
				states[e] = false;
			}
			isTrigger = false;
		}

		list.forEach(function(event) {
			states[event] = false;
			that.on(event, function() {
				states[event] = true;
				checkState();
			});
		});
	},

	on: function(events, callback, context) {
		var that = this,
			cache = that._cache,
			event = that._event,
			list, eventName
			;

		if (!callback) return that;

		if (events.match(AND_SPLITER_REG)) {
			events = events.replace(AND_SPLITER_REG, '&&');
			this._wrapAND(events);
		} else if (events.match(OR_SPLITER_REG)) {
			events = events.replace(OR_SPLITER_REG, '||');
			this._wrapOR(events);
		}

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

        if (events) {
        	events = events.split(SPLITER_REG);
        } else {
        	events = Object.keys(cache);
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
			event = that._event,
			args, eventName
			;

		events = events.split(SPLITER_REG);
		args = Array.prototype.slice.call(arguments, 1);

		while (eventName = events.shift()) {
			that.log(eventName, args);

			if (cache[eventName]) {
				event.dispatchEvent({
					type: eventName, 
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