function testGesture() {
	var events = ['press', 'dualtouchstart', 'panstart', 'horizontalpanstart', 'verticalpanstart',
					'pan', 'verticalpan', 'horizontalpan', 'dualtouch', 'dualtouchend',
					'tap', 'doubletap', 'panend', 'flick', 'verticalflick', 'horizontalflick',
					'pressend', 'zooomstart', 'rotatestart', 'dualpanstart', 'strechstart',
					'pinchstart', 'zoom', 'pinch', 'strech', 'rotate', 'dualpan'
				]
		;

	var srcEl = document.querySelector('.viewport'),
		logEl = document.querySelector('.viewport .active');

	srcEl.style.cssText = 'background-color:#F00; border:1px solid #ccc; width:100%; height:100%';

	events.forEach(function(name) {
		srcEl.addEventListener(name, function(event) {
			//event.cancelBubble = true;
			console.log(name);
			var html = logEl.innerHTML;
			logEl.innerHTML = name + '<br />' + html;
		}, false);
	});

	document.body.addEventListener('touchmove', function(e) {
		e.preventDefault();
		return false;
	}, false);
}