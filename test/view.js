function testView() {
	var DemoView = app.module.View.extend({
			name: 'demo',
			el: 'div',

			render: function(callback) {
				this.el.innerHTML = 'remder demo view';
			},

			destory: function(callback) {
				this.el.innerHTML = 'destory demo view';
			}
		}),
		demo = new DemoView()
		;


	$('.viewport .active').html('').append(demo.el);
	demo.render();
	log(demo.$el.html())

	demo.destory();
	log(demo.$el.html());
}