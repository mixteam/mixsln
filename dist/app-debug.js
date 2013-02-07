/**
* @fileOverview get fun with CommonJS!
* @author zhuxun.jb@taobao.com
*/
(function(win, doc, undef) {
    if (win["define"]) return;
    var NS_SEP = "/", ID_REG_PREFIX = /^#/, ID_REG_POSTFIX = /\.js$/i, modules = win["modules"] || (win["modules"] = {}), scope = modules, cjs = win, head = win.head || doc.head, basePath = "", aliasReg = [], aliasRep = [], resolvedId = {};
    function parseId(id, useAlias) {
        if (resolvedId[id]) {
            return resolvedId[id];
        }
        var _id = id.replace(ID_REG_PREFIX, "").replace(ID_REG_POSTFIX, "");
        if (useAlias) {
            aliasReg.forEach(function(reg, i) {
                _id = _id.replace(reg, aliasRep[i]);
            });
        }
        return resolvedId[id] = _id;
    }
    function defineNS(ns, name) {
        return ns[name] || (ns[name] = {});
    }
    function findNS(ns, name) {
        return ns[name];
    }
    function buildRequire(moduleId, dependencies) {
        var moduleIdPath = moduleId.split(NS_SEP);
        moduleIdPath.pop();
        dependencies.forEach(function(depsId) {
            var depsIdPath, resolvedPath, resolvedDepsId, path;
            depsId = parseId(depsId, true);
            if (depsId.indexOf(".") === 0) {
                depsIdPath = depsId.split(NS_SEP);
                resolvedPath = moduleIdPath.slice();
                while (path = depsIdPath.shift()) {
                    if (path === "..") {
                        resolvedPath.pop();
                    } else if (path !== ".") {
                        resolvedPath.push(path);
                    }
                }
                resolvedDepsId = resolvedPath.join(NS_SEP);
            }
            if (resolvedDepsId && depsId !== resolvedDepsId) {
                resolvedId[depsId] = resolvedDepsId;
            }
            if (!findNS(scope, resolvedDepsId || depsId)) {
                throw new Error('require a undefined module "' + (resolvedDepsId || depsId) + '" in "' + moduleId + '"');
            }
        });
        return function(id) {
            return require(id);
        };
    }
    function define(moduleId, dependencies, factory) {
        var require, module, exports;
        moduleId = parseId(moduleId);
        module = defineNS(scope, moduleId);
        exports = module.exports;
        if (exports) {
            throw new Error(moduleId + " has already defined");
        } else {
            module.id = moduleId;
            exports = module.exports = {};
        }
        require = buildRequire(moduleId, dependencies);
        if (typeof factory === "function") {
            module.executed = false;
            module.factory = factory;
            module.exports = function() {
                var module = this, factory = module.factory;
                module.exports = factory(require, module.exports, module) || module.exports;
                module.executed = true;
                delete module.factory;
                return module.exports;
            };
        } else {
            module.executed = true;
            module.exports = factory;
        }
    }
    function require(moduleId) {
        moduleId = parseId(moduleId, true);
        var module = findNS(scope, moduleId);
        if (module && module.exports) {
            return module.executed ? module.exports : module.exports();
        } else {
            throw new Error(moduleId + " has not defined");
        }
    }
    // function load(url, callback) {
    // 	var script = doc.createElement('script')
    // 		;
    // 	if (url.indexOf('http') < 0) {
    // 		url = basePath + url;
    // 	}
    // 	script.loaded = false;
    // 	script.type = 'text/javascript';
    // 	script.async = true;
    // 	script.onload = script.onreadystatechange  = function() {
    // 		if (!script.loaded) {
    // 			script.loaded = true;
    // 			callback && callback();
    // 		}
    // 	}
    // 	script.src = url;
    // 	head.appendChild(script);
    // }
    // function use(dependencies, callback) {
    // 	var args = [];
    // 	if (typeof dependencies === 'string') {
    // 		dependencies = [dependencies];
    // 	}
    // 	dependencies.forEach(function(id) {
    // 		args.push(require(id));
    // 	});
    // 	callback && callback.apply(win, args);
    // }
    // function alias(opt) {
    // 	basePath = opt.basePath;
    // 	if (opt.alias) {
    // 		for (var name in opt.alias) {
    // 			var value = opt.alias[name]
    // 				;
    // 			aliasReg.push(new RegExp('^' + name, 'i'));
    // 			aliasRep.push(value);
    // 		}
    // 	}
    // }
    cjs.define = define;
    cjs.require = require;
})(window, window.document);

