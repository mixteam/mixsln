(function(win, app){
	var util = app.util,
		doc = win.document,
		$ = win.Zepto || win.$
		;

	app.page.fn.delegate = function(event, selector, calllback) {
		var options = app.plugin.domevent._options, 
			cache = options.page.cache,
			content = $(app.component.getActiveContent())
			;

		if (arguments.length === 3) {
			cache.push([event, selector, calllback]);
		} else if (arguments.length === 3) {
			util.each(arguments[0], function(callback, event) {
				cache.push([event, selector, callback]);
			});
		}

		content.on.apply(content, arguments);
	}

	app.page.fn.undelegate = function(event, selector, calllback) {
		var content = $(app.component.getActiveContent())

		content.off.apply(content, arguments);
	}

	app.plugin.domevent = {
		_options : null,

		on : function(page, options) {
			var that = this
				;

			that._options = options;
			options.page.cache = [];

			util.each(page.events, function(ev) {
				var handler = ev[2];

				if (util.isTypeof(handler, 'string')) {
					handler = page[handler];
				}

				page.delegate(ev[0], ev[1], function(e) {
					handler.call(this, e, page);
				});
			});
		},

		off : function(page,  options) {
			var options = this._options
				;

			util.each(options.page.cache, function(dv) {
				page.undelegate(dv[0], dv[1], dv[2]);
			});

			delete options.page.cache;
		}
	}
})(window, window['app'])