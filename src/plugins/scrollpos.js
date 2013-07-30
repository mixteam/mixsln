;(function(win, app){
	var doc = win.document
		;

	app.plugin.scrollpos = {
		_options: null,
		_domready : false,

		handleEvent: function(e) {
			(e.type === 'scrollend' && this._domready) && this.setPos();
		},

		setPos: function() {
			this._options.pos = app.scroll.getScrollTop();
		},

		reset: function(pos) {
			var options = this._options
				;

			(pos != null) && (options.pos = pos);
			app.scroll.scrollTo(options.pos);
		},

		onNavigationSwitch: function() {
			this._domready = false;
		},

		onDomReady: function(options) {
			this._options = options;
			this._domready = true;
			this.reset();
		},

		onPageShow: function(page,  options) {
			app.scroll.addEventListener('scrollend', this, false);
		},

		onPageHide: function(page, options) {
			app.scroll.removeEventListener('scrollend', this);
		}
	}
})(window, window['app'])