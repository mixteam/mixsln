define(function(require, exports, module) {

require('reset');

var win = window,
	doc = win.document,

	Class = require('class'),
	router = require('router').singleton,
	AppPage = require('page'),
	Navigation = require('cNavigation'),
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
	}
	;

	function initNavigation() {
		var curNav,
			xviewport = app.queryComponent('*[is="x-viewport"]'),
			xtitlebar = xviewport.xtitlebar,
			xtransition = xviewport.xtransition
			xback = xtitlebar.xback
			;

		function parseButtons(meta) {
			var buttons = []
				;

			Object.each(meta, function(item) {
				var type = item.type, button;

				switch (type) {
					case 'backStack':
						xback.setText(item.text);
						xback.autoHide(item.autoHide);
						break;
					case 'rightExtra':
						button = document.createElement('button');
						button.className = 'x-button';
						button.innerText = item.text;
						button.addEventListener('click', item.handler, false);
						buttons.push(button);
						break;
					default:
						break;
				}
			});

			return buttons;
		}

		function setTitlebar(navigation) {
			var appName = navigation.getAppName(),
				transition = navigation.getState().transition,
				page = app.getPage(appName),
				title = page.getTitle(),
				buttons = parseButtons(page.buttons)
				;

			xtitlebar.change({
				center: title,
				right: buttons
			}, transition);
		}

		function doTransition(navigation) {
			var transition = navigation.getState().transition;
			xtransition[transition]();
		}

		function switchNavigation(newNav) {
			if (curNav) {
				curNav.unload();
			}
			curNav = newNav;
			
			newNav.ready();
			newNav.compile();
		}

		function handler(state) {
			var navigation = new Navigation(state)
				;

			doTransition(navigation);
			switchNavigation(navigation);
			setTitlebar(navigation);
		}
			
		Navigation.listen(handler);
	}

	Object.extend(app, {
		init : function(properties) {
			var Page = AppPage.extend(properties),
				page = new Page({
					routePrefix : app.routePrefix,
					routePrefixSep : app.routePrefixSep
				});

			Navigation.addPage(page);
			return page;
		},

		getPage : function(name) {
			return Navigation.getPage(name);
		},

		getViewport : function() {
			return this.queryComponent('*[is="x-viewport"]').getViewport();
		},

		fillViewport : function(content) {
			var that = this,
				viewport = that.getViewport()
				;

			viewport.innerHTML = content;
		},

		getComponent : function(cid) {
			if (arguments[0] instanceof HTMLElement) {
				cid = arguments[0].getAttribute('cid');
			}

			return xBase.get(cid);
		},

		queryComponent : function(selector) {
			var el = doc.querySelector(selector)
				;
			
			return this.getComponent(el);
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
		},

		start : function() {
			xBase.parse();
			initNavigation();
			router.start();
		}
	});

	win['app'] = app;
});

require('mix/sln/0.1.0/app');