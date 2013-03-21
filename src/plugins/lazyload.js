(function(win, app){
	var doc = win.document,
		scroll
		;

	function getScrollTop() {
		return scroll.fn.getScrollTop();
	}

	function getScrollHeight() {
		return scroll.fn.getScrollHeight();
	}

	function getViewHeight() {
		return scroll.offsetHeight;
	}

	app.plugin.lazyload = {
		_options : null,

		_getOffset : function(img) {
			var content = app.component.getActiveContent(),
				cStyle = getComputedStyle(img),
				offsetHeight = parseFloat(img.getAttribute('height') || img.offsetHeight || cStyle.height)
				offsetParent = img.parentNode,
				offsetTop = parseFloat(img.offsetTop)
				;

			while (offsetParent != content) {
				offsetTop += parseFloat(offsetParent.offsetTop);
				offsetParent = offsetParent.parentNode;
			}

			return {
				top : offsetTop,
				bottom : offsetTop + offsetHeight
			}
		},

		check : function() {
			var options = this._options,
				dataAttr = options.page.dataAttr || 'data-src',
				content = app.component.getActiveContent(),
				imgs = content.querySelectorAll('img[' + dataAttr + ']'),
				viewportTop = getScrollTop(),
				viewportBottom = getScrollTop() + getViewHeight()
				;

			for (var i = 0; i < imgs.length; i++) {
				var img = imgs[i],
					offset = this._getOffset(img),
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

		on : function(page, options) {
			this._options = options;
			scroll = app.component.get('scroll');
			app.component.on('scrollEnd', this.check, this);
			page.on('rendered', this.check, this);
		},

		off : function(page, options) {
			app.component.off('scrollEnd', this.check, this);
			page.off('rendered', this.check, this);
		}
	}
})(window, window['app']);