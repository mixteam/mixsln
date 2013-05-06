// Thanks to:
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js

(function(win, app, undef) {


var util = app.util,
    SPLITER_REG = /\s+/, // Regular expression used to split event strings
    AT_REG = /^\@([^:]+)\:/, // Regular expression used to @message
    AT_SPLITER = ':',
    msgId = 0
    ;


function getEventList(cache, event) {
    var list, matches, at
        ;

    if ((matches = event.match(AT_REG)) && matches[1] === '*') {
        list = [];
        at = new RegExp('^(@[^\\:]+\\:)?' + event + '$');

        util.each(cache, function(eventList, eventName) {
            if (at.test(eventName)) {
                list = list.concat(eventList);
            }
        });
    } else {
        list = cache[event];
    }

    return list;
}

function Message(name, id, defaultContext) {
    var that = this;

    that._name = name || 'anonymous';
    that._id = id || msgId++;
    that._cache = {};
    that._defaultContext = defaultContext || that;
}

var proto = {
    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on : function(events, callback, context) {
        var that = this,
            cache = that._cache,
            defaultContext = that._defaultContext,
            matches, event, list;

        if (!callback) return that;

        if (events && (matches = events.match(AT_REG))) {
            events = events.split(AT_SPLITER)[1];
        } else {
            matches = ['']
        }

        events = events.split(SPLITER_REG);

        while (event = events.shift()) {
            event = matches[0] + event;
            list = cache[event] || (cache[event] = []);
            list.push(callback, context || defaultContext);
        }

        return that;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off : function(events, callback, context) {
        var that = this,
            cache = that._cache, 
            matches = '', event, list, i, len;

        // No events, or removing *all* events.
        if (!(events || callback || context)) {
            delete that._cache;
            that._cache = {};
            return that;
        }

        if (events && (matches = events.match(AT_REG))) {
            events = events.split(AT_SPLITER)[1].split(SPLITER_REG);
        } else {
            events = events ? events.split(SPLITER_REG) : Object.keys(cache);
            matches = [''];
        }

        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            event = matches[0] + event;
            list = cache[event];
            if (!list) continue;

            if (!(callback || context)) {
                delete cache[event];
                continue;
            }

            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback ||
                        context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }

        return that;
    },

    has : function(event, callback, context) {
        var that = this,
            cache = that._cache, 
            list = getEventList(cache, event), i;

        if (!list) return false;

        if (!(callback || context)) return true;

        for (i = list.length - 2; i >= 0; i -= 2) {
            if (!(callback && list[i] !== callback ||
                    context && list[i + 1] !== context)) {
                return true;
            }
        }

        return false;
    },

    once : function(events, callback, context) {
        var that = this
            ;

        function onceHandler() {
            callback.apply(this, arguments);
            that.off(events, onceHandler, context);
        }

        that.on(events, onceHandler, context);
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger : function(events) {
        var that = this,
            cache = that._cache, 
            defaultContext = that._defaultContext,
            event, all, list, i, len, rest = [], args;

        events = events.split(SPLITER_REG);

        // Using loop is more efficient than `slice.call(arguments, 1)`
        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }

        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            that.log(event + ':(' + rest.join(',') + ')');
            
            // Copy callback lists to prevent modification.
            if (all = cache.all) all = all.slice();
            if (list = getEventList(cache, event)) list = list.slice();

            // Execute event callbacks.
            if (list) {
                for (i = 0, len = list.length; i < len; i += 2) {
                    list[i].apply(list[i + 1] || defaultContext, rest);
                }
            }

            // Execute "all" callbacks.
            if (all) {
                args = [event].concat(rest);
                for (i = 0, len = all.length; i < len; i += 2) {
                    all[i].apply(all[i + 1] || defaultContext, args);
                }
            }
        }

        return that;
    },

    log : function(msg) {
        var that = this
            ;

        console.log('[(' + that._id + ')' + that._name + ']', 
            {id:that._id, name:that._name, msg:msg});
    }
}
util.extend(Message.prototype, proto);

Message.mixto = function(obj, context) {
    obj.prototype && (obj = obj.prototype);
    util.mix(obj, proto, context);
}
Message.instance = new Message('global');

app._module.message = Message;

})(window, window['app']||(window['app']={}));
