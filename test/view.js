function testView() {
	var DemoView = app.module.View.extend({
			name: 'demo',
			el: '.viewport .active',

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
	log($('.viewport .active').html())

	demo.$el = $('.viewport .inactive');
	demo.render();
	log($('.viewport .inactive').html())

	demo.destory();
	log($('.viewport .active').html());
	log($('.viewport .inactive').html());
}