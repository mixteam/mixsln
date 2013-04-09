(function(win, app){
	var doc = win.document
		;

	app.view.fn.loadTemplate = function(url, callback) {
		var that = this
			;

		if (arguments.length === 1) {
			callback = arguments[0];
			url = that.template;
		}

		callback(url);
	}


	app.plugin.inlineTemplate = true;
})(window, window['app']);