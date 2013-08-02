function cookie_get() {
	api.cookies.read('http://m.taobao.com', function(json) {
		alert(JSON.stringify(json));
	});
}

function cookie_set() {
	api.cookies.write('windvane', 'test' + Date.now(), {
		domain: 'm.taobao.com'
	}, function() {
		alert('success');
	})
}