define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),
    navigate = require('navigate').singleton,
    pages = {},
    curApp = null
    ;

var AppPage = Class.create({
	Implements : Message,

	initialize : function(name, options) {
		var that = this
			;

		Message.prototype.initialize.call(this, 'app.' + name);

		that._appname = name;
		that._bindRoutes(options.routes);

		pages[name] = that;
	},

	_bindRoutes : function(routes) {
		var that = this,
			appname = that._appname
			;

		Object.each(routes, function(route, routeName) {
			var routeText = route.text,
				routeCallback = route.callback
				;

			if (routeName === 'default') {
				route['default'] = true;
			}

			route.callback = function() {
				if (Object.isTypeof(routeCallback, 'string')) {
					routeCallback = that[routeCallback];
				}

				routeCallback.apply(that, arguments);
				// lazy callback
				route.callback = routeCallback.bind(that);
			}

			navigate.addRoute(appname + '.' + routeName, routeText, route);
		});
	},

	ready : function(state) {/*implement*/},
	unload : function() {/*implement*/}
});

navigate.on('forward backward', function(state) {
	var appName = state.name.split('.')[0]
		;

	if (curApp !== appName) {
		var lastPage = pages[curApp],
			curPage = pages[appName]
			;

		curApp = appName;
		lastPage && lastPage.unload();
		curPage && curPage.ready(state);
	}
});


return AppPage;

});