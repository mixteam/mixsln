(function(app, undef) {
	var count,
		scrollEl = document.querySelector('.scrollport')
		;

	app.init({
		name : 'demo1',
		routes : {
			'count' : {
				'text' : '(P<listCount>\\d+)',

				'callback' : function(state) {
					count = parseInt(state.params['listCount']);

					fillContent();				
				}
			},

			'default' : {
				'callback' : function(state) {
					count = 50;

					fillContent();
				},

				'default' : true
			}
		},

		_fillContent :function () {
			var html = '';

			for (var i = 0; i < count; i++) {
				html += '<li>这里有' + count + '条记录哦~~~！！！！</li>';
			}

			scrollEl.innerHTML = '<ol>' + html  + '</ol>';
		},

		ready : function() {
			document.querySelector('.navibar .function')
				.addEventListener('click', function(e) {
					app.navigate.forward(count +  50);
					e.preventDefault();
					return false;
				});
		}
	});

	app.router.start();


})(window['app']);