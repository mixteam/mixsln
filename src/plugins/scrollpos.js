(function(win, app){
	var doc = win.document
		;

	function getScrollTop(el) {
		if (app.scroll) {
			return app.scroll.getScrollTop();
		} else {
			return doc.body.scrollTop;
		}
	}

	function scrollTo(pos, el) {
		if (app.scroll) {
			app.scroll.scrollTo(pos, true);
		} else {
			win.scrollTo(0, pos);
		}
	}

	app.plugin.scrollpos = {
		_options : null,

		handleEvent: function(e) {
			if (e.type === 'scrollend' || e.type === 'touchend') {
				this.setPos();
			}
		},

		setPos : function(pos) {
			this._options.pos = (typeof pos === 'number' ? pos: getScrollTop());
		},

		reset : function(pos) {
			var options = this._options
				;

			if (pos != null) {
				this.setPos(pos);
			}
			scrollTo(options.pos);
		},

		onNavigationSwitch : function(page, options) {
			this._options = options;
			this.reset();
		},

		onPageStartup : function(page,  options) {
			var el = page.el;
			this._options = options;
			
			if (app.scroll) {
				el.addEventListener('scrollend', this, false);
			} else {
				doc.addEventListener('touchend', this, false);
			}
		},

		onPageTeardown : function(page, options) {
			var el = page.el;

			if (app.scroll) {
				el.removeEventListener('scrollend', this);
			} else {
				doc.removeEventListener('touchend', this);
			}
		}
	}
})(window, window['app']);