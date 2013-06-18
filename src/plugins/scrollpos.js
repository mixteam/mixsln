(function(win, app){
	var doc = win.document
		;

	function getScrollTop(el) {
		if (el && el.getScrollTop) {
			return el.getScrollTop();
		} else {
			return doc.body.scrollTop;
		}
	}

	function scrollTo(pos, el) {
		if (el && el.scrollTo) {
			el.scrollTo(pos);
		} else {
			win.scrollTo(0, pos);
		}
	}

	app.plugin.scrollpos = {
		_el : null,
		_options : null,

		handleEvent: function(e) {
			if (e.type === 'scrollend' || e.type === 'touchend') {
				this.setPos();
			}
		},

		setPos : function(pos) {
			this._options.pos = (typeof pos === 'number' ? pos: getScrollTop(this._el));
		},

		reset : function(pos) {
			var options = this._options
				;

			if (pos != null) {
				this.setPos(pos);
			}
			scrollTo(options.pos, this._el);
		},

		onNavigationSwitch : function(page, options) {
			var el = this._el = page.el;
			this._options = options;
			this.reset();
		},

		onPageStartup : function(page,  options) {
			var el = this._el = page.el;
			this._options = options;
			
			if (el.refresh) {
				el.addEventListener('scrollend', this, false);
			} else {
				doc.addEventListener('touchend', this, false);
			}
		},

		onPageTeardown : function(page, options) {
			var el = page.el;

			if (el.refresh) {
				el.removeEventListener('scrollend', this);
			} else {
				doc.removeEventListener('touchend', this);
			}
		}
	}
})(window, window['app']);