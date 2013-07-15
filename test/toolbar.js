function testToolbar() {
	var Toolbar = app.module.Toolbar,
		activeEl = document.querySelector('.viewport .active');

	activeEl.innerHTML = '<button class="hide">隐藏</button><button class="show">显示</button><footer style="background-color:#EEE"></footer>';

	var tb = new Toolbar(activeEl.querySelector('footer'));

	activeEl.querySelector('button.hide').addEventListener('click', function() {
		tb.hide();
	});

	activeEl.querySelector('button.show').addEventListener('click', function() {
		tb.show('<div>' + new Date() + '</div>', {height: 100});
	});


}