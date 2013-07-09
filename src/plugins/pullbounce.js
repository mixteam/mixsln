(function(win, app){
	app.plugin.pullbounce = {
		_options : null,
		_page : null,
		_update : false,
		_updateHandler : null,

		handleEvent: function(e) {
			var that = this,
				page = this._page,
				el = page.el,
				options = this._options,
				offset = app.scroll.getBoundaryOffset()
				;

			if (e.type === 'pulldown') {
				if (offset > el.bounceTop) {
					this._update = 'pulldown';
				} else {
					this._update = false;
				}
				this._updateHandler = options.onPullDown.call(page, offset);
			} else if (e.type === 'pullup') {
				if (offset > el.bounceBottom) {
					this._update = 'pullup';
				} else {
					this._update = false;
				}
				this._updateHandler = options.onPullUp.call(page, offset);
			} else if (e.type === 'panend') {
				if (offset && this._update && this._updateHandler) {
					app.scroll.stopBounce();
					setTimeout(function() {
						that._updateHandler.call(page, function() {
							app.scroll.refresh();
							app.scroll.resumeBounce();
						});
					}, 400);
				}
			}
		},

		onPageDefine: function(page, options) {
			page.scroll = {
				bounceTop: options.top || 0,
				bounceBottom: options.bottom || 0
			}
		},

		onPageShow: function(page, options) {
			this._page = page;
			this._options = options;
			this._update = false;
			this._updateHandler = null;
			options.top && app.scroll.addEventListener('pulldown', this, false);
			options.bottom && app.scroll.addEventListener('pullup', this, false);
			app.scroll.addEventListener('panend', this, false);
		},

		onPageHide: function(page, options) {
			options.top && app.scroll.removeEventListener('pulldown', this, false);
			options.bottom && app.scroll.removeEventListener('pullup', this, false);
			app.scroll.removeEventListener('panend', this, false);
		}
	}
})(window, window['app']);