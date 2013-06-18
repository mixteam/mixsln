(function(win, app){
	var doc = win.document,
		navigator = win.navigator,
	    appVersion = navigator.appVersion,
    	isAndroid = (/android/gi).test(appVersion),
    	isIOS = (/iphone|ipad/gi).test(appVersion)
		;

	function getScrollTop() {
		if (app.scroll) {
			return app.scroll.getScrollTop();
		} else {
			return doc.body.scrollTop;
		}
	}

	function getViewHeight() {
		if (app.scroll) {
			return app.scroll.getViewHeight();
		} else {
			return doc.body.clientHeight;
		}
	}

	function getParent(el) {
		return el.offsetParent || el.parentNode;
	}

	function getOffset(img) {
		var cStyle = getComputedStyle(img),
			offsetHeight = parseFloat(img.getAttribute('height') || img.offsetHeight || cStyle.height),
			offsetTop = parseFloat(img.offsetTop),
			offsetParent, offsetContent = 0
			;

		// if (!app.scroll) {
		// 	for (offsetParent = getParent(el); offsetParent && offsetParent != doc.body;) {
		// 		offsetContent += parseFloat(offsetParent.offsetTop || 0);
		// 		offsetParent = getParent(offsetParent);
		// 	}
		// }

		for (offsetParent = getParent(img); offsetParent && offsetParent != app.scroll;) {
            offsetTop += parseFloat(offsetParent.offsetTop || 0);
            offsetParent = getParent(offsetParent);
        }

		return {
			top : offsetTop + offsetContent,
			bottom : offsetTop + offsetHeight + offsetContent
		}
	}

	app.plugin.lazyload = {
		_el: null,
		_options: null,
		_startScrollTime: 0,
		_endScrollTime: 0,
		_scrollFlickTime: 200,

		handleEvent: function(e) {
			if (e.type === 'scrollend' || e.type === 'scroll') {
				this.check();
			} else if (e.type === 'touchstart') {
				this._checkStart();
			} else if (e.type === 'touchend') {
				this._checkEnd();
			}
		},

		_checkStart: function() {
			this._startScrollTime = Date.now();
		},

		_checkEnd : function() {
			var that = this;

			this._endScrollTime = Date.now();
			if (this._endScrollTime - this._startScrollTime < this._scrollFlickTime) {
				if (isIOS) {
					window.addEventListener('scroll', this, false);
				} else {
					var scrollTop = doc.body.scrollTop,
						scrollId = setInterval(function(){
							if (scrollTop === doc.body.scrollTop) {
								clearInterval(scrollId);
								that.check();
							} else {
								scrollTop = doc.body.scrollTop
							}
						}, 50);
				}
			} else {
				this.check();
			}
		},

		check: function() {
			var options = this._options,
				dataAttr = options.dataAttr || 'data-src',
				imgs = app.scroll.querySelectorAll('img[' + dataAttr + ']'),
				viewportTop = getScrollTop(),
				viewportBottom = getScrollTop() + getViewHeight()
				;

			for (var i = 0; i < imgs.length; i++) {
				var img = imgs[i],
					offset = getOffset(img),
					src
					;

				if (offset.top > viewportTop && offset.top < viewportBottom ||
						offset.bottom > viewportTop && offset.bottom < viewportBottom) {
					src = img.getAttribute(dataAttr);
					if (src) {
						img.setAttribute('src', src);
						img.removeAttribute(dataAttr);
					}
				}
			}
		},

		onPageStartup : function(page, options) {
			var el = page.el;
			this._options = options;

			if (app.scroll) {
				app.scroll.addEventListener('scrollend', this, false);
			} else {
				doc.addEventListener('touchstart', this, false);
				doc.addEventListener('touchend', this, false);
			}
		},

		onPageTeardown : function(page, options) {
			var el = page.el;

			if (app.scroll) {
				app.scroll.removeEventListener('scrollend', this);
			} else {
				doc.removeEventListener('touchstart', this);
				doc.removeEventListener('touchend', this);
			}
		}
	}
})(window, window['app']);