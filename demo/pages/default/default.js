(function(app, undef) {

	app.definePage({
		name : 'default',
		title : '请搜索商品',
		template : './pages/default/default.tpl',
		buttons : [
			{
				type: 'back',
				text: '淘宝网',
				autoHide: false,
				handler: function(e) {
					location.href = 'http://www.taobao.com'
				}
			}
		],
		plugins: {
			domevent: true
		},
		events : [
			['submit', '#J_searchForm', '_submitFormHandler']
		],

		_submitFormHandler : function(e) {
			e.preventDefault();

			var word = this.content.$el.find('#J_searchForm .bton-keyword').val()
				;

			this.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		startup : function() {
			// implement super.startup
			var that = this;
			this.template({}, function(html) {
				that.content.html(html);
			});
		},

		teardown : function() {
			// implement super.teardown
		}
	});

})(window['app']);