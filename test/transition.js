function testTransition() {
	var transition = app.module.Transition,
		viewportEl = document.querySelector('.viewport')
		activeEl = document.querySelector('.viewport .active'),
		funcs = ['slide', 'float'],
		types = ['LI', 'LO', 'RI', 'RO', 'TI', 'TO', 'BI', 'BO']
		;

	viewportEl.style.cssText = 'background-color:#000; overflow:hidden;';
	activeEl.style.cssText = 'background-color:#CCC; width:100%; height:100%; overflow:hidden;';

	function shuffle() {

		var func = funcs[Math.floor(Math.random() * funcs.length)],
			type = types[Math.floor(Math.random() * types.length)],
			offset = (type.match(/^L|R/)?viewportEl.offsetWidth:viewportEl.offsetHeight) / (func === 'float'?10:1)
			;

		log(func, type);
		transition[func](activeEl, type, offset, function() {
			setTimeout(function(){
				activeEl.style.webkitTransition = '';
				activeEl.style.webkitTransform = 'translate(0, 0)';
				activeEl.style.opacity = 1;

				shuffle();
			}, 500);
		});
	}

	shuffle();
}