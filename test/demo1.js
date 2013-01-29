require('mix/sln/0.1.0/app-debug');

(function(app, undef) {
	var count;

	function fillContent() {
		var html = '';

		for (var i = 0; i < count; i++) {
			html += '<li>这里有' + count + '条记录哦~~~！！！！</li>';
		}

		document.querySelector('.viewport .scrollport').innerHTML = '<ol>' + html  + '</ol>';
	}

	app.init({
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
		contros : {
			back : document.querySelector('.navibar .back'),
			scroll : document.querySelector('.viewport .scrollport')
		}
	});

	document.querySelector('.navibar .function')
		.addEventListener('click', function(e) {
			app.forward(count +  50);
			e.preventDefault();
			return false;
		});

})(window['app']);