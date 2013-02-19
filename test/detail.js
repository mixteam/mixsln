(function(app, undef) {

	var detailApp = app.init({
		name : 'detail',
		title : '商品详情',
		route : 'detail\\/(P<pid>\\d+)\\/?',

		header : {
			template : 'titlebar',

			buttons : [
				{
					type : 'backStack',
					text : '返回',
					autoHide : true
				},
				{
					type : 'rightExtra',
					text : '查看评论',
					handler : function(e) {
						alert('TODO');
					}
				}
			]
		},

		_pid : 0,

		_fillContent : function () {
			var that = this,
				viewport = app.getViewport()
				;

			viewport.innerHTML = '<center>这是' + that._pid + '号商品的详情</center>';
		},

		ready : function(state) {
			// implement super.ready
			var that = this
				;

			that._pid = state.params['pid'];
			that._fillContent();
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);