function testScroll() {
	var events = ['touchstart', 'panstart', 'pan', 'panend', 'flick', 'pulldown', 'pullup', 'scrollend', 'bouncestart', 'bounceend', 'panbounce'],
		viewportEl = document.querySelector('.viewport')
		activeEl = document.querySelector('.viewport .active'),
		html1 = []
		;

	viewportEl.style.cssText = 'background-color:#000; overflow:hidden;';
	activeEl.style.cssText = 'color:black; border:1px solid #ccc; width:100%; height:100%; overflow:hidden;'


	for (var i = 0; i < 50; i++) {
		html1.push('<div style="height:25px;">' + i + '</div>');
	}


	activeEl.innerHTML = '<section>' + html1.join('') + '</section>';
	

	var scrollEl1 = activeEl.querySelector('section')
		;

	scrollEl1.style.cssText = '-webkit-backface-visibility: hidden; -webkit-transform-style: preserve-3d; background-color: #CCC;';

	events.forEach(function(name) {
		scrollEl1.addEventListener(name, function(event) {
			log(name);
		}, false);
	});

	app.module.Scroll.enable(scrollEl1);
	scrollEl1.refresh();
}