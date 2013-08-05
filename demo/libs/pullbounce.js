(function(win, app){
	var doc = win.document,
		config = app.config
		;

	app.plugin.pullbounce = {
		_options : null,
		_page : null,

		handleEvent: function(e) {
			var that = this,
				page = this._page,
				options = this._options
				;

			var func = options['on' + e.type];
			if (typeof func === 'string') {
				func = page[func];
			}

			if (func) {
				func.call(page, function() {
					that._onPullEnd(e.type);
				});
			} else {
				that._onPullEnd(e.type);
			}
		},

		_onPullEnd: function(type) {
			app.scroll.refresh();
			app.native.view[type==='PullDown'?'resetPulldown':'resetPullup']();
		},

		onPageShow: function(page, options) {
			var that = this;

			this._page = page;
			this._options = options;

			options.onPullDown && app.native.view.onPulldown(function() {
				that.handleEvent({
					type: 'PullDown'
				})
			});

			options.onPullUp && app.native.view.onPullup(function() {
				that.handleEvent({
					type: 'PullUp'
				})
			});
		},

		onPageHide: function(page, options) {
			options.onPullDown && app.native.view.offPulldown();
			options.onPullUp && app.native.view.offPullup();
		}
	}
})(window, window['app']);