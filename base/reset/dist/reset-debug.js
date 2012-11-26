define("mix/core/base/reset/1.0.0/reset-debug", [], function(require, exports, module) {

var undef,
    toString = Object.prototype.toString
    ;
//
// Object
//
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

if (!Object.each) {
    Object.each = function(object, callback) {
        if (object == null) return;
        
        if (object instanceof Array || 
                object.hasOwnProperty('length')) {

            Array.prototype.forEach.call(object, callback);

        } else if (typeof object == 'object') {
            for (var name in object) {
                if (object.hasOwnProperty(name)) {
                    callback(object[name], name, object);
                }
            }
        }
    }
}

if (!Object.clone) {
    Object.clone = function(value, deeply) {

        if (value instanceof Array) {
            if (deeply) {
                var arr = [];

                Object.each(value, function(v) {
                    arr.push(Object.clone(v, deeply));
                });
                return arr;
            } else {
                return value.slice();
            }
        } else if (typeof value === 'object') {
            return Object.extend({}, value, deeply);
        } else {
            return value;
        }
    }
}

if (!Object.extend) {
    Object.extend = function(src, target, deeply) {
        var args = Array.make(arguments),
            src = args.shift()
            ;

        deeply = (typeof args[args.length - 1] == 'boolean' ? args.pop() : undef);

        Object.each(args, function(t) {
            Object.each(t, function(value, name) {
                src[name] = Object.clone(value, deeply);
            });
        });

        return src;
    }
}

if (!Object.isTypeof) {
    var TYPE_REGEXP = /^\[object\s\s*(\w\w*)\s*\]$/i
    Object.isTypeof = function(obj, istype) {
        var str = toString.call(obj).toLowerCase(),
            type = TYPE_REGEXP.exec(str)
            ;

        if (!type) return;

        if (istype) {
            return type[1].toLowerCase() === istype.toLowerCase();
        } else {
            return type[1].toLowerCase();
        }
    };
}

//
// Array
//
if (!Array.make) {
    Array.make = function(object) {
        if (object.hasOwnProperty('length')) {
            return Array.prototype.slice.call(object);
        }
    }
}

if (!Array.eq) {
    Array.eq = function(a1, a2) {
        if (a1.length == a2.length) {
            a1.forEach(function(e, i) {
                if (e !== a2[i]) {
                    return false;
                }
            });
            return true;
        } else {
            return false;
        }
    }
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        var res = new Array(len);
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}

if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++) {
            if (block.call(thisp, this[i])) {
                values.push(this[i]);
            }
        }
        return values;
    };
}

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        var i = 0;

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1) throw new TypeError();

        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                // if array contains no values, no initial value to return
                if (++i >= len) throw new TypeError();
            } while (true);
        }
        for (; i < len; i++) {
            if (i in this) {
                rv = fun.call(null, rv, this[i], i, this);
            }
        }
        return rv;
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        var i = arguments[1] || 0;

        if (!length)     return -1;
        if (i >= length) return -1;
        if (i < 0)       i += length;

        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i)) { continue }
            if (value === this[i]) return i;
        }
        return -1;
    };
}

//
// String
//
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

//
// Function
//
if (!Function.binded) {
    var ctor = function(){},
        slice = Array.prototype.slice;

    Function.binded = function(func, context) {
        var protoBind = Function.prototype.bind,
            args = Array.make(arguments),
            _args, bound
            ;

        if (func.bind === protoBind && protoBind) 
            return protoBind.apply(func, slice.call(arguments, 1));

        if (!Object.isTypeof(func, 'function')) throw new TypeError;

        _args = args.slice(2);

        return bound = function() {
            if (!(this instanceof bound)) 
                return func.apply(context, _args.concat(args));

            ctor.prototype = func.prototype;
            var self = new ctor;
            var result = func.apply(self, _args.concat(args));

            if (Object(result) === result) 
                return result;
            
            return self;
        };
    }
}

});
