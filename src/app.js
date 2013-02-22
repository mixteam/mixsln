define(function(require, exports, module) {

require('reset');

var win = window,
	doc = win.document,

	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,
	Gesture = require('gesture'),
	Scroll = require('scroll'),
	AppPage = require('page'),
	xBase = require('xBase'),
	xBack = require('xBack'),
	xScroll = require('xScroll'),
	xTransition = require('xTransition'),
	xTitlebar = require('xTitlebar'),
	xViewport = require('xViewport'),

	app = {
		theme : 'ios',
		routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
		routePrefixSep : '\/'
	},
	pages = {}
	;

	function initNavigateController() {
		var curApp = null,
			xviewport = app.queryComponent('*[is="x-viewport"]'),
			xtitlebar = xviewport.xtitlebar,
			xtransition = xviewport.xtransition
			xback = xtitlebar.xback
			;

		function switchAppPage(appName, state) {
			var lastPage = pages[curApp],
				curPage = pages[appName]
				;

			curApp = appName;
			lastPage && lastPage.trigger('unload');
			curPage && curPage.trigger('ready', state);
		}

		function parseButtons(page) {
			var buttons = []
				;

			Object.each(page.header.buttons, function(button) {
				if (button.type === 'backStack') {
					xback.setText(button.text);
					xback.autoHide(button.autoHide);
				} else if (button.type === 'rightExtra') {
					var el = document.createElement('button')
						;

					el.className = 'x-button';
					el.innerText = button.text;
					el.addEventListener('click', button.handler, false);
					buttons.push(el);
				}
			});

			return buttons;

		}

		function setTitlebar(appName, state) {
			var lastPage = pages[curApp],
				curPage = pages[appName],
				buttons = parseButtons(curPage)
				;

			if (!lastPage) {
				xtitlebar.set({
					center: curPage.getTitle(),
					right: buttons
				});
			} else {
				xtitlebar.change({
					center: curPage.getTitle(),
					right: buttons
				}, state.transition);
			}
		}

		function doTransition(appName, state) {
			xtransition.once(state.transition + 'TransitionEnd', function() {
				switchAppPage(appName, state);
			});
			xtransition[state.transition]();
		}

		function handler(state) {
			var appName = state.name.split('.')[0]
				;

			if (curApp !== appName) {

				setTitlebar(appName, state);

				if (xtransition) {
					doTransition(appName, state);
				} else {
					switchAppPage(appName, state);
				}
			}
		}
			
		navigate.on('forward backward', handler);
	}

	Object.extend(app, {
		init : function(properties) {
			var that = this,
				name = properties.name;

			var Page = AppPage.extend(properties),
				page = new Page({
					routePrefix : app.routePrefix,
					routePrefixSep : app.routePrefixSep
				});

			return (pages[name] = page);
		},

		getPage : function(name) {
			return pages[name];
		},

		getViewport : function() {
			return this.queryComponent('*[is="x-viewport"]').getViewport();
		},

		getComponent : function(cid) {
			if (arguments[0] instanceof HTMLElement) {
				cid = arguments[0].getAttribute('cid');
			}

			return xBase.get(cid);
		},

		queryComponent : function(selector) {
			var el = doc.querySelector(selector),
				cid = el.getAttribute('cid')
				;

			if (cid) {
				return xBase.get(cid);
			}
		},

		start : function() {
			xBase.parse();
			initNavigateController();
			router.start();
		},

		forward : function() {
			navigate.forward();
		},

		backward : function() {
			navigate.backward();
		},

		navigate : function(fragment, options) {
			navigate.forward(fragment, options);
		}
	});

	win['app'] = app;
});

require('mix/sln/0.1.0/app');