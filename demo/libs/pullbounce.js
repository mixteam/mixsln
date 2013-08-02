(function(win, app){
	var doc = win.document,
		config = app.config,
		bounceHeight = 50;

	app.plugin.pullbounce = {
		_options : null,
		_page : null,
		_pullType : false,

		_onPullStart: function() {
			var page = this._page,
				options = this._options,
				wrap = page.el.parentNode;

			options.onPullDown && (wrap.querySelector('#J_pullRefresh').style.visibility = 'visible');
			options.onPullUp && (wrap.querySelector('#J_pullUpdate').style.visibility = 'visible');
		},

		_onPullDown: function(offset) {
			var page = this._page,
				span = page.el.parentNode.querySelector('#J_pullRefresh span'),
				text = span.innerText
				;

			if (offset > 50 && text !== '松开即刷新') {
				span.innerText = '松开即刷新';
			} else if (offset < 50 && text !== '下拉可刷新'){
				span.innerText = '下拉可刷新';
			}
		},

		_onPullUp: function(offset) {
			var page = this._page,
				span = page.el.parentNode.querySelector('#J_pullUpdate span'),
				text = span.innerText
				;

			if (offset > 50 && text !== '松开即加载更多') {
				span.innerText = '松开即加载更多';
			} else if (offset < 50 && text !== '上拉可加载更多'){
				span.innerText = '上拉可加载更多';
			}
		},

		_onPullEnd: function() {
			app.scroll.refresh();
			app.scroll.resumeBounce();
		},

		handleEvent: function(e) {
			var that = this,
				page = this._page,
				options = this._options,
				offset = app.scroll.getBoundaryOffset()
				;

			if (e.type === 'panstart') {
				this._onPullStart();
			} else if (e.type === 'pulldown') {
				if (offset > bounceHeight) {
					this._pullType = 'PullDown';
				} else {
					this._pullType = false;
				}
				this._onPullDown(offset);
			} else if (e.type === 'pullup') {
				if (offset > bounceHeight) {
					this._pullType = 'PullUp';
				} else {
					this._pullType = false;
				}
				this._onPullUp(offset);
			} else if (e.type === 'panend') {
				if (offset && this._pullType) {
					app.scroll.stopBounce();

					setTimeout(function() {
						var func = options['on' + that._pullType];

						if (typeof func === 'string') {
							func = page[func];
						}

						if (func) {
							func.call(page, that._onPullEnd);
						} else {
							that._onPullEnd();
						}
					}, 400);
				}
			}
		},

		onAppStart: function() {
			var ss = doc.styleSheets[0];

			ss.addRule('#J_pullRefresh, #J_pullUpdate', [
				  'visibility: hidden;',
				  'width: 100%;',
				  'padding: 10px;',
				  'height: ' + bounceHeight +'px;',
				  'line-height: 30px;',
				  'box-sizing: border-box;',
				  'background-color: #FFF;',
				  'font-size: 12px;',
				  'color: #999;'
			].join(''));
		},

		onPageDefine: function(page, options) {
			page.scroll = {
				bounceTop: options.onPullDown?bounceHeight:0,
				bounceBottom: options.onPullUp?bounceHeight:0
			}
		},

		onPageStartup: function(page, options) {
			page.el.innerHTML = (options.onPullDown?'<section id="J_pullRefresh"><span>下拉可刷新</span></section>':'') + 
								'<section id="J_pullContent"></section>' + 
								(options.onPullUp?'<section id="J_pullUpdate"><span>上拉可加载更多</span></section>':'');

			page.el = page.el.querySelector('#J_pullContent');
		},

		onPageShow: function(page, options) {
			if (page.el.getAttribute('id') !== 'J_pullContent') {
				page.el = page.el.querySelector('#J_pullContent');
			}

			this._page = page;
			this._options = options;
			this._pullType = false;

			options.onPullDown && app.scroll.addEventListener('pulldown', this, false);
			options.onPullUp && app.scroll.addEventListener('pullup', this, false);
			app.scroll.addEventListener('panstart', this, false);
			app.scroll.addEventListener('panend', this, false);
		},

		onPageHide: function(page, options) {
			options.onPullDown && app.scroll.removeEventListener('pulldown', this, false);
			options.onPullUp && app.scroll.removeEventListener('pullup', this, false);
			app.scroll.removeEventListener('panstart', this, false);
			app.scroll.removeEventListener('panend', this, false);
		}
	}
})(window, window['app']);