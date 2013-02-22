define(function(require, exports, module) {

require('reset');
var Class = require('class'),
	util = require('util').singleton,
	navigate = require('navigate').singleton,
	xBase = require('xBase'),

	xName = 'x-back',
	className = 'x-button ' + xName,
	xBack = xBase.create(xName, className, {
		init : function() {
			var that = this
				;

			that._isAutoHide = false;
			that._changeVisibility = that._changeVisibility.bind(that);
			that._clickHandler = that._clickHandler.bind(that);
		},

		enable : function() {
			var that = this,
				module = that._module,
				isAutoHide = util.str2val(module.getAttribute('autoHide'))
				;

			module.addEventListener('click', that._clickHandler, false);
			that.autoHide(isAutoHide);
		},

		disable : function() {
			var that = this,
				module = that._module
				;

			module.removeEventListener('click', that._clickHandler, false);
			that.autoHide(false);
		},

		autoHide : function(is) {
			var that = this,
				module = that._module
				;

			if (is === null) {
				
			}

			if (module && that._isAutoHide !== is) {
				is ? navigate.on('forward backward', that._changeVisibility) :
						navigate.off('forward backward', that._changeVisibility);
				that._isAutoHide = is;
				that._changeVisibility();
			}
		},

		setText : function(text) {
			var that = this,
				module = that._module
				;

			module.innerText = text;
		},

		_clickHandler : function(e) {
			navigate.backward();
			e.preventDefault();
			return false;
		},

		_changeVisibility : function() {
			var that = this,
				module = that._module,
				isEnabled = that._isEnabled,
				visibility = navigate.getStateIndex() < 1 && isEnabled ? 'hidden' : ''
				;

			if (module.style.visibility !== visibility) {
				module.style.visibility = visibility;
			}
		}
	});

	return xBack;
});