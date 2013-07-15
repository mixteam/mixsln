(function(win, app){
	var doc = win.document
		;

	app.plugin.lazyload = {
		_options: null,
		_domready: false,

		handleEvent: function(e) {
			(e.type === 'scrollend' && this._domready) && this.check();
		},

		check: function() {
			var options = this._options,
				dataAttr = options.dataAttr || 'data-src',
				imgs = app.scroll.getElement().querySelectorAll('img[' + dataAttr + ']'),
				viewportTop = app.scroll.getScrollTop(),
				viewportBottom = viewportTop + app.scroll.getViewHeight()
				;

			for (var i = 0; i < imgs.length; i++) {
				var img = imgs[i], offset = app.scroll.offset(img), src;

				if (((offset.top > viewportTop && offset.top < viewportBottom) ||
						(offset.bottom > viewportTop && offset.bottom < viewportBottom)) && 
							(src = img.getAttribute(dataAttr))) {
					img.setAttribute('src', src);
					img.removeAttribute(dataAttr);
				}
			}
		},

		onNavigationSwitch: function() {
			this._domready = false;
		},

		onDomReady: function(options) {
			this._options = options;
			this._domready = true;
			this.check();
		},

		onPageShow : function(page, options) {
			this._options = options;
			app.scroll.addEventListener('scrollend', this, false);
		},

		onPageHide : function(page, options) {
			app.scroll.removeEventListener('scrollend', this);
		}
	}
})(window, window['app']);