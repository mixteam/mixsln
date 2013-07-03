(function(win, app) {
	var doc = win.document,
		loadingWrap;

	app.plugin.loading = {
		onAppStart: function() {
			loadingWrap = doc.createElement('div');
			loadingWrap.style.cssText = 'position:absolute;left:0;top:0;width:100%;z-index:999;background:rgba(255,255,255,0.7);display:none;'
			loadingWrap.className = 'loading-wrap';
			doc.body.appendChild(loadingWrap);
		},

		show: function() {
			var c_navbar = app.config.enableNavbar,
				c_toolbar = app.config.enable,
				offsetHeight = doc.documentElement.clientHeight
				;

			loadingWrap.style.height = offsetHeight + 'px';
			loadingWrap.style.top = window.scrollY + 'px';
			loadingWrap.style.display = 'block';
		},

		hide: function() {
			loadingWrap.style.display = 'none';
		},

		onNavigationSwitch: function() {
			this.show();
		},

		onNavigationSwitchEnd: function() {
			this.hide();
		}
	}


})(window, window['app']);