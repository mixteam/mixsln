function testPage() {
	var data = {a:1,b:2},
		page = app.module.Page.define({
			name: 'demo',
			startup: function() {
				log('startup');

				this.navigation.push('demo1', {
					type: 'GET',
					data: data
				});
				this.navigation.pop();
				log(this.navigation.getParameter('a'));
				log(this.navigation.getData('a'));
				this.navigation.setData('b', 2);
				this.navigation.setTitle('demo');
				this.navigation.setButton({type:'back'});
				this.content.fill('abcd');

				this.trigger('show');
			},
			teardown: function() {
				log('teardown');
			}
		}), 
		pm = app.module.MessageScope.get('page')
		;

	pm.on('navigation:push', function(fragment, options) {
		log('push', fragment, options);
	});

	pm.on('navigation:pop', function(fragment, options) {
		log('pop');
	});

	pm.on('navigation:getParameter', function(name) {
		log('getParameter', name, data[name]);
		pm.trigger('navigation:getParameter:callback', data[name]);
	});

	pm.on('navigation:getData', function(name) {
		log('getData', name, data[name]);
		pm.trigger('navigation:getData:callback', data[name]);
	});

	pm.on('navigation:setData', function(name, value) {
		log('setData', name, value);
	});

	pm.on('navigation:setTitle', function(title) {
		log('setTitle', title);
	});

	pm.on('navigation:setButton', function(options) {
		log('setButton', options);
	});

	pm.on('content:fill', function(html) {
		log('fill', html);
	});

	page.on('show', function() {
		log('show');
	});

	page.startup();


}