define("#mix/core/0.3.0/base/reset-debug", [], function(require, exports, module) {
    var undef, toString = Object.prototype.toString, hasOwnProperty = Object.prototype.hasOwnProperty, slice = Array.prototype.slice;
    //
    // Object
    //
    if (!Object.keys) {
        Object.keys = function(object) {
            var keys = [], i = 0;
            for (var name in object) {
                if (hasOwnProperty.call(object, name)) {
                    keys[i++] = name;
                }
            }
            return keys;
        };
    }
    if (!Object.each) {
        Object.each = function(object, callback, context) {
            if (object == null) return;
            if (hasOwnProperty.call(object, "length")) {
                Array.prototype.forEach.call(object, callback, context);
            } else if (typeof object === "object") {
                for (var name in object) {
                    if (hasOwnProperty.call(object, name)) {
                        callback.call(context, object[name], name, object);
                    }
                }
            }
        };
    }
    if (!Object.clone) {
        Object.clone = function(value, deeply) {
            if (Object.isTypeof(value, "array")) {
                if (deeply) {
                    return arr.map(function(v) {
                        return Object.clone(v, deeply);
                    });
                } else {
                    return value.slice();
                }
            } else if (typeof value === "object") {
                return Object.extend({}, value, deeply);
            } else {
                return value;
            }
        };
    }
    if (!Object.extend) {
        Object.extend = function(src, target, deeply) {
            var args = Array.make(arguments), src = args.shift(), deeply = args.pop();
            if (!Object.isTypeof(deeply, "boolean")) {
                args.push(deeply);
                deeply = undef;
            }
            Object.each(args, function(target) {
                Object.each(target, function(value, name) {
                    src[name] = deeply ? Object.clone(value) : value;
                });
            });
            return src;
        };
    }
    if (!Object.isTypeof) {
        var TYPE_REGEXP = /^\[object\s\s*(\w\w*)\s*\]$/;
        Object.isTypeof = function(value, istype) {
            var str = toString.call(value).toLowerCase(), matched = TYPE_REGEXP.exec(str), type;
            if (!matched) return;
            type = matched[1];
            if (istype) {
                return type === istype.toLowerCase();
            } else {
                return type;
            }
        };
    }
    //
    // Array
    //
    if (!Array.make && !Array.from) {
        Array.from = Array.make = function(object) {
            if (hasOwnProperty.call(object, "length")) {
                return slice.call(object);
            }
        };
    }
    if (!Array.equal) {
        Array.equal = function(a1, a2) {
            if (a1.length == a2.length) {
                for (var i = 0; i < a1.length; i++) {
                    if (a1[i] !== a2[i]) return false;
                }
                return true;
            } else {
                return false;
            }
        };
    }
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, context) {
            var arr = this, len = arr.length;
            for (var i = 0; i < len; i++) {
                if (i in arr) {
                    callback.call(context, arr[i], i, arr);
                }
            }
        };
    }
    if (!Array.prototype.map) {
        Array.prototype.map = function(callback, context) {
            var arr = this, len = arr.length, newArr = new Array(len);
            for (var i = 0; i < len; i++) {
                if (i in arr) {
                    newArr[i] = callback.call(context, arr[i], i, arr);
                }
            }
            return newArr;
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, context) {
            var arr = this, len = arr.length, newArr = [], value;
            for (var i = 0; i < len; i++) {
                value = arr[i];
                if (callback.call(context, value, i, arr)) {
                    newArr.push(value);
                }
            }
            return newArr;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(value, fromIndex) {
            var arr = this, len = arr.length, i = fromIndex || 0;
            if (!len || i >= len) return -1;
            if (i < 0) i += len;
            for (;i < length; i++) {
                if (hasOwnProperty.call(arr, i)) {
                    if (value === arr[i]) return i;
                }
            }
            return -1;
        };
    }
    //
    // String
    //
    if (!String.prototype.trim) {
        var LEFT_TRIM = /^\s\s*/, RIGHT_TRIM = /\s\s*$/;
        String.prototype.trim = function() {
            return this.replace(LEFT_TRIM, "").replace(RIGHT_TRIM, "");
        };
    }
    //
    // Function
    //
    if (!Function.prototype.bind) {
        var ctor = function() {};
        Function.prototype.bind = function(context) {
            var func = this, //protoBind = Function.prototype.bind,
            args = Array.make(arguments), bound;
            // if (func.bind === protoBind && protoBind) 
            //     return protoBind.apply(func, slice.call(arguments, 1));
            if (!Object.isTypeof(func, "function")) throw new TypeError();
            args = args.slice(1);
            return bound = function() {
                var _args = Array.make(arguments);
                if (!(this instanceof bound)) return func.apply(context, args.concat(_args));
                ctor.prototype = func.prototype;
                var self = new ctor();
                var result = func.apply(self, args.concat(_args));
                if (Object(result) === result) return result;
                return self;
            };
        };
    }
});

