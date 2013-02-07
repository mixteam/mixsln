define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),
    navigate = require('navigate').singleton
    ;

var AppPage = Class.create({
	Implements : Message,

	initialize : function(name, options) {
		var that = this
			;

		Message.prototype.initialize.call(this, 'app.' + name);

		that._appname = name;
		that._isReady = false;
		that._bindRoutes(options.routes);

		that.on('ready', function(state) {
			if (!that._isReady) {
				that._isReady = true;
				that.ready(state);
			}
		});

		that.on('unload', function() {
			if (that._isReady) {
				that._isReady = false;
				that.unload();
			}
		})
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

				if (!that._isReady) {
					that.once('ready', function() {
						routeCallback.apply(that, arguments);
					});
				} else {
					routeCallback.apply(that, arguments);
				}
				
			}

			navigate.addRoute(appname + '.' + routeName, routeText, route);
		});
	},

	ready : function(state) {/*implement*/},
	unload : function() {/*implement*/}
});

return AppPage;

});