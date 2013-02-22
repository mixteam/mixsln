define(function(require, exports, module) {

require('reset');
var win = window,
	doc = win.document,
	Class = require('class'),
	components = {},

	xBase = Class.create({
		initialize : function(name, module) {
			var that = this
				;

			that._name = name;
			that._module = module;
			that._isEnable = false;
		},

		getModule : function() {
			return this._module;
		},

		enable : function() {	// overwrite
			var that = this,
				module = that._module
				;

			if (module && !that._isEnabled) {
				that._isEnabled = true;
				return true;
			}
		},

		disable : function() {	// overwrite
			var that = this,
				module = that._module
				;

			if (module && that._isEnabled) {
				that._isEnabled = false;
				return true;
			}
		}
	});
	;

function createXComponent(xName, className, properties) {

	var _init, _extends, _implements, _enable, _disable, extentions, xComponent, component;

	if (arguments.length === 2) {
		properties = className;
		className = xName;
	}

	if (properties.hasOwnProperty('Implements')) {
		_implements = properties.Implements;
		delete properties.Implments;
	}

	if (properties.hasOwnProperty('init')) {
		_init = properties.init;
		delete properties.init;
	}

	if (properties.hasOwnProperty('enable')) {
		_enable = properties.enable;
		delete properties.enable;
	}

	if (properties.hasOwnProperty('disable')) {
		_disable = properties.disable;
		delete properties.disable;
	}

	extentions = Object.extend({
		Extends : xBase,
		Implements : _implements,

		initialize : function(module) {
			var that = this
				;

			xComponent.superclass.initialize.call(that, xName, module);
			_init && _init.call(that);
		}
	}, properties);

	if (_enable) {
		extentions.enable = function() {
			var is;

			if (xComponent.superclass.enable.call(this)) {
				is = _enable.call(this);
				(is == null) || (is = true);
			}

			return is
		}
	}

	if (_disable) {
		extentions.disable = function() {
			var is;

			if (xComponent.superclass.disable.call(this)) {
				is = _disable.call(this);
				(is == null) || (is = true);
			}

			return is;
		}
	}

	xComponent = Class.create(extentions);

	component = components[xName] = {
		name : xName,
		klass : xComponent,
		count : 0,
		instances : [],
		map : {}
	}

	xComponent.create = function(el) {
		var cid = xName + '-' + Date.now() + '-' + (component.count + 1),
			instances = component.instances,
			map = component.map,
			instance
			;

		el.setAttribute('cid', cid);
		el.className += (el.className?' ':'') + className;

		instance = new xComponent(el);

		instances.push(instance);
		map[cid] = instances.length - 1;

		return instance;
	}

	return xComponent;
}

function getXComponent(cid) {
	var name, component, matched;

	if ((matched = cid.match(/^(x-[^-]+)/))) {
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
		var elements = doc.querySelectorAll('*[is="' + name + '"]')
			;

		Object.each(elements, function(el) {
			if (!el.getAttribute('cid')) {
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