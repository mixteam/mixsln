// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define(function(require, exports, module) {

require('reset');

var Class = require('class'),
	Message = require('message'),
	history = require('history').singleton,
	router = require('router').singleton,
	undef = undefined,

	spliterReg = Message.spliterReg,
	atReg = Message.atReg
	;

var Controller = Class.create({
	Implements : Message,

	initialize : function(name, options) {
		var that = this,
			opt = that._options = Object.extend({
				routes : {},
				historyEvents : {
					'navigator:route' : that._routeHandler
				},
				controllerEvents : {
					'destroy' : that.destroy
				},
			}, options || {})
			;

		Message.prototype.initialize.call(that, 'controller.' + name);

		that._appname = name;
		that._views = {};

		that.on('install', function() {
			that._bindRoutes(opt.routes);
			that._bindHistoryEvents(opt.historyEvents);
			that._bindControllerEvents(opt.controllerEvents);

			history.match();
		});
	},

	_bindRoutes : function(routes) {
		var that = this,
			appname = that._appname
			;

		Object.each(routes, function(name, route) {
			router.addRoute(appname + '/' + route, name);
		});
	},

	_unbindRoutes : function(routes) {
		var that = this,
			appname = that._appname
			;

		Object.each(routes, function(name, route) {
			router.removeRoute(appname + '/' + route);
		});
	},

	_bindHistoryEvents : function(events) {
		var that = this
			;

		Object.each(events, function(handler, event) {
			history.on(event, handler, that);
		});
	},

	_unbindHistoryEvents : function(events) {
		var that = this
			;

		Object.each(events, function(handler, event) {
			history.off(event, handler);
		});
	},

	_bindControllerEvents : function(events) {
		var that = this
			;

		Object.each(events, function(handler, event) {
			that.on(event, handler, that);
		});
	},

	_routeHandler : function(appname, subject) {
		var that = this,
			state = router.getState(),
			params = state.params.slice(0)
			;

		if (that._appname !== appname) return;

		params.unshift('route:' + subject);

		that.trigger.apply(that, params);
	},

	getName : function() {
		var that = this
			;

		return that._appname;
	},

	getViewport : function() {
		var that = this,
			name = that._appname
			;

		return 'viewport-' + name;
	},

	addView : function(view, viewport) {
		var that = this,
			View, name
			;

		if (view.superclass && view.superclass instanceof Class) {
			View = view;
			view = new View(undef, that, viewport)
		}

		name = view.getName();
		that._views[name] = view;

		return name;
	},

	getView : function(name) {
		var that = this
			;

		return that._views[name];
	},

	getParameter : function(name) {
		var that = this,
			state = router.getState(),
			params = state.params,
			paramKeys = state.paramKeys,
			index = paramKeys[name]
			;

		if (index != undef) {
			return params[index];
		}
	},

	getArgument : function(name) {
		var that = this,
			state = router.getState(),
			args = state.args
			;

		return args[name];
	},

	trigger : function(events) {
		var that = this,
			args = Array.make(arguments),
			at = (atReg.exec(events) || [])[1]
			;

		if (at) {
			args[0] = events.replace(spliterReg, ' @' + at + ':');
		}

		Message.prototype.trigger.apply(that, args);
	},

	destroy : function() {
		var that = this,
			opt = that._options,
			routes = opt.routes,
			events = opt.historyEvents
			;

		that._unbindRoutes(routes);
		that._unbindHistoryEvents(events);
	}
});

module.exports = Controller;

});