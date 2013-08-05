(function(win, app, wv) {
	if (!app || !wv) return;

	var _app_config = app.config,
		_app_start = app.start,
		_app_navigation_setTitle = app.navigation.setTitle,
		_app_navigation_setButton = app.navigation.setButton,
		_app_navigation_switchNavbar = app.navigation.switchNavbar,
		_app_navigation_resetNavbar = app.navigation.resetNavbar,
		_app_view_showLoading = app.view.showLoading,
		_app_view_hideLoading = app.view.hideLoading,
		native_api = app.native = wv.api;

	window.onerror = function(e) {
		alert(e.message);
	}

	app.start = function() {
		native_api.navigation.ready(function() {
			_app_start.call(app);
		});
	}

	app.navigation.setTitle = function(title) {
		native_api.navigation.setTitle(title);
		_app_navigation_setTitle.call(app.navigation, title);
	}

	app.navigation.setButton = function(options) {
		native_api.navigation.setButton(options);
		_app_navigation_setButton.call(app.navigation, options);
	}

	app.navigation.switchNavbar = function(title, type, buttons) {
		app.navigation.resetNavbar(function() {
			for (var i = 0; i < buttons.length; i++) {
				app.navigation.setButton(buttons[i]);
			}
			//app.navigation.setTitle(title);
			native_api.navigation.switch(title, type==='forward'?'push':'pop');
			_app_navigation_switchNavbar.call(app.navigation, title, type, buttons);	
		});
	}

	app.navigation.resetNavbar = function(callback) {
		native_api.navigation.reset(callback);
		_app_navigation_resetNavbar.call(app.navigation);
	}

	app.view.showLoading = function(text) {
		native_api.view.showLoading(text);
		_app_view_showLoading();
	}

	app.view.hideLoading = function() {
		native_api.view.hideLoading();
		_app_view_hideLoading();
	}
})(window, window['app'], window['WindVane']);