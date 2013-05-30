function testScroll() {
	var events = ['touchstart', 'panstart', 'pan', 'panend', 'flick'],
		viewportEl = document.querySelector('.viewport')
		scrollEl = document.querySelector('.viewport .active'),
		html = []
		;


	viewportEl.style.cssText = 'background-color:#CCC; width:100%; height:100%; overflowY:hidden;';
	scrollEl.style.cssText = 'background-color:#FFF; border:1px solid #ccc; box-sizing: border-box; width:100%; -webkit-backface-visibility: hidden; -webkit-transform-style: preserve-3d;'

	events.forEach(function(name) {
		scrollEl.addEventListener(name, function(event) {
			console.log(name);
		}, false);
	});

	for (var i = 0; i < 50; i++) {
		html.push('<li style="height:25px;">' + i + '</li>');
	}
	scrollEl.innerHTML = '<ul>' + html.join('') + '</ul>';
	//scrollEl.innerHTML = '<div style="width:100%;height:1000px;"></div>'
	scrollEl.addEventListener('scrollend', function() {
		console.log('scrollend');
	}, false);

	app.module.Scroll.enable(scrollEl);
	scrollEl.refresh();
	//scrollEl.scrollTop = 200;
}