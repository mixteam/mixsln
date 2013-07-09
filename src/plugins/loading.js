(function(win, app) {
	var doc = win.document,
		loadingTimeout = 5000,
		loadingId, loadingWrap;

	app.plugin.loading = {
		ids: [],

		onAppStart: function() {
			loadingWrap = doc.createElement('div');
			loadingWrap.style.cssText = 'position:absolute;left:0;top:0;width:100%;z-index:999;background:rgba(255,255,255,0.7);display:none;'
			loadingWrap.className = 'loading-wrap';
			doc.body.appendChild(loadingWrap);
		},

		show: function() {
			var that = this,
				now = Date.now(),
				c_navbar = app.config.enableNavbar,
				navbarHeight = c_navbar?c_navbar.wrapEl.offsetHeight:0,
				offsetHeight = doc.documentElement.clientHeight,
				scrollY = window.scrollY
				;

			loadingWrap.style.height = offsetHeight - Math.max(navbarHeight - scrollY, 0) + 'px';
			loadingWrap.style.top = Math.max(scrollY, navbarHeight) + 'px';
			loadingWrap.style.display = 'block';
			this.ids.push(now);

			return now;
		},

		hide: function(id) {
			if (id) {
				this.ids.splice(this.ids.indexOf(id), 1);
			} else {
				this.ids = [];
			}

			if (this.ids.length === 0) {
				loadingWrap.style.display = 'none';
			}
		},

		onNavigationSwitch: function() {
			loadingId = this.show();
		},

		onDomReady: function() {
			this.hide(loadingId);
		}
	}


})(window, window['app']);