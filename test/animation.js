function testAnimation() {
	var anim = app.module.Animation
		;

	var activeEl = document.querySelector('.viewport .active');

	activeEl.style.cssText = 'background-color:#F00; border:1px solid #ccc; width:20px; height:20px;';

	anim.doTransition(activeEl, '0.4s', 'cubic-bezier(' + anim.genCubicBezier(0.1, 2) + ')', 0, 100, 200, function() {
		log(anim.getTransformOffset(activeEl));
	});
}