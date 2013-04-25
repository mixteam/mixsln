(function(win, app){
	app.plugin.init = function() {
		app.page.each(function(page) {
			var plugins = page.plugins
				;

			if (plugins) {
				page.on('ready', function() {
					Object.each(plugins, function(pageOptions, name) {
						if (pageOptions === false) return;

						var state = app.navigation.getState(), plugin = app.plugin[name];

						state.plugins || (state.plugins = {});
						state.plugins[name] || (state.plugins[name] = {})
						pageOptions === true && (pageOptions = page.plugins[name] = {})
						
						if (plugin && plugin.on) {
							plugin.on(page, {
								page : pageOptions,
								state : state.plugins[name]
							});
						}
					});
				});

				page.on('unloaded', function() {
					Object.each(plugins, function(pageOptions, name) {
						if (pageOptions === false) return;
						
						var state = app.navigation.getState(), plugin = app.plugin[name];

						if (plugin && plugin.off) {
							plugin.off(page, {
								page : pageOptions,
								state : state.plugins[name]
							});
						}
					});
				});
			}
		});
	}
})(window, window['app']);