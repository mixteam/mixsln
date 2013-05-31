function testScroll() {
	var events = ['touchstart', 'panstart', 'pan', 'panend', 'flick', 'scrollend', 'bouncestart', 'bounceend', 'panbounce'],
		viewportEl = document.querySelector('.viewport')
		activeEl = document.querySelector('.viewport .active'),
		inactiveEl = document.querySelector('.viewport .inactive'),
		html1 = [], html2 = []
		;


	viewportEl.style.cssText = 'background-color:#000; width:100%; height:100%; overflow:hidden; display: -webkit-box;';
	activeEl.style.cssText = 'color:black; border:1px solid #ccc; box-sizing: border-box; width:50%; height:100%; -webkit-flex:1; overflow:hidden;'
	inactiveEl.style.cssText = 'color:white; border:1px solid #ccc; box-sizing: border-box; width:50%; height:100%; -webkit-flex:1; overflow:hidden;'
	// 


	for (var i = 0; i < 50; i++) {
		html1.push('<li style="height:25px;">' + i + '</li>');
	}

	for (var i = 0; i < 50; i++) {
		html2.push('<div style="height:25px;">inner-' + i + '</div>');
	}
	activeEl.innerHTML = '<section><div style="height:60px;line-height:60px;background-color:#FFF;">下拉可刷新...</div><ul>' + html1.join('') + '</ul><div style="height:60px;line-height:60px;background-color:#FFF;">上拉可加载更多...</div></section>';
	inactiveEl.innerHTML = '<ul>' + html1.join('') + 
		'<div style="border:1px solid red; margin:10px auto; width:80%; height:500px; overflow:hidden; "><section>' + html2.join('') + '</section></div></ul>';

	var scrollEl1 = activeEl.querySelector('section'),
		scrollEl2 = inactiveEl.querySelector('ul'),
		scrollEl3 = scrollEl2.querySelector('ul section')
		;

	scrollEl1.style.cssText = scrollEl2.style.cssText = scrollEl3.style.cssText = 
		'-webkit-backface-visibility: hidden; -webkit-transform-style: preserve-3d;';
	scrollEl1.style.backgroundColor = '#CCC';
	scrollEl2.style.backgroundColor = '#999';
	scrollEl3.style.backgroundColor = '#333';

	events.forEach(function(name) {
		scrollEl2.addEventListener(name, function(event) {
			console.log(name);
		}, false);
	});


	var isUpdate = false;
	scrollEl1.addEventListener('pulldown', function(e) {
		var el = this, offset = el.getBoundaryOffset(), text;

		if (offset > 60) {
			text = '松开即刷新';
			isUpdate = 'pulldown';
		} else {
			text = '下拉可刷新';
			isUpdate = false;
		}
		el.querySelector('div:first-child').innerHTML = text;

	});

	scrollEl1.addEventListener('pullup', function(e) {
		var el = this, offset  = el.getBoundaryOffset(), text;

		if (offset > 60) {
			text = '松开即加载更多';
			isUpdate = 'pullup';
		} else {
			text = '上拉可加载更多';
			isUpdate = false;
		}
		el.querySelector('div:last-child').innerHTML = text;
	});

	scrollEl1.addEventListener('panend', function(e) {
		var el = this, offset = el.getBoundaryOffset(), text;

		if (isUpdate && offset) {
			scrollEl1.stopBounce();
			setTimeout(function(){
				if (isUpdate === 'pulldown') {
					var date = new Date();
					el.querySelector('div:first-child').innerHTML = '最近刷新:' + date.getHours() + ':' + date.getMinutes();
					el.querySelector('ul').innerHTML = html1.join('');

					el.refresh();
				} else if (isUpdate === 'pullup') {
					el.querySelector('div:last-child').innerHTML = '上拉可加载更多';

					var length = el.querySelectorAll('li').length,
						fragment = document.createDocumentFragment();

					for (var i = length; i < length + 50; i++) {
						var li = document.createElement('li');
						li.style.height = '25px';
						li.innerHTML = '' + i;
						fragment.appendChild(li);
					}

					el.querySelector('ul').appendChild(fragment);
					el.refresh();
				}

				scrollEl1.resumeBounce();
			}, 1000);
		} else {
			if (isUpdate === 'pulldown') {
				el.querySelector('div:first-child').innerHTML = '下拉可刷新';
			} else if (isUpdate === 'pullup') {
				el.querySelector('div:last-child').innerHTML = '上拉可加载更多';
			}

		}
	});

	app.module.Scroll.enable(scrollEl1, {
		bounceTop: 60,
		bounceBottom: 60
	});
	scrollEl1.refresh();

	app.module.Scroll.enable(scrollEl2);
	scrollEl2.refresh();
	scrollEl2.scrollTo(200);

	app.module.Scroll.enable(scrollEl3);
	scrollEl3.refresh();
}