(function(app, undef) {
	var scrollEl = document.querySelector('.scrollport')
		;

	app.init({
		name : 'demo1',

		routes : {
			'count' : {
				'text' : '(P<listCount>\\d+)',
				'callback' : 'renderList'
			},

			'default' : {
				'callback' : 'renderDefaultList'
			}
		},

		_listCount : 0,

		_fillContent : function () {
			var that = this,
				count = that._listCount,
				html = ''
				;

			for (var i = 0; i < count; i++) {
				html += '<li>这里有' + count + '条记录哦~~~！！！！</li>';
			}

			scrollEl.innerHTML = '<ol>' + html  + '</ol>';
		},

		ready : function(state) {
			var that = this
				;

			document.querySelector('.navibar .function')
				.addEventListener('click', function(e) {
					app.navigate.forward(that._listCount +  50);
					e.preventDefault();
					return false;
				});
		},

		unload : function() {

		},

		renderList : function(state) {
			var that = this
				;

			that._listCount = parseInt(state.params['listCount']);
			that._fillContent();				
		},

		renderDefaultList : function() {
			var that = this
				;

			that._listCount = 50;
			that._fillContent();
		}
	});

	app.router.start();


})(window['app']);