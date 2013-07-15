function testGesture() {
	var events = ['press', 'dualtouchstart', 'panstart', 'horizontalpanstart', 'verticalpanstart',
					'pan', 'verticalpan', 'horizontalpan', 'dualtouch', 'dualtouchend',
					'tap', 'doubletap', 'panend', 'flick', 'verticalflick', 'horizontalflick',
					'pressend', 'zooomstart', 'rotatestart', 'dualpanstart', 'strechstart',
					'pinchstart', 'zoom', 'pinch', 'strech', 'rotate', 'dualpan'
				]
		;

	var srcEl = document.querySelector('.viewport');

	events.forEach(function(name) {
		srcEl.addEventListener(name, function(event) {
			log(name);
		}, false);
	});

	document.body.addEventListener('touchmove', function(e) {
		e.preventDefault();
		return false;
	}, false);
}