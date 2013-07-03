(function(win, app){
	var doc = win.document
		;

	app.plugin.scrollpos = {
		_options : null,

		handleEvent: function(e) {
			(e.type === 'scrollend') && this.setPos();
		},

		setPos : function(pos) {
			this._options.pos = (typeof pos === 'number' ? pos: app.scroll.getScrollTop());
		},

		reset : function(pos) {
			var options = this._options
				;

			(pos != null) && this.setPos(pos);
			app.scroll.scrollTo(options.pos);
		},

		onNavigationSwitchEnd : function(options) {
			this._options = options;
			this.reset();
		},

		onPageStartup : function(page,  options) {
			this._options = options;
			app.scroll.addEventListener('scrollend', this, false);
		},

		onPageTeardown : function(page, options) {
			app.scroll.removeEventListener('scrollend', this);
		}
	}
})(window, window['app']);