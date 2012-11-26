define(function(require, exports, module) {

require('reset');

var Class = require('class'),
	Message = require('message'),
	$ = require('selector');

require('event');

var win = window,
	doc = win.document,
	undef = undefined,

	OPTIONS = {
		debug : true
	},

	DEPOS = {}
	;

/**
 * @class module
 */
var Module = Class.create({
	/**
	 * the constructor for Module
	 * @constructor
	 * @param {string} the name of module
	 */
	initialize : function(name, type) {
		var that = this
			;

		that.__name = name;	
		that.__type = type;
		that.__evObj = new Message(type + '.' + name);
		that.__domObj = undef;
	},

	_initOptions : function(options) {
		var that = this
			;

		that.__options = Object.extend({}, OPTIONS, options);
	},

	_initAttrs : function(attrs) {
		var that = this,
			constructor = that.constructor
			;

		Object.each(attrs, function(value, name) {
			that['_' + name] = Object.clone(value, true);
		});
	},

	_initEvents : function(events) {
		var that = this
			;

		that.__events = [].concat(events);
	},

	_initAttach : function(attach) {
		var that = this
			;

		that.__attach = Object.extend({}, attach);
	},

	/**
	 * the name of the component
	 * @return {*}
	 */
	getName : function() {
		var that = this
			;

		return that.__name;
	},

	/**
	 * the option of the module
	 * @return {*}
	 */
	getOpt : function(name) {
		var that = this
			;

		return that.__options[name];
	},

	/**
	 * set the option of the module
	 * @param {string|object} name
	 * @param {*=} value
	 */
	setOpt : function(name, value) {
		var that = this,
			options = that.__options,
			opt
			;

		if (arguments.length === 1 && 
				Object.isTypeof((opt = name), 'object')) {
			Object.extend(options, opt || {});
		} else {
			options[name] = value;		
		}
	},

	/**
	 * the dom of the module
	 * @return {dom}
	 */
	getDom : function() {
		var that = this
			;

		if (that.__domObj) {
			return that.__domObj;	
		}
	},


	/**
	 * the zepto $
	 * @return {object}
	 */
	getDollars : function() {
		return $;
	},

	_attach : function(element) {
		var that = this,
			attach = that.__attach,
			evObj = that.__evObj
			;

		Object.each(attach, function(events, selector) {

			Object.each(events, function(handler, name) {
				var objType = Object.isTypeof(handler),
					callback;

				if (objType == 'string') {
					callback = function(e) {
						evObj.trigger(handler, e, that);
					}
				} else if (objType == 'function') {
					callback = function(e) {
						handler.call(this, e, that);
					}	
				}
				
				if (selector === '&') {
					element.on(name, callback);
				} else {
					element.on(name, selector, callback);
				}
			});
		});
	},

	_disattach : function(element) {
		var that = this,
			attach = that.__attach
			;

		/*
		Object.each(attach, function(events, selector) {
			Object.each(events, function(handler, name) {
				element.off(name);
			});
		});
		*/
		element.off();
	},

	/**
	 * render the module
	 */
	render : function(selector) {
		var that = this,
			dom
			;

		if (selector) {
			dom = that.__domObj = 
				$(Object.isTypeof(selector, 'string') ? 
					doc.querySelector(selector) :
					selector);
			that._attach(dom);
		}
	},

	/**
	 * destroy the module
	 */
	destroy : function() {
		var that = this,
			dom = that.__domObj
			;


		dom && that._disattach(dom);

		delete that.__options;
		delete that.__evObj;
		delete that.__domObj;
		delete that.__attach;
		delete that.__events;
	},

	/**
	 * find the element in the module
	 * @param {string} selector
     * @return {dom} 
	 */
	find : function(selector) {
		var that = this
			;

		if (that.__domObj) {
			return that.__domObj.find(selector);
		} else {
			throw new Error('call "render" before "find"');
		}
	},

	/**
	 * bind event 
	 * @param {string} eventName
     * @param {Function} delegate
	 */
	on : function(eventName, delegate) {
		var that = this
			;

		if (that.__evObj && that.__events.indexOf(eventName) > -1) {
			that.__evObj.on(eventName, delegate);
		} else {
			throw new Error('"' + eventName + '" is illegal');
		}

		return that;
	},

	/**
	 * unbind event 
	 * @param {string} eventName
     * @param {Function=} delegate
	 */
	off : function(eventName, delegate) {
		var that = this
			;

		if (that.__evObj && that.__events.indexOf(eventName) > -1) {
			delegate ? that.__evObj.off(eventName, delegate) : that.__evObj.off(eventName);
		} else {
			throw new Error('"' + eventName + '" is illegal');
		}

		return that;
	},

	/**
	 * trigger event 
	 * @param {string} eventName
	 */
	trigger : function(eventName) {
		var that = this
			;

		if (that.__evObj && that.__events.indexOf(eventName) > -1) {
			that.__evObj.trigger.apply(that.__evObj, arguments);
		} else {
			throw new Error('"' + eventName + '" is illegal');
		}

		return that;
	}

});

/**
 * register a module
 * @param {string} the name of the module
 * @param {object} the options for the module
 */
Module.register = function(name, module) {
	if (DEPOS[name]) return;

	var child = Module.extend({
		initialize : function() {
			var that = this
				;

			child.superclass.initialize.call(that, name, 'module');

			that._initOptions(module.OPTIONS || {});
			that._initAttrs(module.ATTRS || {});
			that._initEvents(module.EVENTS || []);
			that._initAttach(module.ATTACH || {});

			module.CONSTRUCTOR.apply(that, arguments);
		}

	});

	child.implement(module.METHOD);

	Object.extend(child, module.CONST || {});

	return (DEPOS[name] = child);
}

Module.depos = function(name) {
	if (!DEPOS[name]) throw new Error('Module "' + name + '" has not defined');

	return DEPOS[name];
}

/**
 * set the global options
 * @param {object} options
 */
Module.options = function(options) {
	OPTIONS = Object.extend(OPTIONS, options);
}

module.exports = Module;

});