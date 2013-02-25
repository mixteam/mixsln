(function(app, undef) {

	var detailApp = app.init({
		name : 'detail',
		title : '商品详情',
		route : 'detail\\/(P<pid>\\d+)\\/?',
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
		],

		_pid : 0,

		getTitle : function() {
			// overwrite super.getTitle
			return this._pid +  '号商品的详情';
		},

		loadTemplate : function(callback) {
			// overwrite super.loadTemplate
			var text = '<center>这是{{pid}}号商品的详情</center>';
			callback(text);
		},

		ready : function(navigation) {
			// implement super.load
			var datas = {
					pid : (this._pid = navigation.getParameter('pid'))
				};

			navigation.fill(datas);
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);