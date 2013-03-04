define(function(require, exports, module) {

require('reset');
var win = window,
	doc = win.document,

	Class = require('class'),
	navigate = require('navigate').singleton,
	util = require('util').singleton,
	xBase = require('./xBase'),
	xTitlebar = require('./xTitlebar'),
	xScroll = require('./xScroll'),
	xTransition = require('./xTransition'),

	xName = 'x-viewport',
	className = xName,
	xViewport = xBase.create(xName, className, {
		init : function() {
			var that = this,
				module = that._module,
				header, section, footer, subport
				;

			that._isEnableTitlebar = false;
			that._isEnableScroll = false;
			that._isEnableTransition = false;

			header = doc.createElement('header');
			section = doc.createElement('section');
			footer = doc.createElement('footer');
			subport = doc.createElement('div');

			section.appendChild(subport);
			module.appendChild(header);
			module.appendChild(section);
			module.appendChild(footer);

			that.xtitlebar = xTitlebar.create(header);
			that.xscroll = xScroll.create(section);
			that.xtransition = xTransition.create(section);
		},

		enable : function() {
			var that = this,
				module = that._module
				;

			that._isEnableTitlebar = util.str2val(module.getAttribute('enableTitlebar'));
			that._isEnableScroll = util.str2val(module.getAttribute('enableScroll'));
			that._isEnableTransition = util.str2val(module.getAttribute('enableTransition'));

			if (that._isEnableTitlebar) {
				module.className += ' enableTitlebar';
				that.xtitlebar.enable();
			}

			if (that._isEnableScroll) {
				module.className += ' enableScroll';
				that.xscroll.enable();
			}

			if (that._isEnableTransition) {
				module.className += ' enableTransition';
				that.xtransition.enable();
			}
		},

		disable : function() {
			var that = this,
				xtitlebar = that.xtitlebar,
				xscroll = that.xscroll,
				xtransition = that.xtransition,
				isEnableTitlebar = that._isEnableTitlebar
				isEnableScroll = that._isEnableScroll
				isEnableTransition = that._isEnableTransition
				;

			if (isEnableTitlebar) {
				module.className = module.className.replace('enableTitlebar', '');
				that.xtitlebar.disable();
			}

			if (isEnableScroll) {
				module.className = module.className.replace('enableScroll', '');
				that.xscroll.disable();
			}

			if (isEnableTransition) {
				module.className = module.className.replace('enableTransition', '');
				that.xtransition.disable();
			}

			module.className = module.className.replace(/\s{2,}/, '');
		},

		getViewport : function() {
			var that = this,
				module = that._module
				;

			//if (that._isEnableTransition) {
				return that.xtransition.getViewport();
			//} else if (that._isEnableScroll) {
				//return that.xscroll.getViewport();
			//} else {
				//return module.querySelector('section > div');
			//}
		}
	});

	return xViewport;
});