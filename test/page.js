function testPage() {
	var data = {a:1,b:2},
		page = app.module.Page.define({
			name: 'demo',
			startup: function() {
				log('startup');
				this.trigger('show');
			},
			teardown: function() {
				log('teardown');
			}
		})
		;


	page.on('show', function() {
		log('show');
	});
	page.startup();
	page.teardown();
}