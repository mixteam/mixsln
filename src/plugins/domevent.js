(function(win, app){
	app.plugin.domevent = {
		delegateEvents: function($el, events, context) {
			events.forEach(function(ev) {
				context[ev[2]] && (ev[2] = context[ev[2]]);

				$el && $el.on(ev[0], ev[1], function(e) {
					ev[2].apply(context, arguments);
				});
			});
		},

		undelegateEvents: function($el) {
			$el && $el.off();
		},

		on : function(page, options) {
			this.delegateEvents(page.content.$el, page.events, page);
		},

		off : function(page, options) {
			this.undelegateEvents(page.content.$el);
		}
	}
})(window, window['app'])