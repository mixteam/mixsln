define(function(require, exports, module) {
var reset = require('reset'),
	router = require('router').singleton,
	navigate = require('navigate').singleton,
	scroll = require('./modules/scroll')
	;

return window['app'] = {
	init : function(options) {

		var opt = options,

			routes = opt.routes || {},
			contros = opt.contros || {},
			backContros = contros.back,
			scrollContros = contros.scroll
			;

		Object.each(routes, function(route, name) {
			navigate.addRoute(name, route.text, route);
		});

		if (!Object.isTypeof(backContros, 'array')) {
			backContros = [backContros];
		}

		if (!Object.isTypeof(scrollContros, 'array')) {
			scrollContros = [scrollContros];
		}

		Object.each(backContros, function(contro) {
			if (contro instanceof HTMLElement) {
				contro.style.visibility = 'hidden';

				contro.addEventListener('click', function(e) {
					navigate.backward();
					e.preventDefault();
					return false;
				});
			}
		});

		Object.each(scrollContros, function(contro) {
			if (contro instanceof HTMLElement) {
				scroll(contro);
			}
		});

		navigate.on('forward backward', function() {
			var visibility = ''
				;

			if (navigate.getStateIndex() < 1) {
				visibility = 'hidden';
			}

			Object.each(backContros, function(contro) {
				if (contro instanceof HTMLElement &&
						contro.style.visibility !== visibility) {
					contro.style.visibility = visibility;
				}
			});
		});

		router.start();
	},

	forward : function() {
		navigate.forward.apply(navigate, arguments);
	},

	backward : function() {
		navigate.backward.apply(navigate, arguments);
	}
}

});