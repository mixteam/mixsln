(function(win, app) {
	var doc = win.document,
		Transition = app.module.Transition,
		Scroll = app.module.Scroll,
		navigation = app.module.Navigation.instance,
		stack = navigation.getStack(), state,
		config = app.config,
		slideWrap, slideWrapWidth, slideStack = [];

	app.extendView({
		name: 'slideview',

		slideIn: function() {
			var that = this,
				wrap = document.createElement('div'),
				lastSlide = slideStack[slideStack.length - 1]

			wrap.style.cssText = 'z-index:' + (slideStack.length + 10) + ';position:absolute;width:100%;height:100%;left:0;top:0;background:#FFF;';
			wrap.appendChild(this.el);
			slideWrap.appendChild(wrap);

			if (slideStack.length === 0) {
				var headerHeight = 0, footerHeight = 0, contentHeight = doc.body.getBoundingClientRect().height;
				if (config.enableNavbar) {
					headerHeight = config.enableNavbar.wrapEl.getBoundingClientRect().height;
				}
				if (config.enableToolbar) {
					footerHeight = config.enableToolbar.wrapEl.getBoundingClientRect().height;
				}
				if (config.enableScroll) {
					contentHeight = window.innerHeight;	
				}
				slideWrap.style.height = (contentHeight - headerHeight - footerHeight) + 'px';
				slideWrap.style.top = (headerHeight + window.scrollY) + 'px';
				slideWrap.style.display = '';
				slideWrapWidth = slideWrap.getBoundingClientRect().width;
			}

			// if (lastSlide) {
			// 	lastSlide.view.hide && lastSlide.view.hide();
			// }

			slideStack.push({
				lastHeader: {
					title: state.pageMeta.title,
					buttons: state.pageMeta.buttons
				},
				wrap: wrap,
				view: this
			});

			app.navigation.resetNavbar();

			Transition.slide(wrap, 'RI', slideWrapWidth, function() {
				if (lastSlide) {
					lastSlide.wrap.style.display = 'none';
				}

				app.navigation.setButton({
					type: 'back',
					text: '返回',
					handler: function() {
						that.slideOut();
					}
				});

				if (config.enableScroll) {
					Scroll.enable(that.el);
				}

				that.show && that.show();
			});
		},

		slideOut: function() {
			var that = this,
				slide = slideStack.pop(),
				wrap = slide.wrap,
				lastHeader = slide.lastHeader,
				lastSlide = slideStack[slideStack.length - 1];

			if (lastSlide) {
				lastSlide.wrap.style.display = '';
			}

			Transition.slide(wrap, 'RO', slideWrapWidth, function() {
				slideWrap.removeChild(wrap);
				that.hide && that.hide();

				app.navigation.resetNavbar();
				app.navigation.setTitle(lastHeader.title);
				app.navigation.setButton(lastHeader.buttons);

				// if (lastSlide) {
				// 	lastSlide.view.show && lastSlide.view.show();
				// }	

				if (slideStack.length === 0) {
					slideWrap.style.display = 'none';
				}
			});
		},

		close: function() {
			var that = this,
				slide = slideStack.pop(),
				wrap = slide.wrap;

			Transition.slide(wrap, 'RO', slideWrapWidth, function() {
				while (slideStack.length) {
					slide = slideStack.pop();
					slide.view.hide && slide.view.hide();
				}

				var lastHeader = slide.lastHeader;
				app.navigation.resetNavbar();
				app.navigation.setTitle(lastHeader.title);
				app.navigation.setButton(lastHeader.buttons);

				slideWrap.innerHTML = '';
				slideWrap.style.display = 'none';
			});
		}
	});

	app.plugin.slideview = {
		onAppStart: function() {
			slideWrap = document.createElement('div');
			slideWrap.style.cssText = 'z-index:9;display:none;position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0);overflow:hidden;'
			doc.body.appendChild(slideWrap);
		},

		onNavigationSwitch: function() {
			if (slideStack.length && state) {
				var slide = slideStack.shift();

				state.pageMeta.title = slide.lastHeader.title;
				state.pageMeta.buttons = slide.lastHeader.buttons;
				slideWrap.innerHTML = '';
				slideWrap.style.display = 'none';
			}

			state = stack.getState();
		}
	}

})(window, window['app'])