(function(win, app, undef) {

var util = app.util,
	navigate = app._module.navigate.instance,
	Page = app.page,
	STATUS = Page.STATUS
	;

function Navigation(state) {
	var that = this,
		name = state.name.split('.')
		;
		
	that.pageName = name[0];
	that.routeName = name[1];
	that.state = state;
}

var proto = {
	initialize : function(state) {
		var that = this,
			name = state.name.split('.')
			;
			
		that.pageName = name[0];
		that.routeName = name[1];
		that.state = state;
	},

	load : function(callback) {
		var that = this,
			page = Page.get(this.pageName),
			loadedState = []
			;

		function checkLoaded(i) {
			loadedState[i] = true;
			if (loadedState.join('').match(/^(true)*$/)) {
				page.status = STATUS.LOADED;
				callback();
			}
		}

		function pushViews(view) {
			var views = view.views || {};
			loadedState.push(view);
			util.each(views, pushViews);
		}

		if (page.status < STATUS.LOADED) {
			pushViews(page);

			util.each(loadedState, function(state, i) {
				state.loadTemplate(function(text) {
					state.compileTemplate(text, function(compiled) {
						state.compiledTemplate = compiled;
						checkLoaded(i);
					});
				});
			});
		}
	},

	ready : function() {
		var page = Page.get(this.pageName), $
			;

		if (page.status === STATUS.LOADED && page.status < STATUS.READY) {
			page.status = STATUS.READY;
			page.viewport.el = app.component.getActiveContent();
			($ = window['$']) && (page.viewport.$el = $(page.viewport.el));
			page.trigger('ready');
			page.ready();
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
};
util.extend(Navigation.prototype, proto);

util.extend(Navigation, {
	_cur : null,

	getParameter : function(name) {
		if (!this._cur) return;
		var state = this._cur.state;
		return state.params[name] || state.args[name] || state.datas[name];
	},

	getArgument : function(name) {
		if (!this._cur) return;
		return this._cur.state.args[name];
	},

	getData : function(name) {
		if (!this._cur) return;
		return this._cur.state.datas[name];
	},

	setData : function(name, value) {
		if (!this._cur) return;
		this._cur.state.datas[name] = value;
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
		if (options && options.type === 'GET') {
			options.args = options.datas;
			options.data = null;
		}

		navigate.forward(fragment, options);
	},

	pop : function() {
		navigate.backward();
	}
})

app.navigation = app._module.navigation = Navigation;

})(window, window['app']||(window['app']={_module:{},plugin:{}}));