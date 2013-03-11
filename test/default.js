(function(app, undef) {

	var detailApp = app.page.define({
		name : 'default',
		title : '请搜索商品',
		template : './default.tpl',
		buttons : [
			{
				type : 'back',
				text : '返回'
			}
		],

		_pid : 0,

		ready : function(navigation) {
			var that = this,
				content = $(app.getContentElement())
				;

			// implement super.ready
			navigation.fill({}, function() {
				content.find('#J_searchForm').on('submit', function(e) {
					var word = content.find('#J_searchForm .bton-keyword').val()
						;

					e.preventDefault();
					navigation.push('list/' + encodeURIComponent(word) + '/');
				});
			});
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);