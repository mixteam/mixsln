function testView() {
	var DemoView = app.module.View.extend({
			name: 'demo',
			el: '.viewport .content .active',

			render: function(callback) {
				this.el.innerHTML = 'demo view';
			},

			destory: function(callback) {
				this.el.innerHTML = '';
			}
		}),
		demo = new DemoView()
		;


	demo.render();
	console.log($('.viewport .content .active').html())

	demo.$el = $('.viewport .content .inactive');
	demo.render();
	console.log($('.viewport .content .inactive').html())

	demo.destory();
	console.log($('.viewport .content .active').html());
	console.log($('.viewport .content .inactive').html());
}