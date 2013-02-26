(function(app, undef) {

	var detailApp = app.init({
		name : 'default',
		title : '请搜索商品',
		route : {
			name : 'default',
			'default' : true
		},
		template : './default.tpl',
		buttons : [
			{
				type : 'backStack',
				text : '返回',
				autoHide : true
			}
		],

		_pid : 0,

		ready : function(navigation) {
			var that = this,
				viewport = $(app.getViewport())
				;

			// implement super.ready
			navigation.fill({}, function() {
				viewport.find('#J_searchForm').on('submit', function(e) {
					var word = viewport.find('#J_searchForm .bton-keyword').val()
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