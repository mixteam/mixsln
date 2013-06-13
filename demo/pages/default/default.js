(function(app, undef) {

	app.definePage({
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

		_submitFormHandler : function(e, that) {
			e.preventDefault();

			var word = that.content.$el.find('#J_searchForm .bton-keyword').val()
				;

			that.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		startup : function() {
			// implement super.ready
			//var html = this.template.render({});

			this.content.html('hello, world');
		},

		teardown : function() {
			// implement super.unload
		}
	});

})(window['app']);