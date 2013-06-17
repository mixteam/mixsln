(function(win, app){
	var View = app.module.View,
		Page = app.module.Page
		;

	View.fn.delegateEvents = Page.fn.delegateEvents = 
		function(events) {
			var $el = this.$el, context = this;

			$el && events.forEach(function(ev) {
				context[ev[2]] && (ev[2] = context[ev[2]]);

				$el && $el.on(ev[0], ev[1], function(e) {
					ev[2].apply(context, arguments);
				});
			});
		}

	View.fn.undelegateEvents = Page.fn.undelegateEvents = 
		function() {
			this.$el && this.$el.off();
		}

	app.plugin.domevent = {
		onPageStartup : function(page, options) {
			page.delegateEvents(page.events);
		},

		onPageTeardown : function(page, options) {
			page.undelegateEvents();
		},

		onViewRender : function(view, options) {
			if (!view._isDelegateEvents) {
				view._isDelegateEvents = true;
				view.delegateEvents(view.events);
			}
		},

		onViewDestory : function(view, options) {
			view.undelegateEvents();
			view._isDelegateEvents = false;
		}
	}
})(window, window['app'])