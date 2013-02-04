define(function(require, exports, module) {
var win = window,
	doc = win.document,

	reset = require('reset'),
	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,
	gesture = require('./modules/gesture'),
	scroll = require('./modules/scroll'),
	AppPage = require('./modules/page'),
	app = {
		theme : 'ios',
		routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
		routePrefixSep : '\/'
	}
	;

	function initXback() {
		var backsEl = doc.querySelector('*[is="x-back"]')
			;

		backsEl.style.visibility = 'hidden';
		backsEl.addEventListener('click', function(e) {
			navigate.backward();
			e.preventDefault();
			return false;
		});

		navigate.on('forward backward', function(state) {
			var visibility = ''
				;

			if (navigate.getStateIndex() < 1) {
				visibility = 'hidden';
			}

			(backsEl.style.visibility !== visibility) &&
					(backsEl.style.visibility = visibility);
		});
	}

	function initXScroll() {
		var scrollsEl = doc.querySelector('*[is="x-scroll"]')

		app.ui.scroll(scrollsEl);
	}

	Object.extend(app, {
		init : function(page) {
			var that = this,
				name = page.name,
				routes = page.routes || {}
				;

			delete page.name;
			delete page.routes;

			var appPage = new AppPage(name, {
				routePrefix : app.routePrefix,
				routePrefixSep : app.routePrefixSep,
				routes : routes
			});
			
			Object.extend(appPage, page);
		},

		router : router,
		navigate : navigate,

		ui : {
			gesture : gesture,
			scroll : scroll
		}
	});

	initXback();
	initXScroll();

	win['app'] = app;
});

require('mix/sln/0.1.0/app');