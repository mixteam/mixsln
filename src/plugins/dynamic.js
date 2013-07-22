(function(win, app){
	var doc = win.document,
		aEl = doc.createElement('a'),
		resourcecache = {};

	app.plugin.dynamic = {
		loadResource : function(urls, type, callback) {
			if (arguments.length === 2) {
				if (typeof arguments[1] === 'function') {
					callback = arguments[1];
					type = null;
				}
			}

			if (typeof urls === 'string') {
				urls = [urls];
			}

			function createid() {
				return 'resource-' + Date.now() + '-' + Object.keys(resourcecache).length;
			}

			function createurl(url) {
				return url.indexOf('http') === 0?url:app.config.resourceBase + url;
			}

			function load(url, callback) {
				if (!url) {
					return callback();
				}

				aEl.href = createurl(url);
				var id = resourcecache[aEl.href] || (resourcecache[aEl.href] = createid());

				if (type === 'js' || url.match(/\.js$/)) {
					var script = document.createElement('script'), loaded = false;
					script.id = id;
					script.async = true;
					script.onload = script.onreadystatechange = function() {
						if (!loaded) {
							loaded = true;
							callback && callback(url);
						}
					}
					script.src = url;
					doc.body.appendChild(script);
				} else if (type === 'css' || url.match(/\.css$/)) {
					var link = document.createElement('link');
					link.id = id;
					link.type = 'text/css';
					link.rel = 'stylesheet';
					link.href = url;
					doc.body.appendChild(link);
					callback();
				}
			}

			var u = [];
			urls.forEach(function(url) {
				aEl.href = createurl(url);
				if (!resourcecache[aEl.href]) {
					resourcecache[aEl.href] = createid();
					u.push(url);
				}
			});

			if (this.combo) {
				u = this.combo(u);
				if (typeof u === 'string') {
					u = [u];
				}
			}

			load(u.shift(), function() {
				if (u.length) {
					load(u.shift(), arguments.callee);
				} else {
					callback && callback();
				}
			});

			return true;
		},

		_wrap: function wrap(res, callback) {
			var that = this;

			return function() {
				var context = this,
					args = arguments;
				if (Object.keys(res).length === 0) {
					return callback(context, args);
				}

				if (res.css) {
					res.css && that.loadResource(res.css, 'css');
				}
				if (res.js) {
					that.loadResource(res.js, 'js', function() {
						callback(context, args);
					});
				} else {
					callback(context, args);
				}
			}
		},

		onPageDefine: function(page) {
			var res = page.resources;

			if (res) {
				var startup = page.startup,
					show = page.show;

				page.startup = this._wrap(res, function(context, args) {
					(page.startup = startup).apply(context, args);
					(page.show = show).apply(context, args);
				});
				page.show = function() {}
			}
		},

		onViewExtend: function(View) {
			var that = this,
				proto = View.prototype,
				res = proto.resources;

			if (res) {
				var render = proto.render;	
				proto.render = this._wrap(res, function(context, args) {
					(proto.render = render).apply(context, args);
				});
			}
		}
	}
})(window, window['app'])