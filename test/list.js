(function(app, undef) {
	var listApp = app.init({
		name : 'list',
		title : '商品列表',
		route : 'list\\/?',
		template : './list.tpl',
		buttons : [
			{
				type : 'backStack',
				text : '返回',
				autoHide : true
			},
			{
				type : 'rightExtra',
				text : '加50条',
				handler : function(e) {
					listApp.increase();
				}
			}
		],
		_navigation : null,
		_listCount : 50,

		_loadDatas : function(callback) {
			var that = this,
				count = that._listCount,
				datas = {count : count, list : []}
				;

			for (var i = 0; i < count; i++)  {
				datas.list.push(i + 1);
			}

			callback(datas);
		},

		_fillContent : function() {
			var that = this,
				navigation = that._navigation;

			that._loadDatas(function(datas) {
				navigation.fill(datas, function() {
					that._bindEvents();
				});
			});	
		},

		_bindEvents : function() {
			var that = this,
				navigation = that._navigation,
				viewport = app.getViewport()
				;

			// implement super.ready
			Object.each(viewport.querySelectorAll('li a'), function(anchor) {
				anchor.addEventListener('click', function(e) {
					var el = this
						;
					e.preventDefault();
					navigation.push('detail/' + el.parentNode.id.split('-')[1]);
				}, false);
			});
		},

		ready : function(navigation) {
			// implement super.load
			var that = this
				;

			that._navigation = navigation;
			that._fillContent();
		},

		unload : function() {
			// implement super.unload
		},

		increase : function() {
			var that = this,
				navigation = that._navigation;

			that._listCount += 50;
			that._fillContent();
		}
	});

})(window['app']);