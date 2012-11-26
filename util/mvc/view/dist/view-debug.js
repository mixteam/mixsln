define("mix/core/util/mvc/view/0.1.0/view-debug", ["mix/core/base/reset/1.0.0/reset-debug", "mix/core/base/class/1.0.0/class-debug", "mix/core/base/message/1.0.0/message-debug", "mix/core/ui/template/0.2.0/template-debug", "mix/libs/handlebars/1.0.5/handlebars-debug", "mix/core/ui/component/0.2.0/component-debug", "mix/core/ui/module/0.1.0/module-debug", "mix/core/util/dom/selector/1.0.0/selector-debug", "mix/core/util/dom/event/1.0.0/event-debug", "mix/core/util/dom/ajax/1.0.0/ajax-debug"], function(require, exports, module) {

require('mix/core/base/reset/1.0.0/reset-debug');

var Class = require('mix/core/base/class/1.0.0/class-debug'),
	Message = require('mix/core/base/message/1.0.0/message-debug'),
	Template = require('mix/core/ui/template/0.2.0/template-debug'),
	Component = require('mix/core/ui/component/0.2.0/component-debug'),
	$ = require('mix/core/util/dom/selector/1.0.0/selector-debug'),

	atReg = Message.atReg
	;

require('mix/core/util/dom/event/1.0.0/event-debug');
require('mix/core/util/dom/ajax/1.0.0/ajax-debug');

var win = window
	doc = win.document,
	head = doc.getElementsByTagName('head')[0],
	undef = undefined,

	COMP_OPEN_REGEXP = /\<h5\:(\w\w*?)\s([^>]*?)\>/g,
	COMP_CLOSE_REGEXP = /\<\/h5\:(\w\w*?)\s*\>/g,
	COMP_SELF_CLOSE_REGEXP = /<component\s([^>]*?)\/>/g
	;

var View = Class.create({
	initialize : function(name, controller, viewport) {
		var that = this,
			loading = false,
			configs, events, routes, attach, data
			;

		// extend things
		configs = Object.extend({
			loadTmpl : false,
			loadStyle : false
		}, that.CONFIGS || {});

		events = Object.extend({
			'install' : 'install',		
			'render' : 'render',
			'parse' : 'parse',
			'update' : 'update',
			'suspend' : 'suspend',
			'active' : 'active',
			'destroy' : 'destroy'
		}, that.EVENTS || {});

		attrs = Object.extend({}, that.ATTRS || {});

		routes = Object.extend({}, that.ROUTES || {});

		attach = Object.extend({}, that.ATTACH || {});

		data = Object.extend({}, that.DATA || {});

		compdata = Object.extend({}, that.COMPDATA || {});

		helper = Object.extend({}, that.TMPL_HELPER || {});

		partial = Object.extend({}, that.TMPL_PARTIAL || {});

		// attrs
		that._name = name || configs.name;
		that._controller = controller || configs.controller;
		that._viewport = viewport || configs.viewport;
		that._src = {
			tmpl : configs.tmpl,
			style : configs.style,
			loadTmpl : configs.loadTmpl,
			loadStyle : configs.loadStyle
		}
		that._attrs = attrs;
		that._attach = attach;
		that._data = data;
		that._dataChanged = undef;
		that._compdata = compdata;
		that._components = {};
		that._templates = [];
		that._tmplHelper = helper;
		that._tmplPartial = partial;
		that._isInstalling = false;
		that._isCompiled = false;
		that._isReady = false;
		that._isActive = false;

		// bind events		
		that._bindEvents(events);
		// bind routes
		that._bindRoutes(routes);

		delete that.CONFIGS;
		delete that.EVENTS;
		delete that.ATTRS;
		delete that.ROUTES;
		delete that.ATTACH;
		delete that.DATA;
		delete that.COMPDATA;
		delete that.TMPL_HELPERS;
		delete that.TMPL_PARTIAL;
	},

	_bindEvents : function(events) {
		var that = this,
			len = 0
			;

		// bind events		
		Object.each(events, function(handlers, event) {
			if (!Object.isTypeof(handlers, 'Array')) {
				handlers = [handlers];
			}

			Object.each(handlers, function(handler) {
				if (Object.isTypeof(handler, 'string')) {
					handler = that[handler];
				}

				len++;
				that.on(event, handler);
			});
		});

		that.log('binded ' + len + ' events');
	},

	_bindRoutes : function(routes) {
		var that = this,
			len = 0
			;

		// bind routes		
		Object.each(routes, function(handlers, event) {
			if (!Object.isTypeof(handlers, 'Array')) {
				handlers = [handlers];
			}

			Object.each(handlers, function(handler) {
				len++;
				that._route(event, handler);
			});
		});

		that.log('binded ' + len + ' routes');
	},

	_route : function(name, handler) {
		var that = this
			;

		if (Object.isTypeof(handler, 'string')) {
			handler = that[handler];
		}

		handler && that.on('route:' + name, View.ready(handler));
	},


	_bindAttach : function() {
		var that = this,
			attach = that._attach,
			len = 0
			;

		Object.each(attach, function(events, selector) {
			Object.each(events, function(handler, name) {
				len++;
				that.attach(name, selector, handler);
			});
		});

		that.log('binded ' + len + ' attachs');
	},

	_unbindAttach : function() {
		var that = this
			;

		that.disattach();
	},

	install : function() {
		var that = this,
			src = that._src,
			viewport = that.getViewport(),
			needCheck = false
			;

		if (that._isInstalling || that._isReady) return;

		that._isInstalling = true;

		// load tmpl & style
		if (src.loadTmpl !== false) {
			needCheck = true;
			that._loadTmpl(src.loadTmpl);
		} else if (src.tmpl) {
			that._compileTmpl();
		}

		if (src.loadStyle !== false)  {
			needCheck = true;
			that._loadStyle(src.loadStyle);
		} else if (src.style) {
			that._compileStyle();
		}

		if (!needCheck) {
			that._compiled();
		} else {
			that._checkCompiled();
		}
	},

	_checkCompiled : function() {
		var that = this,
			src = that._src,
			viewport = that.getViewport(),
			id
			;

		viewport.addClass('compiling');

		id = setInterval(function() {
			var tmpl = src.tmpl,
				style = src.style,
				isCompiled = that._isCompiled
				;

			if (!isCompiled &&
					tmpl && tmpl instanceof Template &&
					style && style.nodeName && 
					style.nodeName.toLowerCase() == 'style') {
				clearInterval(id);
				viewport.removeClass('compiling');
				that._compiled();
			}
		}, 100);
	},

	_loadTmpl : function(url) {
		var that = this,
			src = that._src
			;

		$.get(url, function(text) {
			src.tmpl = text;
			that._compileTmpl();
		});
	},

	_loadStyle : function(url) {
		var that = this,
			src = that._src
			;

		$.get(url, function(text) {
			src.style = text;
			that._compileStyle();
		});
	},

	_replaceComponentTag : function(tmplStr) {
		var that = this
			;

		return tmplStr.replace(COMP_OPEN_REGEXP, '<component cid="$1" $2>')
					.replace(COMP_CLOSE_REGEXP, '</component>')
					.replace(COMP_SELF_CLOSE_REGEXP, '<component $1></component>');
	},

	_compileTmpl : function() {
		var that = this,
			name = that._name,
			components = that._components,
			templates = that._templates,
			src = that._src,
			tmpl = src.tmpl,
			tmplHelper = that._tmplHelper,
			tmplPartial = that._tmplPartial,
			tmplStr
			;

		if (Object.isTypeof(tmpl, 'string')) {
			tmplStr = that._replaceComponentTag(tmpl);
			tmpl = new Template('template-' + name);
			tmpl.addHelper(tmplHelper);
			tmpl.addPartial(tmplPartial);
			tmpl.compile(tmplStr);
			src.tmpl = tmpl;
		}

		templates.push(tmpl);
	},

	_compileStyle : function() {
		var that = this,
			name = that._name,
			src = that._src,
			style = src.style,
			cssText
			hasLess = !!win['less']
			;

		if (Object.isTypeof(style, 'string')) {
			cssText = style;
			style = doc.createElement('style');
			style.setAttribute('type', hasLess ? 'text/less' : 'text/css');
			style.setAttribute('rel', 'stylesheet');
			style.setAttribute('id', 'stylesheet-view-' +  name);
			style.innerHTML = cssText;
		}

		!style.parentNode && head.appendChild(style) ;
		hasLess && less.refresh(less.env === 'development');

		src.style = style;
	},

	_compiled : function() {
		var that = this
			;

		that._isInstalling = false;
		that._isCompiled = true;

		that._bindAttach();
		that.render();
		that.parse();
		that.ready('ready');
	},

	getName : function() {
		var that = this
			;

		return that._name;
	},

	getController : function() {
		var that = this
			;

		return that._controller;
	},

	getViewport : function() {
		var that = this,
			viewport = that._viewport,
			controller = that._controller
			;

		return $(viewport || '#' + controller.getViewport());
	},

	getAttr : function(name) {
		var that = this,
			attrs = that._attrs
			;

		return attrs[name];
	},

	setAttr : function(name, value) {
		var that = this,
			attrs = that._attrs,
			obj
			;

		if (arguments.length === 1 && Object.isTypeof((obj = name), 'object')) {
			Object.each(obj, function(value, name)  {
				that.setAttr(name, value);
			});
			return;
		}

		if (attrs.hasOwnProperty(name)) {
			attrs[name] = value;
		}
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

	_getData : function(data, path) {
		var that = this,
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

	_setData : function(data, path, value, slient) {
		var that = this,
			last, obj
			;


		if (Object.isTypeof((obj = path), 'object') && !(obj instanceof Array)) {
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
				dataChanged = that._dataChanged || (that._dataChanged = {});
				dataChanged[path.join('.')] = data[last];
			}
		}
	},

	getData : function(path) {
		var that = this
			;

		return that._getData(that._data, path);
	},

	setData : function(path, value, slient) {
		var that = this
			;

		that._setData(that._data, path, value, slient);
	},

	getCompData : function(path) {
		var that = this
			;

		return that._getData(that._compdata, path);
	},

	setCompData : function(path, value) {
		var that = this
			;

		if (arguments.length === 1) {
			return that._setData(that._compdata, path, true);
		} else {
			return that._setData(that._compdata, path, value, true);		
		}
	},

	getComponent : function(id) {
		var that = this,
			components = that._components
			;

		return components[id];
	},

	newComponent : function(CompClass, id, name, data) {
		var that = this,
			components = that._components,
			component
			;

		if (Object.isTypeof(CompClass, 'string')) {
			CompClass = Component.depos(CompClass);
		}

		if (arguments.length === 3) {
			data = name;
			name = null;
		}

		if (CompClass) {
			component = new CompClass(id, name, data);
			components[id] = component;
		}

		return component;
	},

	newTmpl : function(tmplStr, tmplHelper, tmplPartial) {
		var that = this,
			templates = that._templates,
			tmplHelper = Object.extend(that._tmplHelper, tmplHelper || {}),
			tmplPartial = Object.extend(that._tmplPartial, tmplPartial || {}),
			tmpl
			;

		if (tmplStr) {
			tmplStr = that._replaceComponentTag(tmplStr);
			tmpl = new Template('template-runtime-' + Date.now());
			tmpl.addHelper(tmplHelper);
			tmpl.addPartial(tmplPartial);
			tmpl.compile(tmplStr);

			templates.push(tmpl);
			return tmpl;
		}
	},

	render : function(data) {
		this.trigger('beforeRender');

		var that = this,
			data = data || that._data,
			src = that._src,
			tmpl = src.tmpl,
			viewport, fragment
			;

		viewport = that.getViewport();
		viewport.html(tmpl.all(data));

		that.log('renderd');	
	},

	parse : function(compdata) {
		this.trigger('beforeParse');

		var that = this,
			compdata = compdata || that._compdata,
			components = that._components,
			viewport = that.getViewport(),
			tags = viewport.find('component')
			;

		Object.each(tags, function(tag) {
			var el = $(tag),
				cid = el.attr('cid'),
				id = el.attr('id'),
				name = el.attr('name'),
				dataBind = el.attr('data-bind'),
				data = that._getData(compdata, dataBind),
				CompClass, component
				;

			CompClass = Component.depos(cid);

			if (CompClass) {
				component = new CompClass(id, name, data);
				component.render();
				components[id] = component;

				el.replaceWith(component.getDom());
			}
		});

		that.log('parsed');
	},

	update : function(path, chunkData) {
		this.trigger('beforeUpdate');

		var that = this,
			dataChanged = that._dataChanged,
			src = that._src,
			tmpl = src.tmpl
			;

		if (path && chunkData) {
			dataChanged = {};
			dataChanged[path] = chunkData;
		}

		if (dataChanged) {
			Object.each(dataChanged, function(data, path) {
				tmpl.update(path, data);
			});
		}

		delete that._dataChanged;

		that.log('updated');
	},

	active : function() {
		this.trigger('beforeActive');

		var that = this,
			data = data || that._data,
			src = that._src,
			tmpl = src.tmpl,
			viewport, fragment
			;

		viewport = that.getViewport();
		if (viewport.html() === '') {
			that._bindAttach();
			that.render();
			that.parse();
		}

		that.ready('actived');
	},

	suspend : function() {
		this.trigger('beforeSuspend');

		var that = this
			;

		that._isActive = false;
		that.trigger('suspended');
	},

	ready : function(state) {
		var that = this
			;

		that._isActive = true;
		that._isReady = true;
		that.trigger(state || 'ready');
	},

	destroy : function() {
		this.trigger('beforeDestroy');

		var that = this,
			src = that._src,
			style = src.style,
			components = that._components,
			templates = that._templates
			;

		that._unbindAttach();

		style && head.removeChild(style);

		templates && Object.each(templates, function(tmpl) {
			tmpl.destroy();
		});

		components && Object.each(components, function(component) {
			component.destroy();
		});

		delete that._compdata;
		delete that._data;
		delete that._attach;
		delete that._src;
		delete that._components;

		that.trigger('destroyed');
	},

	attach : function(name, selector, handler) {
		var that = this,
			viewport = that.getViewport(),
			argLen = arguments.length,
			callback
			;

		if (Object.isTypeof(handler, 'string')) {
			handler = that[handler];
		}

		callback = function(e) {
			handler.call(this, e, that);
		}

		if (handler) {
			if (argLen === 3) {
				viewport.on(name, selector, callback);
			} else if (argLen === 2) {
				handler = selector;
				viewport.on(name, callback);
			}
		}
	},

	disattach : function(name, selector, handler) {
		var that = this,
			viewport = that.getViewport(),
			argLen = arguments.length
			;

		if (handler) {
			if (argLen === 3) {
				if (Object.isTypeof(handler, 'string')) {
					handler = that[handler];
				}
				viewport.off(name, selector, handler);
			} else if (argLen === 2) {
				if (Object.isTypeof(selector, 'string')) {
					selector = that[selector] || selector;
				}
				viewport.off(name, selector);
			} else if (argLen === 1) {
				viewport.off(name);
			} else if (argLen === 0) {
				viewport.off();
			}
		}
	},

	has : function(event, callback) {
		var that = this,
			name = that._name,
			controller = that._controller
			;

		controller.has('@' + name + ':' + event, callback, that);

		return that;
	},

	once : function(event, callback) {
		var that = this,
			name = that._name,
			controller = that._controller
			;

		controller.once('@' + name + ':' + event, callback, that);

		return that;
	},

	on : function(event, callback) {
		var that = this,
			name = that._name,
			controller = that._controller
			;

		controller.on('@' + name + ':' + event, callback, that);

		return that;
	},

	off : function(event, callback) {
		var that = this,
			name = that._name,
			controller = that._controller
			;

		controller.off('@' + name + ':' + event, callback, that);

		return that;
	},

	trigger : function(events) {
		var that = this,
			name = that._name,
			controller = that.getController(),
			args = Array.make(arguments)
			;

		if (!atReg.test(events)) {
			args[0] = '@' + name + ':' + args[0];
		}

		controller.trigger.apply(controller, args);
	},

	log : function(msg) {
		var that = this,
			name = that._name,
			controller = that._controller
			;

		controller.log('@' + name + ':' + msg);

		return that;
	}
});

View.ready = function(handler) {
	return function readyHandler() {
		var context = this,
			isReady = context._isReady,
			args = arguments
			;

		if (!isReady) {
			context.once('ready', function() {
				handler.apply(context, args);
			});
		} else {
			handler.apply(context, args);
		}
	}
}

module.exports = View;

});