(function(win, wv) {
	if (!wv) return;
	var doc = win.document;

	function wrapSuccess(callback) {
		return function(e) {
			callback && callback(e);
		}
	}

	function wrapFailure(callback) {
		return function(e) {
			callback && callback(e);
		}
	}

	function indexOf(list, e) {
		for (var i = 0; i < list.length; i++) {
			if (e === list[i]) return i;
		}
		return -1;
	}

	wv.api = {};

	wv.api.navigation = (function() {
		var btnmap = {}, idmap = {};

		win.addEventListener(window.onpagehide?'pagehide':'unload', function() {
			wv.api.navigation.reset()
		}, false);

		doc.addEventListener('navigation.btn', function(e) {
			var param = e.param,
				id = param.id,
				btn = btnmap[id];

			if (btn) {
				btn.handler(e);
			}
		}, false);

		return {
			ready: function(callback) {
				var p = {};
				wv.call('TBNavigationBar', 'isReady', p, wrapSuccess(callback), wrapFailure());
			},

			setTitle: function(title) {
				var p = {
					title : title
				};
				wv.call('TBNavigationBar', 'setNavigationTitle', p, wrapSuccess(), wrapFailure());
			},

			setButton: function(options) {
				var p = {
					id: idmap[options.id] || Math.floor(Math.random() * 1024) + Object.keys(btnmap).length * 10000,
					type: options.type || '',
					text: options.text || '',
					hide: !!options.hide
				}
				idmap[options.id] = p.id;
				btnmap[p.id] = options;

				wv.call('TBNavigationBar', 'setNavigationButton', p, wrapSuccess(), wrapFailure());
			},

			switch: function(title, type) {
				var p = {
					title : title,
					type : type
				};

				wv.call('TBNavigationBar', 'setNavigationBar', p, wrapSuccess(), wrapFailure());
			},

			reset: function(callback) {
				var p = {};
				wv.call('TBNavigationBar', 'resetNavigationBar', p, function(e){
					callback && callback();
				}, wrapFailure());
			}
		}
	})();

	wv.api.view = (function() {
		var pullDownHandler = [],
			pullUpHandler = [];


		doc.addEventListener('view.pulldown', function(e) {
			pullDownHandler.forEach(function(func) {
				func(e);
			});
		}, false);

		doc.addEventListener('view.pullup', function(e) {
			pullUpHandler.forEach(function(func) {
				func(e);
			});
		}, false);

		return  {
			showLoading: function(text) {
				var p = {
					text: text
				};
				wv.call('WVView', 'showLoading', p, wrapSuccess(), wrapFailure());
			},
			hideLoading: function() {
				var p = {};
				wv.call('WVView', 'hideLoading', p, wrapSuccess(), wrapFailure());
			},
			onPulldown: function(handler) {
				if (pullDownHandler.length === 0) {
					var p = {
						on: true
					};
					wv.call('WVView', 'listeningPulldown', p, wrapSuccess(), wrapFailure());
				}

				if (indexOf(pullDownHandler, handler) < 0)
					pullDownHandler.push(handler);
			},
			onPullup: function(handler) {
				if (pullUpHandler.length === 0) {
					var p = {
						on: true
					};
					wv.call('WVView', 'listeningPullup', p, wrapSuccess(), wrapFailure());
				}
				if (indexOf(pullUpHandler, handler) < 0)
					pullUpHandler.push(handler);
			},
			offPulldown: function(handler) {
				if (!handler) {
					pullDownHandler = [];
				} else {
					var index;
					if ((index = indexOf(pullDownHandler, handler)) >=0) {
						pullDownHandler.splice(index, 1);
					}
				}
				if (pullDownHandler.length === 0) {
					var p = {
						on: false
					};
					wv.call('WVView', 'listeningPulldown', p, wrapSuccess(), wrapFailure());
				}
			},
			offPullup: function(handler) {
				if (!handler) {
					pullUpHandler = [];
				} else {
					var index;
					if ((index = indexOf(pullUpHandler, handler)) >=0) {
						pullUpHandler.splice(index, 1);
					}
				}
				if (pullUpHandler.length === 0) {
					var p = {
						on: false
					};
					wv.call('WVView', 'listeningPullup', p, wrapSuccess(), wrapFailure());
				}
			},
			resetPulldown: function() {
				var p = {};
				wv.call('WVView', 'resetPulldown', p, wrapSuccess(), wrapFailure());
			},
			resetPullup: function() {
				var p = {};
				wv.call('WVView', 'resetPullup', p, wrapSuccess(), wrapFailure());
			}
		}
	})();


	wv.api.camera = (function() {
		return {
			open: function(callback) {
				var p = {};
				wv.call('test', 'test', p, wrapSuccess(), wrapFailure());
			}
		}
	})();

	wv.api.motion = (function() {
		var shakeHandler = [];

		doc.addEventListener('motion.shake', function(e) {
			shakeHandler.forEach(function(func) {
				func(e);
			})
		}, false);

		return {
			onShake: function(handler) {
				if (shakeHandler.length === 0) {
					var p = {
						on: true
					};
					wv.call('WVMotion', 'listeningShake', p, wrapSuccess(), wrapFailure());
				}

				if (indexOf(shakeHandler, handler) < 0)
					shakeHandler.push(handler);
			},
			offShake: function(handler) {
				if (!handler) {
					shakeHandler = [];
				} else {
					var index;
					if ((index = indexOf(shakeHandler, handler)) >=0) {
						shakeHandler.splice(index, 1);
					}
				}
				if (shakeHandler.length === 0) {
					var p = {
						on: false
					};
					wv.call('WVMotion', 'listeningShake', p, wrapSuccess(), wrapFailure());
				}
			}
		}
	})();

	wv.api.geolocation = (function() {
		return {
			get: function(callback) {
				var p = {}
				wv.call('WVLocation', 'getLocation', p, wrapSuccess(callback), wrapFailure());
			},
			search: function(addrs, callback) {
				var p = {
					addrs: addrs
				}
				wv.call('WVLocation', 'searchLocation', p, wrapSuccess(callback), wrapFailure());
			}
		}
	})();

	wv.api.cookies = (function() {
		return {
			read: function(url, callback) {
				var p = {
					url: url
				};
				wv.call('WVCookie', 'readCookies', p, wrapSuccess(callback), wrapFailure());
			},

			write: function(name, value, options, callback) {
				if (arguments.length === 3 && typeof arguments[2] === 'function') {
					callback = arguments[2];
					options = {};
				}

				var p = {
					name: name,
					value: value
				};

				for (var k in options) {
					p[k] = options[k];
				}

				wv.call('WVCookie', 'writeCookies', p, wrapSuccess(callback), wrapFailure());
			}
		}
	})();

	
})(window, window['WindVane']);