(function(win, app){
	var doc = win.document,
		scroll
		;

	function getScrollTop() {
		if (scroll) {
			return scroll.fn.getScrollTop();
		} else {
			return doc.body.scrollTop;
		}
	}

	function getScrollHeight() {
		if (scroll) {
			return scroll.fn.getScrollHeight(); 
		} else {
			return doc.body.scrollHeight;
		}
	}

	function getViewHeight() {
		if (scroll) {
			return scroll.offsetHeight;
		} else {
			return doc.body.clientHeight;
		}
	}

	app.plugin.lazyload = {
		_options : null,

		_getOffset : function(img) {
			var content = app.component.getActiveContent(),
				cStyle = getComputedStyle(img),
				offsetHeight = parseFloat(img.getAttribute('height') || img.offsetHeight || cStyle.height),
				offsetParent,
				offsetTop = parseFloat(img.offsetTop),
				offsetContent = 0
				;

			if (!scroll) {
				offsetParent = content.offsetParent;
				while (offsetParent != doc.body) {
					offsetContent += parseFloat(offsetParent.offsetTop);
					offsetParent = offsetParent.offsetParent;
				}
			}

            offsetParent = img.offsetParent;
            while (offsetParent != content) {
                offsetTop += parseFloat(offsetParent.offsetTop);
                offsetParent = offsetParent.offsetParent;
            }


			return {
				top : offsetTop + offsetContent,
				bottom : offsetTop + offsetHeight + offsetContent
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
			this.check = this.check.bind(this);

			if (scroll) {
				app.component.on('scrollEnd', this.check);
			} else {
				doc.addEventListener('touchend', this.check, false);
			}
			page.on('rendered', this.check, this);
		},

		off : function(page, options) {
			if (scroll) {
				app.component.off('scrollEnd', this.check);
			} else {
				doc.removeEventListener('touchend', this.check, false);
			}
			page.off('rendered', this.check, this);
		}
	}
})(window, window['app']);