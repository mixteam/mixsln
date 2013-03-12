(function(app, undef) {

	var detailApp = app.page.define({
		name : 'default',
		title : '请搜索商品',
		template : './default/default.tpl',
		buttons : [
			{
				type : 'back',
				text : '返回'
			}
		],

		_pid : 0,

		ready : function() {
			var that = this,
				content = $(app.component.getActiveContent())
				;

			// implement super.ready
			that.fill({}, function() {
				content.find('#J_searchForm').on('submit', function(e) {
					var word = content.find('#J_searchForm .bton-keyword').val()
						;

					e.preventDefault();
					app.navigation.push('list/' + encodeURIComponent(word) + '/');
				});
			});
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);