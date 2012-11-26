define("mix/core/util/mvc/navigator/0.1.0/navigator-debug", ["mix/core/base/reset/1.0.0/reset-debug", "mix/core/base/class/1.0.0/class-debug", "mix/core/util/mvc/controller/0.1.0/controller-debug", "mix/core/base/message/1.0.0/message-debug", "mix/core/util/history/0.2.0/history-debug", "mix/core/util/router/0.2.0/router-debug"], function(require, exports, module) {

require('mix/core/base/reset/1.0.0/reset-debug');

var Class = require('mix/core/base/class/1.0.0/class-debug'),
	Controller = require('mix/core/util/mvc/controller/0.1.0/controller-debug'),

	win = window,
	doc = win.document,
	head = win.head,
	undef = undefined,
	scriptCache = {}
	;

var Navigator = Controller.extend({
	initialize : function() {
		var that = this,

			options = {
				historyEvents : {
					'navigator:forward' : waitReady(that._forwardHandler),
					'navigator:backward' : waitReady(that._backwardHandler)
				}
			}
			;

		Navigator.superclass.initialize.call(that, 'navigatorController', options);

		that._queue = [];
		that._limit = 6;
		that._index = -1;
		that._controllers = {};

		that._viewName = undef;
	},

	_forwardHandler : function(appname, url) {
		var that = this,
			controllers = that._controllers,
			queue = that._queue,
			limit = that._limit,
			index = that._index,
			last = queue[index], 
			next, remove
			;

		if (index === limit - 1) {
			remove = queue.shift();
			queue.push(!!0);
		} else {
			index++;
		}

		next = queue[index];
		if (next !== appname) {
			queue[index] = appname;
			queue.splice(index + 1);
		}

		if (remove && queue.indexOf(remove) < 0) {
			that.removeController(remove);
		}

		that._index = index;
		that.trigger('forward', appname);

		if (!controllers[appname]) {
			that.addController(appname, url);
		} else {
			that.activeController(appname);
		}

		if (controllers[last]) {
			that.suspendController(last);
		}
	},

	_backwardHandler : function(appname, url) {
		var that = this,
			controllers = that._controllers,
			queue = that._queue,
			limit = that._limit,
			index = that._index,
			last = queue[index], 
			pre, remove
			;

		if (index === 0) {
			remove = queue.pop();
			queue.unshift(!!0);
		} else {
			index--;
		}

		pre = queue[index];
		if (pre !== appname) {
			queue[index] = appname;
			for (var i = 0; i < index; i++) {
				queue[i] = !!0;
			}
		}

		if (remove && queue.indexOf(remove) < 0) {
			that.removeController(remove);
		}

		that._index = index;
		that.trigger('backward', appname);

		if (!controllers[appname]) {
			that.addController(appname, url);
		} else {
			that.activeController(appname);
		}

		if (controllers[last]) {
			that.suspendController(last);
		}
	},

	addController : function(name, url, callback) {
		var that = this,
			controllers = that._controllers,
			controller = controllers[name]
			;

		if (!controller) {
			that._controllers[name] = 'loading';
			loadScript(name, url, callback);
		}
	},

	depositController : function(name, routes, viewList) {
		var that = this,
			controllers = that._controllers,
			controller,
			viewList = Array.make(arguments).slice(2)
			;

		controller = new Controller(name, {routes : routes});
		Object.each(viewList, function(view) {
			controller.addView(view);
		});

		controllers[name] = controller;
		//controller.trigger('install');

		return controller;
	},

	activeController : function(name) {
		var that = this,
			controllers = that._controllers,
			controller = controllers[name]
			;

		if (controller && controller.trigger) {
			controller.trigger('active');
		}
	},

	suspendController : function(name) {
		var that = this,
			controllers = that._controllers,
			controller = controllers[name]
			;

		if (controller && controller.trigger) {
			controller.trigger('suspend');
		}
	},

	removeController : function(controller) {
		var that = this,
			controllers = that._controllers,
			name = Object.isTypeof(controller, 'string') ? controller :
					controller.getName(),
			controller = controllers[name]
			;
		
		if (controller) {
			unloadScript(name);
			controller.trigger && controller.trigger('destroy');
			controllers[name] = null;
			delete controllers[name];
		}
	},

	getController : function(name) {
		var that = this;

		return that._controllers[name];
	},

	setView : function(view) {
		var that = this;

		isReady = false;
		that._viewName = Navigator.superclass.addView.call(that, view);
		that.getView().once('ready', viewReady);
	},

	getView : function() {
		var that = this;

		return Navigator.superclass.getView.call(that, that._viewName);
	}
});


function loadScript(appname, url, callback) {
	var id = 'controller-js-' +  appname
		;

	if (!scriptCache[id]) {
		script = doc.createElement('script');
		script.id = id;
		script.type = 'text/javascript';
		script.async = true;
		script.onload = script.onreadystatechange  = function() {
			if (!scriptCache[id]) {
				scriptCache[id] = script;
				callback && callback();
			}
		}
		script.src = url;

		head.appendChild(script);
	}

	return id;
}

function unloadScript(appname, callback) {
	var id = 'controller-js-' +  appname,
		script = scriptCache[id]
		;

	if (script) {
		head.removeChild(scriptCache[id]);
		delete scriptCache[id];
		callback && callback();
	}

	return id;
}

var isReady = true,
	readyWaited = [];

function waitReady(handler) {

	if (handler) {
		return function() {
			var that = this,
				args = arguments
				;

			if (!isReady) {
				readyWaited.push(function() {
					handler.apply(that, args);
				});
			} else {
				handler.apply(that, args);
			}
		}
	}
}

function viewReady() {
	if (!isReady) {
		while (readyWaited.length) {
			handler = readyWaited.shift();
			handler();
		}
		isReady = true;
	}
}

Navigator.singleton = new Navigator;
module.exports = Navigator;

});