// --------------------------------
// Thanks to:
//  - https://github.com/alipay/arale/blob/master/lib/class/docs/competitors.md
//  - http://ejohn.org/blog/simple-javascript-inheritance/
//  - https://github.com/alipay/arale/blob/master/lib/class/src/class.js
//  - http://mootools.net/docs/core/Class/Class
//  - http://ejohn.org/blog/simple-javascript-inheritance/
//  - https://github.com/ded/klass
//  - http://documentcloud.github.com/backbone/#Model-extend
//  - https://github.com/joyent/node/blob/master/lib/util.js
//  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
//
// --------------------------------
// TODO: 
//  - 测试typeof和toString的性能
// The base Class implementation.
define("#mix/core/0.3.0/base/class-debug", [], function(require, exports, module) {
    function Class(o) {
        // Convert existed function to Class.
        if (!(this instanceof Class) && Object.isTypeof(o, "function")) {
            return classify(o);
        }
    }
    Class.create = function(parent, properties) {
        if (!Object.isTypeof(parent, "function")) {
            properties = parent;
            parent = null;
        }
        properties || (properties = {});
        parent || (parent = properties.Extends || Class);
        properties.Extends = parent;
        // The created class constructor
        function Klass() {
            // Call the parent constructor.
            parent.apply(this, arguments);
            // Only call initialize in self constructor.
            if (this.constructor === Klass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }
        // Inherit class (static) properties from parent.
        if (parent !== Class) {
            Object.extend(Klass, parent);
        }
        // Add instance properties to the klass.
        implement.call(Klass, properties);
        // Make klass extendable.
        return classify(Klass);
    };
    // Create a new Class that inherits from this class
    Class.extend = function(properties) {
        properties || (properties = {});
        properties.Extends = this;
        return Class.create(properties);
    };
    // Mutators define special properties.
    Class.Mutators = {
        Extends: function(parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);
            // Keep existed properties.
            Object.extend(proto, existed);
            // Enforce the constructor to be what we expect.
            proto.constructor = this;
            // Set the prototype chain to inherit from `parent`.
            this.prototype = proto;
            // Set a convenience property in case the parent's prototype is
            // needed later.
            this.superclass = parent.prototype;
        },
        Implements: function(items) {
            Object.isTypeof(items, "array") || (items = [ items ]);
            var proto = this.prototype, item;
            while (item = items.shift()) {
                Object.extend(proto, item.prototype || item);
            }
        },
        Statics: function(staticProperties) {
            Object.extend(this, staticProperties);
        }
    };
    // Shared empty constructor function to aid in prototype-chain creation.
    function Ctor() {}
    // See: http://jsperf.com/object-create-vs-new-ctor
    if (Object.__proto__) {
        function createProto(proto) {
            return {
                __proto__: proto
            };
        }
    } else {
        function Ctor() {}
        function createProto(proto) {
            Ctor.prototype = proto;
            return new Ctor();
        }
    }
    function implement(properties) {
        var key, value;
        for (key in properties) {
            value = properties[key];
            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }
    function classify(cls) {
        cls.extend = Class.extend;
        cls.implement = implement;
        return cls;
    }
    module.exports = Class;
});

// Thanks to:
//  - https://github.com/documentcloud/backbone/blob/master/backbone.js
//  - https://github.com/joyent/node/blob/master/lib/events.js
define("#mix/core/0.3.0/base/message-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), SPLITER_REG = /\s+/, // Regular expression used to split event strings
    AT_REG = /^\@([^:]+)\:/, // Regular expression used to @message
    AT_SPLITER = ":", msgId = 0;
    function getEventList(cache, event) {
        var list, matches, at;
        if ((matches = event.match(AT_REG)) && matches[1] === "*") {
            list = [];
            at = new RegExp("^(@[^\\:]+\\:)?" + event + "$");
            Object.each(cache, function(eventList, eventName) {
                if (at.test(eventName)) {
                    list = list.concat(eventList);
                }
            });
        } else {
            list = cache[event];
        }
        return list;
    }
    var Message = Class.create({
        initialize: function(name, id, defaultContext) {
            var that = this;
            that.__msgObj = {
                name: name || "anonymous",
                id: id || msgId++,
                cache: {},
                defaultContext: defaultContext || that
            };
        },
        // Bind one or more space separated events, `events`, to a `callback`
        // function. Passing `"all"` will bind the callback to all events fired.
        on: function(events, callback, context) {
            var that = this, cache = that.__msgObj.cache, defaultContext = that.__msgObj.defaultContext, matches, event, list;
            if (!callback) return that;
            if (events && (matches = events.match(AT_REG))) {
                events = events.split(AT_SPLITER)[1];
            } else {
                matches = [ "" ];
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
        off: function(events, callback, context) {
            var that = this, cache = that.__msgObj.cache, matches = "", event, list, i, len;
            // No events, or removing *all* events.
            if (!(events || callback || context)) {
                delete that.__msgObj.events;
                return that;
            }
            if (events && (matches = events.match(AT_REG))) {
                events = events.split(AT_SPLITER)[1].split(SPLITER_REG);
            } else {
                events = Object.keys(cache);
                matches = [ "" ];
            }
            // Loop through the callback list, splicing where appropriate.
            while (event = events.shift()) {
                event = matches[0] + events;
                list = cache[event];
                if (!list) continue;
                if (!(callback || context)) {
                    delete cache[event];
                    continue;
                }
                for (i = list.length - 2; i >= 0; i -= 2) {
                    if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                        list.splice(i, 2);
                    }
                }
            }
            return that;
        },
        has: function(event, callback, context) {
            var that = this, cache = that.__msgObj.cache, list = getEventList(cache, event), i;
            if (!list) return false;
            if (!(callback || context)) return true;
            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
                    return true;
                }
            }
            return false;
        },
        once: function(events, callback, context) {
            var that = this;
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
        trigger: function(events) {
            var that = this, cache = that.__msgObj.cache, defaultContext = that.__msgObj.defaultContext, event, all, list, i, len, rest = [], args;
            events = events.split(SPLITER_REG);
            // Using loop is more efficient than `slice.call(arguments, 1)`
            for (i = 1, len = arguments.length; i < len; i++) {
                rest[i - 1] = arguments[i];
            }
            // For each event, walk through the list of callbacks twice, first to
            // trigger the event, then to trigger any `"all"` callbacks.
            while (event = events.shift()) {
                that.log(event + ":(" + rest.join(",") + ")");
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
                    args = [ event ].concat(rest);
                    for (i = 0, len = all.length; i < len; i += 2) {
                        all[i].apply(all[i + 1] || defaultContext, args);
                    }
                }
            }
            return that;
        },
        log: function(msg) {
            var that = this;
            console.log("[(" + that.__msgObj.id + ")" + that.__msgObj.name + "]" + msg);
        }
    });
    // Mix `Message` to object instance or Class function.
    Message.SPLITER_REG = SPLITER_REG;
    Message.AT_REG = AT_REG;
    Message.singleton = new Message("global");
    module.exports = Message;
});

// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define("#mix/core/0.3.0/url/router-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), win = window, doc = win.document, loc = win.location;
    var Router = Class.create({
        Implements: Message,
        initialize: function() {
            var that = this;
            Message.prototype.initialize.call(that, "router");
            that._handlers = [];
            that._options = {};
            that._changeHanlder = that._changeHanlder.bind(that);
        },
        _getHash: function() {
            return loc.hash.slice(1) || "";
        },
        _setHash: function(fragment) {
            loc.hash = fragment;
        },
        _resetHandler: function() {
            var that = this, handlers = that._handlers;
            Object.each(handlers, function(handler) {
                handler.matched = false;
            });
        },
        _changeHanlder: function() {
            var that = this;
            that._resetHandler();
            that.match();
        },
        start: function(options) {
            var that = this, fragment;
            if (Router.started) return false;
            Router.started = true;
            win.addEventListener("hashchange", that._changeHanlder, false);
            options = Object.extend(that._options, options || {});
            if (options.firstMatch !== false) {
                that.match();
            }
            return true;
        },
        stop: function() {
            var that = this;
            if (!Router.started) return false;
            win.removeEventListener("hashchange", that._changeHanlder, false);
            Router.started = false;
            that._options = {};
            that._handlers = [];
            that._fragment = null;
            return true;
        },
        match: function() {
            var that = this, options = that._options, handlers = that._handlers, handler, fragment, unmatched = true;
            if (!Router.started) return;
            fragment = that._fragment = that._getHash();
            for (var i = 0; i < handlers.length; i++) {
                handler = handlers[i];
                if (!handler.matched && handler.route.test(fragment)) {
                    unmatched = false;
                    handler.matched = true;
                    handler.callback(fragment);
                    if (handler.last) break;
                }
            }
            unmatched && that.trigger("unmatched", fragment);
        },
        add: function(route, callback, last) {
            var that = this, handlers = that._handlers;
            handlers.push({
                route: route,
                callback: callback,
                matched: false,
                last: !!last
            });
        },
        remove: function(route, callback) {
            var that = this, handlers = that._handlers;
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (handler.route.source === route.source && (!callback || handler.callback === callback)) {
                    return handlers.splice(i, 1);
                }
            }
        },
        navigate: function(fragment) {
            var that = this, fragment;
            if (!Router.started) return;
            fragment || (fragment = "");
            if (that._fragment !== fragment) {
                that._setHash(fragment);
            }
        }
    });
    Router.started = false;
    Router.singleton = new Router();
    module.exports = Router;
});

// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define("#mix/core/0.3.0/url/navigate-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/router-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), Router = require("mix/core/0.3.0/url/router-debug"), NAMED_REGEXP = /\:(\w\w*)/g, SPLAT_REGEXP = /\*(\w\w*)/g, PERL_REGEXP = /P\<(\w\w*?)\>/g, ARGS_SPLITER = "!", //escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g,
    //routeRegExp = /^([^!]*?)(![^!]*?)?$/,
    win = window, doc = win.document, his = win.history, loc = win.location;
    var Navigate = Class.create({
        Implements: Message,
        initialize: function(options) {
            var that = this;
            Message.prototype.initialize.call(that, "navigate");
            that._move = null;
            that._datas = null;
            that._routes = {};
            that._states = [];
            that._stateIdx = 0;
            that._stateLimit = options.stateLimit || 100;
            that._router = options.useRouter;
        },
        _convertParams: function(routeText) {
            return routeText.replace(NAMED_REGEXP, "(P<$1>[^\\/]*?)").replace(SPLAT_REGEXP, "(P<$1>.*?)");
        },
        _extractNames: function(routeText) {
            var matched = routeText.match(PERL_REGEXP), names = {};
            matched && Object.each(matched, function(name, i) {
                names[name.replace(PERL_REGEXP, "$1")] = i;
            });
            return names;
        },
        _extractArgs: function(args) {
            var split = args.split("&");
            args = {};
            Object.each(split, function(pair) {
                if (pair) {
                    var s = pair.split("=");
                    args[s[0]] = s[1];
                }
            });
            return args;
        },
        _parseRoute: function(routeText) {
            routeText = routeText.replace(PERL_REGEXP, "");
            return new RegExp("^(" + routeText + ")(" + ARGS_SPLITER + ".*?)?$");
        },
        _stateEquals: function(state1, state2) {
            if (!state1 || !state2) return false;
            if (state1.name !== state2.name || state1.fragment !== state2.fragment) return false;
            return true;
        },
        _pushState: function(name, fragment, params, args) {
            var that = this, states = that._states, stateIdx = that._stateIdx, stateLimit = that._stateLimit, stateLen = states.length, move = that._move, datas = that._datas, prev = states[stateIdx - 1], next = states[stateIdx + 1], cur = {
                name: name,
                fragment: fragment,
                params: params,
                args: args
            };
            if (move == null) {
                if (!datas && that._stateEquals(prev, cur)) {
                    move = "backward";
                } else {
                    move = "forward";
                }
            }
            if (move === "backward") {
                if (stateIdx === 0 && stateLen > 0) {
                    states.unshift(cur);
                } else if (stateIdx > 0) {
                    stateIdx--;
                    cur = prev;
                }
            } else if (move === "forward") {
                if (stateIdx === stateLimit - 1) {
                    states.shift();
                    states.push(cur);
                } else if (stateIdx === 0 && stateLen === 0) {
                    states.push(cur);
                } else if (!datas && that._stateEquals(next, cur)) {
                    stateIdx++;
                    cur = next;
                } else {
                    stateIdx++;
                    states.splice(stateIdx);
                    states.push(cur);
                }
            }
            cur.move = move;
            datas && (cur.datas = datas);
            that._move = null;
            that._datas = null;
            that._stateIdx = stateIdx;
            that.trigger(move, cur);
            return cur;
        },
        getState: function() {
            var that = this;
            return that._states[that._stateIdx];
        },
        getStateIndex: function() {
            var that = this;
            return that._stateIdx;
        },
        addRoute: function(name, routeText, options) {
            var that = this, callback, routeNames, routeReg;
            if (arguments.length === 1) {
                options = arguments[0];
                name = null;
                routeText = null;
            }
            options || (options = {});
            if (options["default"]) {
                that._router.on("unmatched", function(fragment) {
                    var state = that._pushState(name, fragment);
                    options.callback && options.callback(state);
                });
            } else if (name && routeText) {
                routeText = that._convertParams(routeText);
                routeNames = that._extractNames(routeText);
                routeReg = that._parseRoute(routeText);
                that._routes[name] = routeReg;
                that._router.add(routeReg, function(fragment) {
                    var matched = fragment.match(routeReg).slice(2), args = that._extractArgs(matched.pop() || ""), params = {}, state;
                    Object.each(routeNames, function(index, key) {
                        params[key] = matched[index];
                    });
                    state = that._pushState(name, fragment, params, args);
                    options.callback && options.callback(state);
                }, options.last);
            }
        },
        removeRoute: function(name) {
            var that = this, routeReg = that._routes[name];
            routeReg && that._router.remove(routeReg);
        },
        forward: function(fragment, options) {
            var that = this, states = that._states, stateIdx = that._stateIdx, cur = states[stateIdx] || {}, args = [];
            that._move = "forward";
            options || (options = {});
            if (fragment) {
                if (options.datas || cur.fragment !== fragment) {
                    if (options.args) {
                        Object.each(options.args, function(value, key) {
                            args.push(key + "=" + value);
                        });
                    }
                    if (options.datas) {
                        that._datas = Object.clone(options.datas);
                    }
                    that._router.navigate(fragment + (args.length ? ARGS_SPLITER + args.join("&") : ""));
                }
            } else {
                his.forward();
            }
        },
        backward: function() {
            var that = this, stateIdx = that._stateIdx;
            if (stateIdx === 0) return;
            that._move = "backward";
            his.back();
        }
    });
    Navigate.singleton = new Navigate({
        useRouter: Router.singleton
    });
    module.exports = Navigate;
});

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
define("#mix/sln/0.1.0/modules/gesture-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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
            el.removeEventListener("touchstart", that._onStart);
            el.removeEventListener("tap", that._onTap);
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

define("#mix/sln/0.1.0/modules/transform-debug", [], function(require, exports, module) {
    var MATRIX3D_REG = /^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/, MATRIX_REG = /^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/, appVersion = navigator.appVersion, isAndroid = /android/gi.test(appVersion), isIOS = /iphone|ipad/gi.test(appVersion), has3d = "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix();
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
    function waitTransition(el, propertyName, callback) {
        var parentEl = el.parentNode;
        function eventHandler(e) {
            if (e.srcElement !== el || e.propertyName != propertyName) {
                return;
            }
            el.style.webkitTransition = "none";
            el.removeEventListener("webkitTransitionEnd", eventHandler, false);
            callback && setTimeout(callback, 50);
        }
        el.addEventListener("webkitTransitionEnd", eventHandler, false);
    }
    function doTransition(el, time, timeFunction, delay, x, y, callback) {
        var propertyName = "-webkit-transform", parentEl = el.parentNode;
        waitTransition(el, propertyName, callback);
        el.style.webkitTransition = [ propertyName, time, timeFunction, delay ].join(" ");
        el.style.webkitTransform = getTranslate(x, y);
    }
    exports.getY = getTransformY;
    exports.getX = getTransformX;
    exports.getTranslate = getTranslate;
    exports.getBezier = quadratic2cubicBezier;
    exports.start = doTransition;
});

define("#mix/sln/0.1.0/modules/scroll-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/sln/0.1.0/modules/gesture-debug", "mix/sln/0.1.0/modules/transform-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("mix/sln/0.1.0/modules/gesture-debug"), transform = require("mix/sln/0.1.0/modules/transform-debug"), prevented = false;
    function getMaxScrollTop(el) {
        var parentEl = el.parentNode, parentStyle = getComputedStyle(parentEl);
        return 0 - el.scrollHeight + parentEl.offsetHeight - parseInt(parentStyle.paddingTop) - parseInt(parentStyle.paddingBottom) - parseInt(parentStyle.marginTop) - parseInt(parentStyle.marginBottom);
    }
    var STYLE = {
        element: {
            position: "relative",
            "-webkit-backface-visibility": "hidden",
            "-webkit-transform-style": "preserve-3d"
        }
    };
    Object.each(STYLE, function(styles, key) {
        var cssText = "";
        Object.each(styles, function(value, name) {
            cssText += name + ":" + value + ";";
        });
        STYLE[key].cssText = cssText;
    });
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
            element.style.cssText = STYLE.element.cssText;
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

define("#mix/sln/0.1.0/modules/transition-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/sln/0.1.0/modules/transform-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), transform = require("mix/sln/0.1.0/modules/transform-debug");
    var STYLE = {
        element: {
            position: "relative",
            "-webkit-backface-visibility": "hidden",
            "-webkit-transform-style": "preserve-3d"
        },
        activePort: {
            display: "block",
            "-webkit-box-sizing": "border-box",
            width: "33.33%",
            position: "relative",
            left: "33.33%"
        },
        notActivePort: {
            display: "none",
            "-webkit-box-sizing": "border-box",
            width: "33.33%",
            position: "relative",
            left: "33.33%"
        }
    };
    Object.each(STYLE, function(styles, key) {
        var cssText = "";
        Object.each(styles, function(value, name) {
            cssText += name + ":" + value + ";";
        });
        STYLE[key].cssText = cssText;
    });
    var Transition = Class.create({
        Implements: Message,
        initialize: function(element) {
            var that = this;
            Message.prototype.initialize.call(that, "transition");
            that._el = element;
            that._activePort = doc.createElement("div");
            that._notActivePort = doc.createElement("div");
            element.style.cssText = STYLE.element.cssText;
            that._activePort.style.cssText = STYLE.activePort.cssText;
            that._notActivePort.style.cssText = STYLE.notActivePort.cssText;
        },
        getElement: function() {
            return this._el;
        },
        getActivePort: function() {
            return this._activePort;
        },
        getNotActivePort: function() {
            return this._notActivePort;
        },
        enable: function() {
            var that = this, el = that._el, activePort = that._activePort, notActivePort = that._notActivePort, orginHtml = el.innerHTML;
            el.innerHTML = "";
            el.style.width = "300%";
            el.style.left = "-100%";
            el.appendChild(activePort);
            el.appendChild(notActivePort);
            activePort.innerHTML = orginHtml;
        },
        disable: function() {
            var that = this, el = that._el, activePort = that._activePort, notActivePort = that._notActivePort, orginHtml = activePort.innerHTML;
            activePort.innerHTML = "";
            notActivePort.innerHTML = "";
            el.removeChild(activePort);
            el.removeChild(notActivePort);
            el.style.width = "100%";
            el.style.left = "0";
            el.innerHTML = orginHtml;
        },
        forward: function() {
            var that = this, el = that._el, lastActivePort = that._activePort, activePort = that._notActivePort, originX, originY;
            that._activePort = activePort;
            that._notActivePort = lastActivePort;
            originY = transform.getY(el);
            originX = "-33.33%";
            transform.start(el, "1s", "ease-in-out", 0, originX, originY, function() {
                el.style.webkitTransform = transform.getTranslate(0, 0);
                activePort.style.display = "block";
                lastActivePort.style.display = "none";
                that.trigger("forwardTransitionEnd");
            });
        },
        backward: function() {
            var that = this, el = that._el, lastActivePort = that._activePort, activePort = that._notActivePort, originX, originY;
            that._activePort = activePort;
            that._notActivePort = lastActivePort;
            originY = transform.getY(el);
            originX = "33.33%";
            transform.start(el, "1s", "ease-in-out", 0, originX, originY, function() {
                el.style.webkitTransform = transform.getTranslate(0, 0);
                activePort.style.display = "block";
                lastActivePort.style.display = "none";
                that.trigger("backwardTransitionEnd");
            });
        }
    });
    return Transition;
});

define("#mix/sln/0.1.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton;
    var AppPage = Class.create({
        Implements: Message,
        initialize: function(name, options) {
            var that = this;
            Message.prototype.initialize.call(this, "app." + name);
            that._appname = name;
            that._isReady = false;
            that._bindRoutes(options.routes);
            that.on("ready", function(state) {
                if (!that._isReady) {
                    that._isReady = true;
                    that.ready(state);
                }
            });
            that.on("unload", function() {
                if (that._isReady) {
                    that._isReady = false;
                    that.unload();
                }
            });
        },
        _bindRoutes: function(routes) {
            var that = this, appname = that._appname;
            Object.each(routes, function(route, routeName) {
                var routeText = route.text, routeCallback = route.callback;
                if (routeName === "default") {
                    route["default"] = true;
                }
                route.callback = function() {
                    if (Object.isTypeof(routeCallback, "string")) {
                        routeCallback = that[routeCallback];
                    }
                    if (!that._isReady) {
                        that.once("ready", function() {
                            routeCallback.apply(that, arguments);
                        });
                    } else {
                        routeCallback.apply(that, arguments);
                    }
                };
                navigate.addRoute(appname + "." + routeName, routeText, route);
            });
        },
        ready: function(state) {},
        unload: function() {}
    });
    return AppPage;
});

