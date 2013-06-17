(function(win, app){
	var doc = win.document,
		navigator = win.navigator,
	    appVersion = navigator.appVersion,
    	isAndroid = (/android/gi).test(appVersion),
    	isIOS = (/iphone|ipad/gi).test(appVersion)
		;

	function getScrollTop(el) {
		if (el && el.getScrollTop) {
			return el.getScrollTop();
		} else {
			return doc.body.scrollTop;
		}
	}

	function getScrollHeight(el) {
		if (el && el.getScrollHeight) {
			return el.getScrollHeight();
		} else {
			return doc.body.scrollHeight;
		}
	}

	function getViewHeight(el) {
		if (el && el.refresh) {
			return el.parentNode.offsetHeight;
		} else {
			return doc.body.clientHeight;
		}
	}

	function getParent(el) {
		return el.parentNode;
	}

	function getOffset(img, el) {
		var cStyle = getComputedStyle(img),
			offsetHeight = parseFloat(img.getAttribute('height') || img.offsetHeight || cStyle.height),
			offsetTop = parseFloat(img.offsetTop),
			offsetParent, offsetContent = 0
			;

		if (!el.refresh) {
			for (offsetParent = getParent(el); offsetParent && offsetParent != doc.body;) {
				offsetContent += parseFloat(offsetParent.offsetTop || 0);
				offsetParent = getParent(offsetParent);
			}
		}

		for (offsetParent = getParent(img); offsetParent && offsetParent != el;) {
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
			var el = this._el,
				options = this._options,
				dataAttr = options.dataAttr || 'data-src',
				imgs = el.querySelectorAll('img[' + dataAttr + ']'),
				viewportTop = getScrollTop(el),
				viewportBottom = getScrollTop(el) + getViewHeight(el)
				;

			for (var i = 0; i < imgs.length; i++) {
				var img = imgs[i],
					offset = getOffset(img, el),
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
			var el = this._el = page.el;
			this._options = options;

			if (el.refresh) {
				el.addEventListener('scrollend', this, false)
			} else {
				doc.addEventListener('touchstart', this, false);
				doc.addEventListener('touchend', this, false);
			}
		},

		onPageTeardown : function(page, options) {
			var el = this._el;

			if (el.refresh) {
				el.removeEventListener('scrollend', this);
			} else {
				doc.removeEventListener('touchstart', this);
				doc.removeEventListener('touchend', this);
			}
		}
	}
})(window, window['app']);