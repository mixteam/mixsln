(function(app, undef) {
	var comps = app.components
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
				viewport = app.getViewport(),
				html = ''
				;

			for (var i = 0; i < count; i++) {
				html += '<li>这里有' + count + '条记录哦~~~！！！！</li>';
			}

			viewport.innerHTML = '<ol>' + html  + '</ol>';
		},

		_increaseCount : function(e) {
			var that = this,
				count = that._listCount
				;

			app.navigate.forward(count +  50);
			e.preventDefault();
			return false;
		},

		ready : function(state) {
			var that = this,
				button = document.createElement('button')
				;

			button.className = 'increase';
			button.innerText = '加50条';
			button.addEventListener('click', that._increaseCount.bind(that));

			document.querySelector('.navibar').appendChild(button);
		},

		unload : function() {
			var that = this,
				button = document.querySelector('.navibar .increase')
				;

			button.parseNode.removeChild(button);

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