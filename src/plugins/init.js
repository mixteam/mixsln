(function(win, app){
	var doc = win.document,
		docEl = doc.documentElement,
		scroll = app.component.get('scroll')
		;

	app.plugin.init = function() {
		app.page.each(function(page) {
			var plugins = page.plugins
				;

			if (plugins) {
				page.on('ready', function() {
					Object.each(plugins, function(options, name) {
						if (page.plugins[name] === true) {
							options = page.plugins[name] = {};
						}
						app.plugin[name] && app.plugin[name].on(page, options);
					});
				});

				page.on('unloaded', function() {
					Object.each(plugins, function(options, name) {
						app.plugin[name] && app.plugin[name].off(page);
					});
				});
			}
		});
	}
})(window, window['app']);