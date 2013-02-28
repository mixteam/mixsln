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

			module.appendChild(header);
			module.appendChild(section);
			module.appendChild(footer);
		},

		enable : function() {
			var that = this,
				module = that._module,
				header = module.querySelector('header'),
				sectionport = module.querySelector('section')
				;

				that._isEnableTitlebar = util.str2val(module.getAttribute('enableTitlebar'));
				that._isEnableScroll = util.str2val(module.getAttribute('enableScroll'));
				that._isEnableTransition = util.str2val(module.getAttribute('enableTransition'));
				;

			if (that._isEnableTitlebar) {
				module.className += ' enableTitlebar';
				that.xtitlebar = xTitlebar.create(header);
				that.xtitlebar.enable();
			}

			if (that._isEnableScroll) {
				module.className += ' enableScroll';
				that.xscroll = xScroll.create(sectionport);
				that.xscroll.enable();
			}

			if (that._isEnableTransition) {
				module.className += ' enableTransition';
				that.xtransition = xTransition.create(sectionport);
				that.xtransition.enable();
			}
		},

		disable : function() {
			var that = this,
				xscroll = that.xscroll,
				xtransition = that.xtransition
				;

			xscroll && xscroll.disable();
			xtransition && xtransition.disable();
		},

		getViewport : function() {
			var that = this,
				module = that._module
				;

			if (that._isEnableTransition) {
				return that.xtransition.getViewport();
			} else if (that._isEnableScroll) {
				return that.xscroll.getViewport();
			} else {
				return module.querySelector('section > div');
			}
		}
	});

	return xViewport;
});