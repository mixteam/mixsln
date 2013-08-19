;(function(win, app) {
	var doc = win.document,
		config = app.config,
		id, ids = [];

	app.plugin.loading = {
		ids: [],

		show: function() {
			var now = Date.now();
			config.enableContent.instance.showLoading('正在加载');
			ids.push(now);
			return now;
		},

		hide: function(_id) {
			if (_id) {
				ids.splice(ids.indexOf(_id), 1);
			} else {
				ids = [];
			}

			if (ids.length === 0) {
				config.enableContent.instance.hideLoading();
			}
		},

		onNavigationSwitch: function() {
			id = this.show();
		},

		onDomReady: function() {
			this.hide(id);
		}
	}


})(window, window['app'])