define("#mix/sln/0.1.0/app-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/gesture-debug", "mix/sln/0.1.0/modules/scroll-debug", "mix/sln/0.1.0/modules/transition-debug", "mix/sln/0.1.0/modules/page-debug", "mix/sln/0.1.0/app-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Gesture = require("mix/sln/0.1.0/modules/gesture-debug"), Scroll = require("mix/sln/0.1.0/modules/scroll-debug"), Transition = require("mix/sln/0.1.0/modules/transition-debug"), AppPage = require("mix/sln/0.1.0/modules/page-debug"), app = {
        theme: "ios",
        routePrefix: 0,
        // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
        routePrefixSep: "/",
        components: {}
    }, componentFunction = {
        _isEnabled: false,
        enable: function() {
            if (this._module && !this._isEnabled) {
                this._module.enable();
                this._isEnabled = true;
            }
        },
        disable: function() {
            if (this._module && this._isEnabled) {
                this._module.disable();
                this._isEnabled = false;
            }
        }
    }, pages = {};
    function initXback(el) {
        var comps = app.components, xBack;
        el || (el = doc.querySelector('*[is="x-back"]'));
        if (el) {
            function preventClick(e) {
                navigate.backward();
                e.preventDefault();
                return false;
            }
            function changeVisibility() {
                var el = xBack._module, visibility = navigate.getStateIndex() < 1 ? "hidden" : "";
                if (el.style.visibility !== visibility) {
                    el.style.visibility = visibility;
                }
            }
            xBack = comps["xBack"] = {
                _module: el,
                _isEnabled: false,
                _isAutoHide: el.getAttribute("autoHide") === "true" ? true : false,
                enable: function() {
                    var that = this, module = that._module;
                    if (module && !that._isEnabled) {
                        that._isEnabled = true;
                        module.addEventListener("click", preventClick, false);
                        that.autoHide(that._isAutoHide);
                    }
                },
                disable: function() {
                    var that = this, module = that._module;
                    if (module && that._isEnabled) {
                        that._isEnabled = false;
                        el.removeEventListener("click", preventClick);
                        that.autoHide = false;
                    }
                },
                autoHide: function(is) {
                    var that = this, module = that._module;
                    if (module) {
                        that._isAutoHide = is;
                        if (is) {
                            changeVisibility();
                            navigate.on("forward backward", changeVisibility);
                        } else {
                            module.style.visibility = "";
                            navigate.off("forward backward", changeVisibility);
                        }
                    }
                }
            };
            xBack.enable();
        }
    }
    function initXScroll(el) {
        var comps = app.components, xScroll;
        el || (el = doc.querySelector('*[is="x-scroll"]'));
        if (el) {
            el.className += (el.className ? " " : "") + "scrollport";
            xScroll = comps["xScroll"] = Object.extend({
                _module: app.ui.scroll(el),
                getViewport: function() {
                    return this._module.getElement();
                }
            }, componentFunction);
            xScroll.enable();
        }
    }
    function initXTransition(el) {
        var comps = app.components, xTransition;
        el || (el = doc.querySelector('*[is="x-transition"]'));
        if (el) {
            el.className += (el.className ? " " : "") + "transitionport";
            xTransition = comps["xTransition"] = Object.extend({
                _module: app.ui.transition(el),
                getViewport: function() {
                    var that = this, isEnabled = that._isEnabled;
                    if (isEnabled) {
                        return this._module.getActivePort();
                    } else {
                        return that._module.getElement();
                    }
                }
            }, componentFunction);
            xTransition.enable();
        }
    }
    function initXViewport(el) {
        var comps = app.components, xViewport;
        el || (el = doc.querySelector('*[is="x-viewport"]'));
        if (el) {
            el.className += (el.className ? " " : "") + "viewport";
            xViewport = comps["xViewport"] = {
                _module: el,
                _content: null,
                _isEnabled: false,
                _isEnableScroll: el.getAttribute("enableScroll") === "true" ? true : false,
                _isEnableTransition: el.getAttribute("enableTransition") === "true" ? true : false,
                enable: function() {
                    var that = this, module = that._module, subport;
                    if (module && !that._isEnabled) {
                        that._isEnabled = true;
                        subport = doc.createElement("div");
                        module.appendChild(subport);
                        if (that._isEnableScroll) {
                            module.style.overflowY = "hidden";
                            module.style.height = "100%";
                            initXScroll(subport);
                        }
                        if (that._isEnableTransition) {
                            module.style.overflowX = "hidden";
                            module.style.width = "100%";
                            initXTransition(subport);
                        }
                        that._content = subport;
                    }
                },
                disable: function() {
                    var that = this, module = that._module;
                    if (module && that._isEnabled) {
                        that._isEnabled = false;
                    }
                },
                getViewport: function() {
                    var that = this, comps = app.components;
                    if (that._isEnableTransition) {
                        return comps["xTransition"].getViewport();
                    } else if (that._isEnableScroll) {
                        return comps["xScroll"].getViewport();
                    } else {
                        return that._content;
                    }
                }
            };
            xViewport.enable();
        }
    }
    function initNavigateAction() {
        var curApp = null, comps = app.components, xTransition = comps["xTransition"];
        function switchAppPage(state) {
            var appName = state.name.split(".")[0];
            if (curApp !== appName) {
                var lastPage = pages[curApp], curPage = pages[appName];
                curApp = appName;
                lastPage && lastPage.trigger("unload");
                curPage && curPage.trigger("ready", state);
            }
        }
        function doTransition(state) {
            var module = xTransition._module;
            module.once(state.move + "TransitionEnd", function() {
                switchAppPage(state);
            });
            module[state.move]();
        }
        navigate.on("forward backward", xTransition ? doTransition : switchAppPage);
    }
    Object.extend(app, {
        init: function(page) {
            var that = this, name = page.name, routes = page.routes || {};
            delete page.name;
            delete page.routes;
            var appPage = new AppPage(name, {
                routePrefix: app.routePrefix,
                routePrefixSep: app.routePrefixSep,
                routes: routes
            });
            Object.extend(appPage, page);
            pages[name] = appPage;
        },
        getViewport: function() {
            var comps = app.components;
            return comps["xViewport"].getViewport();
        },
        router: router,
        navigate: navigate,
        ui: {
            gesture: function(element) {
                return new Gesture(element);
            },
            scroll: function(element) {
                return new Scroll(element);
            },
            transition: function(element) {
                return new Transition(element);
            }
        }
    });
    initXback();
    initXScroll();
    initXTransition();
    initXViewport();
    initNavigateAction();
    win["app"] = app;
});

require("mix/sln/0.1.0/app-debug");