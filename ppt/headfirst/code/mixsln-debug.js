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
                events = events ? events.split(SPLITER_REG) : Object.keys(cache);
                matches = [ "" ];
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
            console.log("[(" + that.__msgObj.id + ")" + that.__msgObj.name + "]", {
                id: that.__msgObj.id,
                name: that.__msgObj.name,
                msg: msg
            });
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
                params: params || {},
                args: args || {},
                datas: datas || {}
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
                } else if (that._stateEquals(states[stateIdx], cur)) {
                    cur = states[stateIdx];
                } else {
                    stateIdx++;
                    states.splice(stateIdx);
                    states.push(cur);
                }
            }
            cur.move = move;
            cur.transition = transition;
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
define("#mix/sln/0.3.5/modules/gesture-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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

define("#mix/sln/0.3.5/modules/transform-debug", [], function(require, exports, module) {
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
        if (has3d) {
            return "translate3d(" + x + ", " + y + ",0)";
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

define("#mix/sln/0.3.5/modules/scroll-debug", [ "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, navigator = win.navigator, Class = require("mix/core/0.3.0/base/class-debug"), Gesture = require("./gesture-debug"), Transform = require("./transform-debug"), prevented = false;
    function getMaxScrollTop(el) {
        var parentStyle = getComputedStyle(el.parentNode);
        var maxTop = 0 - el.offsetHeight + parseInt(parentStyle.height) - parseInt(parentStyle.paddingTop) - parseInt(parentStyle.paddingBottom);
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

define("#mix/sln/0.3.5/modules/component-debug", [ "./scroll-debug", "./gesture-debug", "./transform-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
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
            // active.setAttribute('index', '0');
            // inactive.setAttribute('index', '1');
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
        fillActiveContent: function(html) {
            var content = this.getActiveContent();
            content && (content.innerHTML = html);
            this.trigger("fillContentEnd");
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
                //active.style.top = '-9999px';
                active.style.display = "block";
                originX = Transform.getX(wrap);
                originY = Transform.getY(wrap);
                originX += type === "forward" ? -wrapWidth : wrapWidth;
                Transform.start(wrap, "0.4s", "ease", 0, originX, originY, function() {
                    content.fn.toggleClass();
                    active.style.left = -originX + "px";
                    //active.style.top = '';
                    //active.style.display = '';
                    wrap.appendChild(active);
                    inactive.style.display = "none";
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

define("#mix/sln/0.3.5/modules/view-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
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
            if (url) {
                app.loadFile(url, callback);
            } else {
                callback();
            }
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
    View.each = function(delegate) {
        Object.each(views, delegate);
    };
    return View;
});

define("#mix/sln/0.3.5/modules/page-debug", [ "./view-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/base/message-debug", "mix/core/0.3.0/url/navigate-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), Message = require("mix/core/0.3.0/base/message-debug"), navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, View = require("./view-debug"), STATUS = {
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
            var that = this, html;
            if (Object.isTypeof(datas, "string")) {
                html = datas;
            } else {
                html = that.renderTemplate(datas);
            }
            app.component.fillActiveContent(html);
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
        var cPage = Page.extend(properties), iPage = new cPage(), name, route;
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
        name = iPage.name;
        route = iPage.route;
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
        return pages[iPage.name] = iPage;
    };
    Page.get = function(name) {
        return pages[name];
    };
    Page.each = function(delegate) {
        Object.each(pages, delegate);
    };
    return Page;
});

define("#mix/sln/0.3.5/modules/navigation-debug", [ "./page-debug", "./view-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug" ], function(require, exports, module) {
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
        setData: function(name, value) {
            if (!this._cur) return;
            this._cur.state.datas[name] = value;
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

define("#mix/sln/0.3.5/app-debug", [ "./modules/view-debug", "./modules/page-debug", "./modules/component-debug", "./modules/scroll-debug", "./modules/gesture-debug", "./modules/transform-debug", "./modules/navigation-debug", "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug", "mix/core/0.3.0/url/router-debug", "mix/core/0.3.0/url/navigate-debug", "mix/core/0.3.0/base/message-debug", "mix/sln/0.3.5/app-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), router = require("mix/core/0.3.0/url/router-debug").singleton, navigate = require("mix/core/0.3.0/url/navigate-debug").singleton, View = require("./modules/view-debug"), Page = require("./modules/page-debug"), Component = require("./modules/component-debug"), Navigation = require("./modules/navigation-debug");
    app = {};
    function initComponent() {
        var viewport = app.config.viewport, navibar, backBtn, funcBtn, content, toolbar;
        if (viewport) {
            navibar = viewport.querySelector("header.navibar");
            backBtn = navibar.querySelector("li:nth-child(2) button");
            funcBtn = navibar.querySelector("li:nth-child(3) button");
            content = viewport.querySelector("section.content");
            toolbar = viewport.querySelector("footer.toolbar");
            Component.initViewport(viewport);
            if (app.config.enableNavibar) {
                Component.initNavibar(navibar);
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
    }
    function initNavigation() {
        var navibar = Component.get("navibar"), backBtn = Component.get("backBtn"), funcBtn = Component.get("funcBtn"), backBtnHandler = null, funcBtnHandler = null, content = Component.get("content"), scroll = Component.get("scroll"), transition = Component.get("transition");
        Component.on("backBtnClick", function() {
            if (backBtnHandler) {
                backBtnHandler();
            } else {
                navigate.backward();
            }
        });
        Component.on("funcBtnClick", function() {
            funcBtnHandler && funcBtnHandler();
        });
        Component.on("fillContentEnd", function() {
            scroll && scroll.fn.refresh();
        });
        function setButtons(navigation) {
            var pageName = navigation.pageName, page = Page.get(pageName), buttons = page.buttons;
            backBtn.fn.hide();
            funcBtn.fn.hide();
            buttons && Object.each(buttons, function(item) {
                var type = item.type;
                switch (type) {
                  case "back":
                    backBtn.fn.setText(item.text);
                    backBtnHandler = item.handler;
                    if (item.autoHide === false || navigate.getStateIndex() >= 1) {
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
                item.onChange && item.onChange.call(backBtn);
            });
        }
        function setNavibar(navigation, isMove) {
            var pageName = navigation.pageName, transition = navigation.state.transition, page = Page.get(pageName), title = page.getTitle() || "";
            isMove ? navibar.fn.change(title, transition) : navibar.fn.set(title, transition);
        }
        function switchContent(navigation, callback) {
            if (app.config.enableTransition) {
                transition.fn[navigation.state.transition]();
                Component.once("forwardTransitionEnd backwardTransitionEnd", callback);
            } else {
                if (content) {
                    content.fn.switchActive();
                    content.fn.toggleClass();
                }
                callback();
            }
        }
        function switchNavigation(navigation) {
            if (app.navigation._cur) {
                app.navigation._cur.unload();
            }
            app.navigation._cur = navigation;
        }
        function loadNavigation(navigation) {
            navigation.load(function() {
                navigation.ready();
                if (app.config.enableNavibar) {
                    setNavibar(navigation, false);
                }
            });
        }
        navigate.on("forward backward", function(state) {
            var navigation = new Navigation(state);
            switchNavigation(navigation);
            switchContent(navigation, function() {
                loadNavigation(navigation);
            });
            if (app.config.enableNavibar) {
                setButtons(navigation);
                setNavibar(navigation, true);
            }
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
            router.start();
        }
    });
    win["app"] = app;
});

require("mix/sln/0.3.5/app-debug");