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
            var proto = this.prototype, item, constructor = proto.constructor;
            while (item = items.shift()) {
                Object.extend(proto, item.prototype || item);
            }
            proto.constructor = constructor;
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

define("#mix/core/0.3.0/base/util-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug");
    // List of HTML entities for escaping.
    var htmlEscapes = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;"
    }, isNumber = /^[-+]?\d\d*\.?\d\d*/;
    // Regex containing the keys listed immediately above.
    var htmlEscaper = /[&<>"'\/]/g;
    var Util = Class.create({
        initialize: function() {},
        // Escape a string for HTML interpolation.
        escape: function(string) {
            return ("" + string).replace(htmlEscaper, function(match) {
                return htmlEscapes[match];
            });
        },
        str2val: function(str) {
            if (str == null || str == undefined || str == NaN) {
                return str;
            }
            str += "";
            if (str === "true" || str === "false") {
                return str === "true" ? true : false;
            } else if (isNumber.test(str)) {
                return parseFloat(str);
            } else {
                return str;
            }
        }
    });
    Util.singleton = new Util();
    module.exports = Util;
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
            var that = this, states = that._states, stateIdx = that._stateIdx, stateLimit = that._stateLimit, stateLen = states.length, move = that._move, transition = that._transition, datas = that._datas, prev = states[stateIdx - 1], next = states[stateIdx + 1], cur = {
                name: name,
                fragment: fragment,
                params: params,
                args: args
            };
            if (move == null) {
                if (!datas && that._stateEquals(prev, cur)) {
                    transition = move = "backward";
                } else {
                    transition = move = "forward";
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
            cur.transition = transition;
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
            that._transition = "forward";
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
                    if (options.transition === "backward") {
                        that._transition = "backward";
                    }
                    that._router.navigate(fragment + (args.length ? ARGS_SPLITER + args.join("&") : ""));
                }
            } else {
                his.forward();
            }
        },
        backward: function(options) {
            var that = this, stateIdx = that._stateIdx;
            if (stateIdx === 0) return;
            that._move = "backward";
            that._transition = "backward";
            options || (options = {});
            if (options.transition === "forward") {
                that._transition = "forward";
            }
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

define("#mix/sln/0.1.0/modules/scroll-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/sln/0.1.0/modules/gesture-debug", "mix/sln/0.1.0/modules/transform-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("mix/sln/0.1.0/modules/gesture-debug"), transform = require("mix/sln/0.1.0/modules/transform-debug"), prevented = false;
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

define("#mix/sln/0.1.0/modules/page-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
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

define("#mix/sln/0.1.0/components/xBase-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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

define("#mix/sln/0.1.0/components/xBack-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/util-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/components/xBase-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), util = require("mix/core/0.3.0/base/util-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, xBase = require("mix/sln/0.1.0/components/xBase-debug"), xName = "x-back", className = "x-button " + xName, xBack = xBase.create(xName, className, {
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

define("#mix/sln/0.1.0/components/xScroll-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/scroll-debug", "mix/sln/0.1.0/components/xBase-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, Scroll = require("mix/sln/0.1.0/modules/scroll-debug"), xBase = require("mix/sln/0.1.0/components/xBase-debug"), xName = "x-scroll", className = xName, xScroll = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module;
            that._scroller = new Scroll(module);
        },
        enable: function() {
            var that = this, scroller = that._scroller;
            scroller.enable();
        },
        disable: function() {
            var that = this, scroller = that._scroller;
            scroller.disable();
        },
        getViewport: function() {
            return this._scroller.getElement();
        }
    });
    return xScroll;
});

define("#mix/sln/0.1.0/components/xTransition-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/transform-debug", "mix/sln/0.1.0/components/xBase-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, transform = require("mix/sln/0.1.0/modules/transform-debug");
    xBase = require("mix/sln/0.1.0/components/xBase-debug"), xName = "x-transition", 
    className = xName, xTransition = xBase.create(xName, className, {
        Implements: Message,
        init: function() {
            var that = this, module = that._module, orginHtml = module.innerHTML, activePort, inactivePort;
            Message.prototype.initialize.call(that, "transition");
            activePort = that._activePort = doc.createElement("div");
            inactivePort = that._inactivePort = doc.createElement("div");
            activePort.className = "active";
            inactivePort.className = "inactive";
            activePort.innerHTML = orginHtml;
            module.innerHTML = "";
            module.appendChild(activePort);
            module.appendChild(inactivePort);
        },
        getViewport: function() {
            var that = this;
            return that._activePort;
        },
        action: function(type) {
            var that = this, isEnabled = that._isEnabled, module = that._module, lastActivePort = that._activePort, activePort = that._inactivePort, originX, originY;
            that._activePort = activePort;
            that._inactivePort = lastActivePort;
            activePort.innerHTML = "";
            if (isEnabled) {
                originY = transform.getY(module);
                originX = (type === "forward" ? "-" : "") + "33.33%";
                transform.start(module, "0.4s", "ease", 0, originX, originY, function() {
                    module.style.webkitTransform = transform.getTranslate(0, 0);
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

define("#mix/sln/0.1.0/components/xTitlebar-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/sln/0.1.0/components/xBase-debug", "mix/sln/0.1.0/components/xBack-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), xBase = require("mix/sln/0.1.0/components/xBase-debug"), xBack = require("mix/sln/0.1.0/components/xBack-debug"), xName = "x-titlebar", className = xName, xTitlebar = xBase.create(xName, className, {
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

define("#mix/sln/0.1.0/components/xViewport-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/util-debug", "mix/sln/0.1.0/components/xBase-debug", "mix/sln/0.1.0/components/xTitlebar-debug", "mix/sln/0.1.0/components/xScroll-debug", "mix/sln/0.1.0/components/xTransition-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, util = require("mix/core/0.3.0/base/util-debug").singleton, xBase = require("mix/sln/0.1.0/components/xBase-debug"), xTitlebar = require("mix/sln/0.1.0/components/xTitlebar-debug"), xScroll = require("mix/sln/0.1.0/components/xScroll-debug"), xTransition = require("mix/sln/0.1.0/components/xTransition-debug"), xName = "x-viewport", className = xName, xViewport = xBase.create(xName, className, {
        init: function() {
            var that = this, module = that._module, header, section, footer, subport;
            that._isEnableTitlebar = false;
            that._isEnableScroll = false;
            that._isEnableTransition = false;
            header = doc.createElement("header");
            section = doc.createElement("section");
            footer = doc.createElement("footer");
            subport = doc.createElement("div");
            section.appendChild(subport);
            module.appendChild(header);
            module.appendChild(section);
            module.appendChild(footer);
        },
        enable: function() {
            var that = this, module = that._module, header = module.querySelector("header"), subport = module.querySelector("section > div");
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
                that.xscroll = xScroll.create(subport);
                that.xscroll.enable();
            }
            if (that._isEnableTransition) {
                module.className += " enableTransition";
                that.xtransition = xTransition.create(subport);
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

define("#mix/sln/0.1.0/controllers/cNavigation-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/sln/0.1.0/modules/page-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, AppPage = require("mix/sln/0.1.0/modules/page-debug"), pages = {}, status = AppPage.STATUS, NavigationController = Class.create({
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

define("#mix/sln/0.1.0/app-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/sln/0.1.0/modules/page-debug", "mix/sln/0.1.0/controllers/cNavigation-debug", "mix/sln/0.1.0/components/xBase-debug", "mix/sln/0.1.0/components/xBack-debug", "mix/sln/0.1.0/components/xScroll-debug", "mix/sln/0.1.0/components/xTransition-debug", "mix/sln/0.1.0/components/xTitlebar-debug", "mix/sln/0.1.0/components/xViewport-debug", "mix/sln/0.1.0/app-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, AppPage = require("mix/sln/0.1.0/modules/page-debug"), Navigation = require("mix/sln/0.1.0/controllers/cNavigation-debug"), xBase = require("mix/sln/0.1.0/components/xBase-debug"), xBack = require("mix/sln/0.1.0/components/xBack-debug"), xScroll = require("mix/sln/0.1.0/components/xScroll-debug"), xTransition = require("mix/sln/0.1.0/components/xTransition-debug"), xTitlebar = require("mix/sln/0.1.0/components/xTitlebar-debug"), xViewport = require("mix/sln/0.1.0/components/xViewport-debug"), app = {
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

require("mix/sln/0.1.0/app-debug");