(function(win, app, undef) {
	
var toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    slice = Array.prototype.slice,
    forEach = Array.prototype.forEach,
    ctor = function(){},
    TYPE_REGEXP = /^\[object\s\s*(\w\w*)\s*\]$/,

	util = {
		isTypeof: function(value, istype) {
	        var str = toString.call(value).toLowerCase(),
	            matched = TYPE_REGEXP.exec(str),
	            type
	            ;

	        if (!matched) return;

	        type = matched[1];

	        if (istype) {
	            return type === istype.toLowerCase();
	        } else {
	            return type;
	        }
	    },

		each: function(object, callback, context) {
	        if (object == null) return;
	        
	        if (hasOwnProperty.call(object, 'length')) {
	            forEach.call(object, callback, context);
	        } else if (typeof object === 'object') {
	            for (var name in object) {
	                if (hasOwnProperty.call(object, name)) {
	                    callback.call(context, object[name], name, object);
	                }
	            }
	        }
	    },

	    extend: function(src, target) {
	        var args = util.makeArray(arguments),
	            src = args.shift()
	            ;

	        util.each(args, function(target) {
	            util.each(target, function(value, name) {
	                src[name] = value;
	            });
	        });

	        return src;
	    },

	    makeArray: function(object) {
	        if (hasOwnProperty.call(object, 'length')) {
	            return slice.call(object);
	        }
	    },

	    bindContext: function(func, context) {
	        var args = util.makeArray(arguments),
	            bound
	            ;

	        if (!util.isTypeof(func, 'function')) throw new TypeError;

	        args = args.slice(2);

	        return bound = function() {
	            var _args = util.makeArray(arguments), self, result
	                ;

	            if (!(this instanceof bound)) 
	                return func.apply(context, args.concat(_args));

	            ctor.prototype = func.prototype;
	            self = new ctor;
	            result = func.apply(self, args.concat(_args));

	            if (Object(result) === result) 
	                return result;
	            
	            return self;
	        };
	    },

	    inherit: function(child, parent) {
			function Ctor() {}
			Ctor.prototype = parent.prototype;
			var proto = new Ctor();
			util.extend(proto, child.prototype);
			proto.constructor = child;
			child.prototype = proto;
	    },

	    mix: function(src, target, context) {
		    util.each(target, function(func, name) {
		    	if (!util.isTypeof(func, 'function')) return;

		    	if (context) {
		        	src[name] = function() {
		            	func.apply(context, arguments);
		        	}
		    	} else {
		    		src[name] = func;
		    	}
		    });
	    },

		loadFile : function(url, callback) {
			var xhr = new win.XMLHttpRequest()
				;

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4 &&
						((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) {
					callback(xhr.responseText);
				}
			}
			xhr.open('GET', url, true);
			xhr.send();
		}
	}
	;

app.util = app._module.util = util;

})(window, window['app']||(window['app']={_module:{},plugin:{}}));