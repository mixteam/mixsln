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

	initialize : function(options) {
		var that = this,
			name = that.name
			;

		Message.prototype.initialize.call(that, 'app.' + name);

		that._options = options;
		that._isReady = false;
		that._bindEvents();
		that._bindRoutes();
	},

	_bindEvents : function() {
		var that = this
			;

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
		});
	},

	_bindRoutes : function() {
		var that = this,
			name = that.name,
			route = that.route
			;

		if (Object.isTypeof(route, 'string')) {
			route = {
				name : 'anonymous',
				text : route
			}
		}

		navigate.addRoute(name + '.' + route.name, route.text, route);
	},

	getTitle : function() {
		return this.title;	//over rewite
	},

	setTitle : function(title) {
		this.title = title;
	},

	ready : function(state) {/*implement*/},
	unload : function() {/*implement*/}
});

return AppPage;

});