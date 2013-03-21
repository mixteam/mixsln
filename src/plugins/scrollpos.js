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

	function scroll2(pos) {
		scroll.fn.scrollTo(pos);
	}

	app.plugin.scrollpos = {
		_options : null,

		_setPos : function(pos) {
			this._options.state.pos = (pos != null ? pos: getScrollTop());
		},

		_transitonEnd : function() {
			this._options.page.transitonEnd = true;
		},

		_resetPos : function() {
			var options = this._options
				;

			if (!options.page.first) {
				this._setPos(0);
			} else {
				options.page.first = false;

				if (options.page.transitonEnd) {
					scroll2(options.state.pos);
				} else {
					app.component.once('backwardTransitionEnd', function() {
						scroll2(options.state.pos);
					})
				}
			}
		},

		on : function(page, options) {
			this._options = options;
			options.page.first = true;
			options.page.transitonEnd = false;
			scroll = app.component.get('scroll');

			app.component.on('scrollEnd', this._setPos, this);
			app.component.on('backwardTransitionEnd', this._transitonEnd, this);
			page.on('rendered', this._resetPos, this);
		},

		off : function(page, options) {
			app.component.off('scrollEnd', this._setPos, this);
			app.component.off('backwardTransitionEnd', this._transitonEnd, this);
			page.off('rendered', this._resetPos, this);
		}
	}
})(window, window['app']);