(function(win, app){
	app.plugin.pullbounce = {
		_options : null,
		_page : null,
		_pullType : false,

		handleEvent: function(e) {
			var that = this,
				page = this._page,
				el = page.el,
				options = this._options,
				offset = app.scroll.getBoundaryOffset()
				;

			if (e.type === 'pulldown') {
				if (offset > el.bounceTop) {
					this._pullType = 'pulldown';
				} else {
					this._pullType = false;
				}
				options.onPullDown.call(page, offset);
			} else if (e.type === 'pullup') {
				if (offset > el.bounceBottom) {
					this._pullType = 'pullup';
				} else {
					this._pullType = false;
				}
				options.onPullUp.call(page, offset);
			} else if (e.type === 'panend') {
				if (offset && this._pullType && options.onPullEnd) {
					app.scroll.stopBounce();
					setTimeout(function() {
						options.onPullEnd.call(page, that._pullType, function() {
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
			this._pullType = false;
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