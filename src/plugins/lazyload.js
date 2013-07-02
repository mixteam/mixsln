(function(win, app){
	var doc = win.document,
		navigator = win.navigator,
	    appVersion = navigator.appVersion,
    	isAndroid = (/android/gi).test(appVersion),
    	isIOS = (/iphone|ipad/gi).test(appVersion)
		;

	app.plugin.lazyload = {
		_options: null,

		handleEvent: function(e) {
			(e.type === 'scrollend') && this.check();
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

		onPageStartup : function(page, options) {
			this._options = options;
			app.scroll.addEventListener('scrollend', this, false);
		},

		onPageTeardown : function(page, options) {
			app.scroll.removeEventListener('scrollend', this);
		}
	}
})(window, window['app']);