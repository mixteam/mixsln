define(function(require, exports, module) {

require('reset');
var win = window,
	doc = win.document,

	Class = require('class'),
	navigate = require('navigate').singleton,
	Page = require('./page'),
	STATUS = Page.STATUS,
	Navigation = Class.create({
		initialize : function(state) {
			var that = this,
				name = state.name.split('.')
				;
				
			that.pageName = name[0];
			that.routeName = name[1];
			that.state = state;
		},

		ready : function() {
			var page = Page.get(this.pageName)
				;

			if (page.status < STATUS.READY) {
				page.status = STATUS.READY;
				page.trigger('ready');
				page.ready();
			}
		},

		load : function(callback) {
			var that = this,
				page = Page.get(this.pageName),
				views = page.views || {}, 
				loadedState = [page]
				;

			function checkLoaded(i) {
				loadedState[i] = true;
				if (loadedState.join('').match(/^(true)*$/)) {
					callback();
				}
			}

			if (page.status < STATUS.LOADED) {
				Object.each(views, function(view) {
					loadedState.push(view);
				});

				Object.each(loadedState, function(state, i) {
					state.loadTemplate(function(text) {
						state.compileTemplate(text, function(compiled) {
							state.compiledTemplate = compiled;
							checkLoaded(i);
						});
					});
				});
			}
		},

		unload : function() {
			var that = this,
				page = Page.get(this.pageName)
				;

			if (page.status > STATUS.UNLOADED) {
				page.status = STATUS.UNLOADED;
				page.trigger('unloaded');
				page.unload();
			}
		}
	});

Object.extend(Navigation, {
	_cur : null,

	getParameter : function(name) {
		if (!this._cur) return;
		return this._cur.state.params[name];
	},

	getArgument : function(name) {
		if (!this._cur) return;
		return this._cur.state.args[name];
	},

	getData : function(name) {
		if (!this._cur) return;
		return this._cur.state.datas[name];
	},

	getPageName : function() {
		if (!this._cur) return;
		return this._cur.pageName;
	},

	getRouteName : function() {
		if (!this._cur) return;
		return this._cur.routeName;
	},

	getState : function() {
		if (!this._cur) return;
		return this._cur.state;
	},

	push : function(fragment, options) {
		navigate.forward(fragment, options);
	},

	pop : function() {
		navigate.backward();
	}
})

return Navigation;
});