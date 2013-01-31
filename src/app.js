define(function(require, exports, module) {
var win = window,
	doc = win.document,

	reset = require('reset'),
	Class = require('class'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,
	gesture = require('./modules/gesture'),
	scroll = require('./modules/scroll'),
	pages = {}, 
	components = {
		'x-back' : [],
		'x-scroll' : []
	},
	app = {
		theme : 'ios',
		routePrefix : 0, // 0 - no prefix, 1 - use app.name, 'any string' - use 'any string'
		routePrefixSep : '\/'
	}
	;

	function initComponents() {
		var backsEl = doc.querySelectorAll('*[is="x-back"]'),
			scrollsEl = doc.querySelectorAll('*[is="x-scroll"]'),
			xBack = components['x-back'],
			xScroll = components['x-scroll']
			;

		Object.each(backsEl, function(el) {
			el.style.visibility = 'hidden';

			el.addEventListener('click', function(e) {
				navigate.backward();
				e.preventDefault();
				return false;
			});

			xBack.push(el);
		});

		Object.each(scrollsEl, function(el) {
			xScroll.push(scroll(el));
		});
	}

	Object.extend(app, {
		init : function(page) {
			var that = this
				;

			if (Object.isTypeof(page, 'array')) {
				Object.each(page, function(p) {
					initPage(p);
				});
			} else {
				initPage(page);
			}
		},

		router : router,
		navigate : navigate,

		ui : {
			gesture : gesture,
			scroll : scroll
		}
	});


	navigate.on('forward backward', function() {
		var visibility = ''
			;

		if (navigate.getStateIndex() < 1) {
			visibility = 'hidden';
		}

		Object.each(components['x-back'], function(comp) {
			if (comp instanceof HTMLElement && 
					comp.style.visibility !== visibility) {
				comp.style.visibility = visibility;
			}
		});
	});

	initComponents();

	win['app'] = app;

});

require('mix/sln/0.1.0/app');