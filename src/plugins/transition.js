(function(win, app){
	var hooks = app.module.MessageScope.get('hooks'),
		config = app.config,
		Page = app.module.Page,
		Animation = app.module.Animation,
		Transition = app.module.Transition, loadingWrapEl, loadingEl;

	hooks.on('app:start', function() {
		loadingWrapEl = document.createElement('div');
		loadingWrapEl.className = 'loading-action';
		loadingEl = document.createElement('div');
		loadingEl.innerHTML = '<span>加载中...</span>';
		loadingWrapEl.appendChild(loadingEl);
		document.body.appendChild(loadingWrapEl);

		hooks.off('transition:begin');
		hooks.on('transition:begin', function(transition, wrapEl) {
			var t = location.search.match(/t=(\d)/)[1];

			switch(t) {
				case '4':
					transition4(transition, wrapEl);
					break;
				case '3':
					transition3(transition, wrapEl);
					break;
				case '2':
					transition2(transition, wrapEl);
					break;
				case '1':
				default:
					transition1(transition, wrapEl);
					break;
			}
		});
	});

	function transition1(transition, wrapEl) {
		var	offsetWidth = wrapEl.offsetWidth, offsetX,
			className = wrapEl.className += ' ' + transition,
			activeEl = wrapEl.querySelector('.active'), nextEl, prevEl
			;

		wrapEl.style.cssText = 'display:-webkit-box;overflow:visible;';

		if (transition === 'backward') {
			prevEl = activeEl.previousSibling;
			offsetX = offsetWidth;

			if (!prevEl) {
				prevEl = wrapEl.querySelector('.inactive:last-child');
				prevEl.style.cssText = 'position:absolute;display:block;left:-' + offsetWidth + 'px';
			} else {
				prevEl.style.cssText = 'position:absolute;display:block;left:-' + offsetWidth + 'px;';
			}
		} else {
			nextEl = activeEl.nextSibling;
			offsetX = -offsetWidth;

			if (!nextEl) {
				nextEl = wrapEl.querySelector('.inactive:first-child');
				nextEl.style.cssText = 'position:absolute;display:block;left:' + offsetWidth + 'px';
			} else {
				nextEl.style.cssText = 'display:block;position:absolute;';
			}
		}

		Transition.move(wrapEl, offsetX, 0, function() {
			config.enableContent.instance.setClassName();
			wrapEl.className = className.replace(' ' + transition, '');
			wrapEl.style.cssText = '';
			(nextEl || prevEl).style.cssText = '';
			hooks.trigger('transition:end');
		});
	}

	function transition2(transition, wrapEl) {
		var	offsetX = wrapEl.offsetWidth * (transition === 'backward'?1:-1),
			className = wrapEl.className += ' ' + transition
			;

		Transition.move(wrapEl, offsetX, 0, function() {
			config.enableContent.instance.setClassName();
			wrapEl.className = className.replace(' ' + transition, '');
			wrapEl.style.webkitTransform = '';
			hooks.trigger('transition:end');
		});
	}

	function transition3(transition, wrapEl) {
		var	offsetWidth = wrapEl.offsetWidth, offsetX,
			className = wrapEl.className += ' ' + transition,
			activeEl = wrapEl.querySelector('.active'), nextEl, prevEl, el
			;

		wrapEl.style.cssText = 'display:-webkit-box;overflow:visible;';

		if (transition === 'backward') {
			prevEl = activeEl.previousSibling;
			offsetX = offsetWidth;

			if (!prevEl) {
				prevEl = wrapEl.querySelector('.inactive:last-child');
				prevEl.style.cssText = 'position:absolute;display:block;left:0;z-index:1;';
				activeEl.style.cssText = 'position:absolute;z-index:2;'
			} else {
				prevEl.style.cssText = 'position:absolute;display:block;';
			}

			el = activeEl;
		} else {
			nextEl = activeEl.nextSibling;
			offsetX = -offsetWidth;

			if (!nextEl) {
				nextEl = wrapEl.querySelector('.inactive:first-child');
				nextEl.style.cssText = 'position:absolute;display:block;left:' + offsetWidth + 'px';
			} else {
				nextEl.style.cssText = 'position:absolute;display:block;';
			}

			el = nextEl;
		}

		Transition.move(el, offsetX, 0, function() {
			config.enableContent.instance.setClassName();
			wrapEl.className = className.replace(' ' + transition, '');
			wrapEl.style.cssText = '';
			activeEl.style.cssText = '';
			(nextEl || prevEl).style.cssText = '';
			hooks.trigger('transition:end');
		});
	}

	function transition4(transition, wrapEl, isHidden) {
		var	rect = wrapEl.getBoundingClientRect(),
			offsetWidth = rect.width,
			offsetHeight = rect.height,
			offsetX = offsetWidth * (transition === 'backward'?1:-1)
			;


		loadingEl.style.cssText = (transition === 'backward'?'right:':'left:') + offsetWidth + 'px';
		loadingWrapEl.style.cssText = 'display:block;left:' + rect.left + 'px;top:' + rect.top + 'px; width:' + offsetWidth + 'px; height:' + offsetHeight + 'px;';

		Transition.move(loadingEl, offsetX, 0, function() {
			config.enableContent.instance.setClassName();
			loadingWrapEl.style.cssText = '';
			hooks.trigger('transition:end');
		});
	}

	app.plugin.transition = true;

})(window, window['app']);