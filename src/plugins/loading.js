;(function(win, app) {
	var doc = win.document,
		config = app.config,
		id, ids = [], wrap, item;

	app.plugin.loading = {
		show: function(text) {
			if (text) {
				item.innerHTML = text;

				if (wrap.style.display !== 'block') {
					wrap.style.display = 'block';
					var bodyRect = document.body.getBoundingClientRect();
					var spanRect = item.getBoundingClientRect();
					item.style.left = (bodyRect.width - spanRect.width) / 2 + 'px';
					item.style.top = ((window.innerHeight - spanRect.height) / 2 - bodyRect.top) + 'px';
				}
			}

			var now = Date.now();
			ids.push(now);
			return now;
		},

		hide: function(_id) {
			if (_id) {
				ids.splice(ids.indexOf(_id), 1);
			} else {
				ids = [];
			}

			if (ids.length === 0) {
				item.innerHTML = '';
				wrap.style.display = 'none';
			}
		},

		onAppStart: function() {
			wrap = document.createElement('div');
			wrap.className = 'loading';
			wrap.style.cssText = [
				'display: none', 
				'background: transparent', 
				'position: absolute',
				'width: 100%', 
				'height: 100%', 
				'left: 0', 
				'top: 0',
				'overflow: hidden', 
				'z-index: 99999'
			].join(';');
			item = document.createElement('div');
			item.style.cssText = [
				'position:absolute',
				'width: 100px',
				'height: 90px',
				'line-height: 100px',
				'background-color: rgba(0,0,0,0.5)',
				'color: #FFF',
				'text-align: center',
				'font-size: 11px',
				'border-radius: 13px'
			].join(';');
			wrap.appendChild(item);
			doc.body.appendChild(wrap);
		},

		onNavigationSwitch: function() {
			id = this.show('正在加载');
		},

		onDomReady: function() {
			this.hide(id);
		}
	}


})(window, window['app'])