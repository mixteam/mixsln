(function(win, app){
	var doc = win.document,
		$ = win.Zepto || win.$
		;

	app.page.fn.find = function() {
		var content = $(app.component.getActiveContent())
			;

		return content.find.apply(content, arguments);
	}

	app.plugin.domfind = true;
})(window, window['app'])