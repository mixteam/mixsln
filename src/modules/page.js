define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),
    navigate = require('navigate').singleton,
    ;

function bindRoutes(routes) {
	Object.each(routes, function(route, routeName) {
		var routeText = route.text
			;
			
		navigate.addRoute(routeName, routeText, route);
	});
}

var AppPage = Class.create({
	Implements : Message,

	initialize : function(name, options) {
		var that = this
			;

		Message.prototype.initialize.apply(this, 'app.' + name);

		that._appname = name;

		bindRoutes(options.routes);
	},

	ready : function() {},
	active : function() {},
	suspend : function() {},
	destory : function() {}
});


return AppPage;

});