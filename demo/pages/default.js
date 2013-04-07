(function(app, undef) {

	app.page.define({
		name : 'default',
		title : '请搜索商品',
		template : './templates/default.tpl',
		buttons : [
			{
				type : 'back',
				text : '返回'
			}
		],
		events : [
			['submit', '#J_searchForm', '_submitFormHandler']
		],

		_pid : 0,

		_submitFormHandler : function(e, that) {
			var word = that.find('#J_searchForm .bton-keyword').val()
				;

			e.preventDefault();
			app.navigation.push('list/' + encodeURIComponent(word) + '/');
		},

		ready : function() {
			// implement super.ready
			this.fill({});
		},

		unload : function() {
			// implement super.unload
		}
	});

})(window['app']);