(function(app, undef) {
	var listApp = app.init({
		name : 'list',
		title : '商品列表',
		route : 'list\\/?',

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
					text : '加50条',
					handler : function(e) {
						listApp.increase();
					}
				}
			]
		},

		_listCount : 50,

		_fillContent : function () {
			var that = this,
				count = that._listCount,
				viewport = app.getViewport(),
				html = ''
				;

			for (var i = 1; i <= count; i++) {
				html += '<li id="pid-' + i + '"><a href="javascript:void(0)">共有' + count + '个商品，这是第' + i + '个</a></li>';
			}

			viewport.innerHTML = '<ol>' + html  + '</ol>';

			Object.each(viewport.querySelectorAll('li a'), function(anchor) {
				anchor.addEventListener('click', function(e) {
					var el = this
						;

					e.preventDefault();

					app.forward('detail/' + el.parentNode.id.split('-')[1]);
				}, false);
			});
		},

		ready : function(state) {
			// implement super.ready
			this._fillContent();
		},

		unload : function() {
			// implement super.unload
		},


		increase : function() {
			var that = this;

			that._listCount += 50;
			that._fillContent();
		}
	});

})(window['app']);