define("mix/core/ui/component/0.2.0/component-debug", ["mix/core/base/reset/1.0.0/reset-debug", "mix/core/base/class/1.0.0/class-debug", "mix/core/base/message/1.0.0/message-debug", "mix/core/ui/template/0.2.0/template-debug", "mix/libs/handlebars/1.0.5/handlebars-debug", "mix/core/ui/module/0.1.0/module-debug", "mix/core/util/dom/selector/1.0.0/selector-debug", "mix/core/util/dom/event/1.0.0/event-debug"], function(require, exports, module) {

require('mix/core/base/reset/1.0.0/reset-debug');

var Class = require('mix/core/base/class/1.0.0/class-debug'),
	Message = require('mix/core/base/message/1.0.0/message-debug'),
	Template = require('mix/core/ui/template/0.2.0/template-debug'),
	Module = require('mix/core/ui/module/0.1.0/module-debug'),
	$ = require('mix/core/util/dom/selector/1.0.0/selector-debug')
	;

var win = window,
	doc = win.document,
	head = doc.getElementsByTagName('head')[0],
	undef = undefined,

	OPTIONS = {
		debug : true
	},

	DEPOS = {}
	;

/**
 * @class component
 */
var Component = Module.extend({
	/**
	 * the constructor for Component
	 * @constructor
	 * @param {string} the name of component
	 */
	initialize : function(name, type) {
		var that = this
			;

		Component.superclass.initialize.call(that, name, type);
		that.__dataChanged = undef;
	},

	_initData : function(data) {
		var that = this
			;

		that.__data = Object.extend({}, data, true);
	},

	_initTemplate : function(tmplText, tmplHelper, tmplPartial) {
		var that = this,
			tmpl
			;

		tmpl = that.__tmpl = new Template(that.__name, 'component');
		tmplHelper && tmpl.addHelper(tmplHelper);
		tmplPartial && tmpl.addPartial(tmplPartial);
		that.__tmpl.compile(tmplText);
	},

	_findDataPath : function(data, path) {
		Object.each(path, function(name) {
			if (data.hasOwnProperty(name)) {
				data = data[name];
			} else {
				return undef;
			}
		});

		return data;
	},

	/**
	 * the data of the component
	 * @return {*}
	 */
	getData : function(path) {
		var that = this,
			data = that.__data,
			last
			;

		if (typeof path == 'string') {
			path = path.split('.');
		}

		last = path.pop();

		data = that._findDataPath(data, path);

		if (data) {
			return data[last];
		}
	},

	/**
	 * set data of the component
	 * @param {string|Array} path
     * @param {*} value
	 */
	setData : function(path, value, slient) {
		var that = this,
			data = that.__data,
			dataChanged, last,
			obj
			;

		if (Object.isTypeof((obj = path), 'object') &&!(obj instanceof Array)) {
			slient = value;
			Object.each(obj, function(value, path) {
				that.setData(path, value, slient);
			});
			return;
		}

		if (value == undef) return;

		if (typeof path == 'string') {
			path = path.split('.');
		}

		last = path.pop();

		data = that._findDataPath(data, path);

		if (data) {
			data[last] = Object.clone(value, true);

			if (!slient) {
				path.push(last);
				dataChanged = that.__dataChanged || (that.__dataChanged = {});
				dataChanged[path.join('.')] = data[last];
			}
		}
	},

	/**
	 * render the component
	 * @param {Object=} data
	 */
	render : function(data) {
		var that = this,
			data = data || that.__data,
			tmpl = that.__tmpl, dom,
			id, name
			;

		tmpl.all(data);
		dom = that.__domObj = $(tmpl._nodeList);

		id = that.__domId = 
			that.__domId || 
			dom.attr('id') || 
			that.__name + '-' + new Date().getTime();

		name = that.__domName = 
			that.__domName || 
			dom.attr('name') || 
			that.__name;

		dom.attr('id', id);
		dom.attr('name', name);

		Component.superclass.render.call(that, dom);

		return dom;
	},

	/**
	 * update the component
	 * @param {string=} path
	 * @param {Object=} data
	 */
	update : function(path, data) {
		var that = this,
			dataChanged = that.__dataChanged,
			tmpl = that.__tmpl,
			dom = that.__domObj
			;

		if (path && data) {
			dataChanged = {};
			dataChanged[path] = data;
		}

		that._disattach(dom);

		if (dataChanged) {
			Object.each(dataChanged, function(data, path) {
				tmpl.update(path, data);
			});
		} else {
			tmpl.update('', that.__data);
		}

		dom = that.__domObj = $(tmpl._nodeList);
		dom.attr('id', that.__domId);
		dom.attr('name', that.__domName);
		
		that._attach(dom);

		delete that.__dataChanged;
	},

	/**
	 * destroy the component
	 */
	destroy : function() {
		var that = this,
			tmpl = that.__tmpl,
			dom = that.getDom()
			;

		dom.remove();
		tmpl.destroy();

		Component.superclass.destroy.call(that);
		delete that.__data;
		delete that.__dataChanged;
	}
});

function addStylesheet(name, css) {
	var styleTag = doc.createElement('style')
		;

	styleTag.setAttribute('type', 'text/css');
	styleTag.setAttribute('rel', 'stylesheet');
	styleTag.setAttribute('id', 'stylesheet-component-' +  name);
	styleTag.innerText = css;
	head.appendChild(styleTag);	
}

function removeStylesheet(name) {
	var id = 'stylesheet-component-' +  name,
		styleTag = doc.getElemenetById(id)
		;

	head.removeChild(styleTag);
}

/**
 * register a component
 * @param {string} the name of the component
 * @param {object} the options for the component
 * @param {string} the template for the component
 * @param {string=} the css style for the component
 */
Component.register = function(name, component, tmpl, css) {
	if (DEPOS[name]) return;

	addStylesheet(name, css);

	var child = Component.extend({
		initialize : function(domId, domName, data, options) {
			var that = this
				;

			child.superclass.initialize.call(that, name, 'component');

			that.__domId = domId;
			that.__domName = domName;
			that._initOptions(component.OPTIONS || {});
			that._initAttrs(component.ATTRS || {});
			that._initData(component.DATA || {});
			that._initEvents(component.EVENTS || []);
			that._initAttach(component.ATTACH || {});
			that._initTemplate(tmpl, component.TMPL_HELPER, component.TMPL_PARTIAL);

			component.CONSTRUCTOR.call(that, data, options);
		}

	});

	child.implement(component.METHOD);

	Object.extend(child, component.CONST || {});

	return (DEPOS[name] = child);
}

Component.depos = function(name) {
	if (!DEPOS[name]) throw new Error('Component "' + name + '" has not defined');

	return DEPOS[name];
}

/**
 * set the global options
 * @param {object} options
 */
Component.options = function(options) {
	OPTIONS = Object.extend(OPTIONS, options);
}

module.exports = Component;

});