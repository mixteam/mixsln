function testPage() {
	var page = app.module.Page.define({
			name: 'demo',
			startup: function() {
				console.log('startup');

				this.navigation.push('demo1', {
					type: 'GET',
					data: {a:1, b:2}
				});
				this.navigation.pop();
				console.log(this.navigation.getParameter('a'));
				console.log(this.navigation.getData('a'));
				this.navigation.setData('b', 2);
				this.navigation.setTitle('demo');
				this.navigation.setButton({type:'back'});
				this.viewport.fill('abcd');

				this.trigger('show');
			},
			teardown: function() {
				console.log('teardown');
			}
		}), 
		pm = app.module.MessageScope.get('page')
		;

	pm.on('navigation:push', function(fragment, options) {
		console.log('push', fragment, options);
	});

	pm.on('navigation:pop', function(fragment, options) {
		console.log('pop');
	});

	pm.on('navigation:getParameter', function(name) {
		console.log('getParameter', name);
		pm.trigger('navigation:getParameter:callback', 1);
	});

	page.on('show', function() {
		console.log('show');
	});

	page.startup();


}