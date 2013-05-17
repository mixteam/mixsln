(function(app, undef) {

	app.page.define({
		name : 'default',
		title : '请搜索商品',
		template : './pages/default/default.tpl',
		buttons : [
			{
				type : 'back',
				text : '返回'
			}
		],
		plugins: {
			domevent: true
		},
		events : [
			['submit', '#J_searchForm', '_submitFormHandler']
		],

		_pid : 0,

		_submitFormHandler : function(e, that) {
			e.preventDefault();

			var word = that.viewport.$el.find('#J_searchForm .bton-keyword').val()
				;

			that.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		ready : function() {
			// implement super.ready
			var html = this.renderTemplate({});

			this.viewport.fill(html);
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);