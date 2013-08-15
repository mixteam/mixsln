(function(app, undef){

	app.extendView({
		parent: 'slideview',
		name: 'comment',
		el: 'div',

		render: function(searchWord) {
			this.$el.css({
				'background': '#FFF',
				'min-height': '100%'
			});
			var html = '';
			for (var i = 0; i < 100; i++) {
				html += '<li>评论' + (i + 1) + '</li>';
			}
			this.$el.html('<ul>' + html + '</ul>');

			this.allCommView = app.getView('allComment');
			this.allCommView.render();
		},

		show: function() {
			var that = this;

			app.navigation.setTitle('评论');

			app.navigation.setButton({
				type: 'func',
				text: '全部评论',
				handler: function() {
					that.allCommView.slideIn();
				}
			});
		},

		destroy: function() {
			//
		}
	});

	app.extendView({
		parent: 'slideview',
		name: 'allComment',
		el: 'div',

		render: function(searchWord) {
			this.$el.css({
				'background': '#FFF',
				'min-height': '100%'
			});
			var html = '';
			for (var i = 0; i < 10; i++) {
				html += '<li>全部评论' + (i + 1) + '</li>';
			}
			this.$el.html('<ul>' + html + '</ul>');
		},

		show: function() {
			var that = this;

			app.navigation.setTitle('全部评论');

			app.navigation.setButton({
				type: 'func',
				text: '关闭',
				handler: function() {
					that.close();
				}
			});
		},

		destroy: function() {
			//
		}
	});
	
})(window['app']);