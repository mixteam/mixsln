(function(win, app){
	app.plugin.pullbounce = {
		_el : null,
		_options : null,
		_page : null,
		_update : false,
		_updateHandler : null,

		handleEvent: function(e) {
			var that = this,
				el = this._el,
				page = this._page,
				options = this._options,
				offset = el.getBoundaryOffset()
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
					el.stopBounce();
					setTimeout(function() {
						that._updateHandler.call(page, function() {
							el.refresh();
							el.resumeBounce();
						});
					}, 400);
				}
			}
		},

		onNavigationSwitch: function(page, options) {
			page.scroll = {
				bounceTop: options.top || 0,
				bounceBottom: options.bottom || 0
			}
		},

		onPageStartup: function(page, options) {
			var el = this._el = page.el;
			this._page = page;
			this._options = options;

			if (el.refresh) {
				this._update = false;
				this._updateHandler = null;
				options.top && el.addEventListener('pulldown', this, false);
				options.bottom && el.addEventListener('pullup', this, false);
				el.addEventListener('panend', this, false);
			}
		},

		onPageTeardown: function(page, options) {
			var el = page.el;

			if (el.refresh) {
				options.top && el.removeEventListener('pulldown', this, false);
				options.bottom && el.removeEventListener('pullup', this, false);
				el.removeEventListener('panend', this, false);
			}
		}
	}
})(window, window['app']);