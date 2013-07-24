//@require message
//@require navigation
//@require template
//@require view
//@require page
//@require navbar
//@require toolbar
//@require content
//@require scroll
//@require transition


(function(win, app, undef) {

var doc = win.document,	$ = win['$'],
 	appVersion = navigator.appVersion,
	isIOS = (/iphone|ipad/gi).test(appVersion),

	am = app.module,
	Message = am.MessageScope,
	Navigation = am.Navigation,
	navigation = Navigation.instance,
	Template = am.Template,
	View = am.View,
	Page = am.Page,
	Navbar = am.Navbar,
	Toolbar = am.Toolbar,
	Content = am.Content,
	Scroll = am.Scroll,
	Animation = am.Animation,
	Transition = am.Transition,
	pagecache = {},
	pagemeta = {},
	templatecache = {}, 
	resourcecache = {},
	config = app.config = {
		viewport : null,
		templateEngine : null,
		resourceCombo: null,
		resourceBase: './',
		enableMessageLog: false,
		enableContent: true,
		enableNavbar : false,
		enableToolbar : false,
		enableScroll : false,
		enableTransition : false
	};


// Message Initial
var hooks = Message.get('hooks');

// Config Initial
hooks.on('app:start', function() {
	var config = app.config;

	Navbar || (config.enableNavbar = false);
	Toolbar || (config.enableToolbar = false);
	Scroll || (config.enableScroll = false);
	Transition || (config.enableTransition = false);

	Message.isLogging = config.enableMessageLog;

	config.enableNavbar === true && (config.enableNavbar = {});
	config.enableToolbar === true && (config.enableToolbar = {});
	config.enableScroll === true && (config.enableScroll = {});
	config.enableTransition === true && (config.enableTransition = {});
	if (typeof config.enableContent === 'number') {
		config.enableContent = {cacheLength: config.enableContent};
	} else if (config.enableContent instanceof HTMLElement) {
		config.enableContent = {wrapEl: config.enableContent};
	} else if (typeof config.enableContent !== 'object') {
		config.enableContent = {};
	}
});

//DOM Event Initial
if ('onorientationchange' in win) {
	window.addEventListener('onorientationchange', function(e){
		setTimeout(function() {
			hooks.trigger('orientaion:change');
		}, 10);
	}, false);
}
window.addEventListener('resize', function(e){
	setTimeout(function() {
		hooks.trigger('screen:resize');
	}, 10);
});


//View Intial
hooks.on('view:extend', function(view) {
	var render = view.prototype.render,
		destory = view.prototype.destory
		;

	view.prototype.render = function() {
		var that = this, args = arguments;
		checkTemplate(that, 'template', function() {
			hooks.trigger('view:render', that, arguments);
			render.apply(that, args);
		});
	}

	view.prototype.destory = function() {
		hooks.trigger('view:destory', this, arguments);
		destory.apply(this, arguments);
	}
});

//Page Initial
hooks.on('page:define', function(page) {
	var ready = page.ready,
		startup = page.startup,
		teardown = page.teardown,
		show = page.show,
		hide = page.hide,
		isReady = false, persisted = false;

	page.ready = function(state) {
		if (isReady) return;
		hooks.trigger('page:ready', state, page);
		ready.call(page);
		isReady = true;
	}

	page.startup = function(state) {
		hooks.trigger('page:startup', state, page);
		startup.call(page);
	}

	page.show = function(state) {
		hooks.trigger('page:show', state, page);
		show.call(page, persisted);
		persisted = true;
	}

	page.hide = function(state) {
		hooks.trigger('page:hide', state, page);
		hide.call(page, persisted);
	}

	page.teardown = function(state) {
		hooks.trigger('page:teardown', state, page);
		teardown.call(page);
		persisted = false;
	}

	page.html = function(html) {
		this.el.innerHTML = html;
		//config.enableContent.instance.html(html);
	}
});


// Navigation Initial
hooks.on('page:define page:defineMeta', function(page) {
	var name = page.name,
		route = page.route;

	if (navigation.hasRoute(name)) return;

	if (!route) {
		route = {name: name, 'default': true}
	} else if (typeof route === 'string') {
		route = {name: name, text: route}
	}

	navigation.addRoute(route.name, route.text, {
		'default': route['default'],
		callback: route.callback,
		last: route.last
	});
});

// UI Initial
function q(selector, el) {
	el || (el = doc);
	return el.querySelector(selector);
}

function fireEvent(el, eventName) {
	var event = doc.createEvent('HTMLEvents');
	event.initEvent(eventName, true, true);
    el.dispatchEvent(event);
} 

function handlerScrollEvent() {
	if (isIOS) {
		fireEvent(window, 'scrollend');
	} else {
		var scrollY = window.scrollY;
		setTimeout(function(){
			if (window.scrollY === scrollY) {
				fireEvent(window, 'scrollend');
			}
		}, 150);
	}
}

hooks.on('app:start', function() {
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent, i_content,
		c_transition = config.enableTransition,
		c_scroll = config.enableScroll
		;

	config.viewport || (config.viewport = q('.viewport') || doc.body);

	c_content.wrapEl || (c_content.wrapEl = q('.content', config.viewport) || config.viewport);
	c_content.cacheLength || (c_content.cacheLength = (c_content.wrapEl === config.viewport?1:5));
	i_content = c_content.instance = new Content(c_content.wrapEl, {
		cacheLength: c_content.cacheLength
	});

	if (c_navbar) {
		config.viewport.className += ' enableNavbar';
		c_navbar.wrapEl || (c_navbar.wrapEl = q('.navbar', config.viewport));
		c_navbar.instance = new Navbar(c_navbar.wrapEl);
	}

	if (c_toolbar) {
		config.viewport.className += ' enableToolbar';
		c_toolbar.wrapEl || (c_toolbar.wrapEl = q('.toolbar', config.viewport));
		c_toolbar.instance = new Toolbar(c_toolbar.wrapEl, c_toolbar);
	}

	if (c_scroll) {
		config.viewport.className += ' enableScroll';
		c_scroll.wrapEl = i_content.getActive();
	} else {
		window.addEventListener('scroll', handlerScrollEvent, false);
	}

	if (c_transition) {
		config.viewport.className += ' enableTransition';
		c_transition.wrapEl = i_content.getActive().parentNode;
	}
});

//Plugin Initial
hooks.on('app:start', function() {
	for (var name in app.plugin) {
		var plugin = app.plugin[name];
		plugin.onAppStart && plugin.onAppStart();
	}
});

function viewPluginRun(view, funcName) {
	if (view.plugins) {
		for (var name in view.plugins) {
			var plugin = app.plugin[name], pluginOpt = view.plugins[name]
				;

			pluginOpt === true && (pluginOpt = view.plugins[name] = {});
			if (plugin && pluginOpt) {
				plugin[funcName] && plugin[funcName](view, pluginOpt);
			}
		}
	}
}

hooks.on('view:render', function(view) {
	viewPluginRun(view, 'onViewRender');
});

hooks.on('view:destory', function(view) {
	viewPluginRun(view, 'onViewTeardown');
});

function pagePluginRun(state, page, funcName) {
	if (arguments.length === 2) {
		funcName = page;
		page = state;
		state = null;
	}

	if (page.plugins) {
		for (var name in page.plugins) {
			var plugin = app.plugin[name], pluginOpt = page.plugins[name]
				;

			if (plugin && pluginOpt) {
				if (pluginOpt === true) {
					pluginOpt = page.plugins[name] = {};
				}

				if (state) {
					state.plugins[name] || (state.plugins[name] = {});
					for (var p in pluginOpt) {
						if (state.plugins[name][p] == null) {
							state.plugins[name][p] = page.plugins[name][p];
						}
					}
					pluginOpt = state.plugins[name];
				}
				plugin[funcName] && plugin[funcName](page, pluginOpt);
			}
		}
	}
}

hooks.on('page:define', function(page) {
	pagePluginRun(page, 'onPageDefine');
});

hooks.on('page:startup', function(state, page) {
	pagePluginRun(state, page, 'onPageStartup');
});

hooks.on('page:show', function(state, page) {
	pagePluginRun(state, page, 'onPageShow');
});

hooks.on('page:hide', function(state, page) {
	pagePluginRun(state, page, 'onPageHide');
});

hooks.on('page:teardown', function(state, page) {
	pagePluginRun(state, page, 'onPageTeardown');
});

//Template Initial
function checkTemplate(obj, name, callback) {
	var tpl = obj[name];

	if (typeof tpl === 'string') {
		hooks.on('template:loaded', function(_tpl) {
			if (tpl === _tpl) {
				hooks.off('template:loaded', arguments.callee);
				callback && callback();
			}
		});
	} else if (typeof tpl === 'object') {
		for (var name in tpl) {
			checkTemplate(tpl, name, function() {
				var complete = true;
				for (var name in tpl) {
					if (typeof tpl[name] !== 'function') {
						complete = false;
						break;
					}
				}
				if (complete) {
					callback && callback();
				}
			});
		}
	} else {
		callback && callback();
	}
}

function compileTemplate(template, text) {
	template.compile(text);
	return function(datas) {
		return template.render(datas);
	}
}

function preloadTemplate(obj, name) {
	var tpl = obj[name];

	if (typeof tpl === 'string') {
		var template;

		if (templatecache[tpl]) {
			obj[name] = templatecache[tpl];
		} else if (tpl.match(/\.tpl$/g)) {
			template = new Template();
			template.load(tpl, function(text) {
				obj[name] = templatecache[tpl] = compileTemplate(template, text);
				hooks.trigger('template:loaded', tpl);
			});
		} else {
			template = new Template();
			obj[name] = templatecache[tpl] = compileTemplate(template, tpl);
		}
	} else if (typeof tpl === 'object') {
		for (var name in tpl) {
			preloadTemplate(tpl, name);
		}
	}
}

hooks.once('view:extend page:define', function() {
	Template.engine = config.templateEngine || {};
});

hooks.on('view:extend', function(view) {
	if (view.prototype.template) {
		preloadTemplate(view.prototype, 'template');
	}
});

hooks.on('page:define', function(page) {
	if (page.template) {
		preloadTemplate(page, 'template');
	}
});

// forward backwrad Initial
hooks.on('app:start', function(){
	var c_navbar = config.enableNavbar,
		c_toolbar = config.enableToolbar,
		c_content = config.enableContent,
		i_content = c_content.instance,
		c_transition = config.enableTransition,
		c_scroll = config.enableScroll,
		state, page, lastState, lastPage,
		isSamePage = false
		;

	// navbar
	function setNavbar() {
		if (c_navbar) {
			var i_navbar = c_navbar.instance
				title = state.pageMeta.title || page.title,
				buttons = state.pageMeta.buttons || page.buttons
				;

			app.navigation.setTitle(title);
			i_navbar.removeButton();

			if (buttons) {
				buttons.forEach(function(button) {
					var handler = button.handler;

					if (typeof handler === 'string') {
						handler = page[handler];
					}

					if (button.type === 'back') {
						button.hide = (button.autoHide !== false && state.index < 1);
						handler || (handler = function() {
							app.navigation.pop();
						});
					}

					button.handler = function(e) {
						handler && handler.call(page, e, state.index);
					}

					app.navigation.setButton(button);
				});
			} else {
				app.navigation.setButton({
					type: 'back',
					text: 'back',
					hide: state.index < 1?true:false,
					handler: function() {
						app.navigation.pop();
					}
				});
			}

			// 不是同一个页面，且不是第一次页面
			if (!isSamePage && lastPage){
				Transition.float(i_navbar.animWrapEl, state.transition === 'backward'?'LI':'RI', 50);
			}
		}
	}

	// toolbar
	function setToolbar() {
		if (c_toolbar) {
			var i_toolbar = c_toolbar.instance, 
				o_toolbar = state.pageMeta.toolbar || page.toolbar
				;

			c_toolbar.wrapEl.innerHTML = '';

			if (typeof o_toolbar === 'number') {
				o_toolbar = {height: o_toolbar};
			}
			if (o_toolbar) {
				app.navigation.setToolbar(o_toolbar);
				i_toolbar.show();
			} else {
				i_toolbar.hide();
			}
		}
	}

	// content
	function setContent() {
		if (!isSamePage) {		
			state.move === 'backward' ? i_content.previous() : i_content.next();
		}
	}

	function refreshContent() {
		var offsetHeight = c_scroll?config.viewport.offsetHeight:window.innerHeight;
		if (c_navbar) {
			offsetHeight -= c_navbar.wrapEl.offsetHeight;
		}
		if (c_toolbar) {
			offsetHeight -= c_toolbar.wrapEl.offsetHeight;
		}
		if (c_scroll) {
			c_content.wrapEl.style.height = offsetHeight + 'px';
		} else {
			c_content.wrapEl.style.minHeight = offsetHeight + 'px';
			c_content.instance.getActive().style.minHeight = offsetHeight + 'px';
		}

	}

	// scroll
	function setScroll() {
		if (!isSamePage && c_scroll) {
			Scroll.disable(c_scroll.wrapEl);
			c_scroll.wrapEl = i_content.getActive();
			Scroll.enable(c_scroll.wrapEl, page.scroll);
		}
	}

	// transition
	function setTransition() {
		if (!isSamePage) {
			var transition = state.transition;

			// 不是第一次页面
			if (c_transition && lastPage) {
				var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1),
					className = c_transition.wrapEl.className += ' ' + transition
					;

				Transition.move(c_transition.wrapEl, offsetX, 0, function() {
					i_content.setClassName();
					c_transition.wrapEl.className = className.replace(' ' + transition, '');
					c_transition.wrapEl.style.webkitTransform = '';
					hooks.trigger('navigation:switchend', state);
				});
			} else {
				i_content.setClassName();
				hooks.trigger('navigation:switchend', state);
			}
		}
	}

	// plugin
	function setPlugin(funcName) {
		for (var name in app.plugin) {
			var plugin = app.plugin[name];

			if (plugin) {
				state.plugins[name] || (state.plugins[name] = {});
				plugin[funcName] && plugin[funcName](state.plugins[name]);
			}
		}
	}

	// page
	function pageLoad() {
		var meta;
		if ((meta = pagemeta[state.name])) {
			meta.css && app.loadResource(meta.css, 'css');
			meta.js && app.loadResource(meta.js, 'js', function() {
				page = Page.get(state.name);
				page.ready();
				pageReady();
			});
		}
	}

	function pageReady() {
		page.el = i_content.getActive();
		$ && (page.$el = $(page.el));

		setNavbar();
		setToolbar();
		setTransition();
		setScroll();
		refreshContent();

		checkTemplate(page, 'template', pageShow);
	}

	function pageShow() {
		lastPage && lastPage.hide(lastState);

		var curFragment = page.el.getAttribute('data-fragment'), 
			curCache = pagecache[curFragment];

		if (curFragment === state.fragment) {
			page.show(state);
		} else {
			if (curCache) {
				curCache.page.teardown(curCache.state);
				delete pagecache[curFragment];
			}

			pagecache[state.fragment] = {state:state, page:page};
			page.el.innerHTML = '';
			page.el.setAttribute('data-fragment', state.fragment);
			page.startup(state);
			page.show(state);
		}

		lastState = state;
		lastPage = page;
	}

	navigation.on('forward backward', function() {
		state = arguments[0];
		state.pageMeta || (state.pageMeta = {});
		state.plugins || (state.plugins = {});

		isSamePage = lastState && lastState.name === state.name;
		if (!isSamePage) hooks.trigger('navigation:switch', state);
		(page = Page.get(state.name))?pageReady():pageLoad();
	});

	hooks.on('navigation:switch', function() {
		setContent();
		setPlugin('onNavigationSwitch');
	});

	hooks.on('navigation:switchend', function() {
		setPlugin('onNavigationSwitchEnd');
	});

	hooks.after('page:show navigation:switchend', function() {
		setPlugin('onDomReady');
	});

	hooks.on('orientaion:change screen:resize', function() {
		refreshContent();
	});
});

app.start = function(config) {
	for (var p in config) {
		app.config[p] = config[p];
	}
	hooks.trigger('app:start');
	navigation.start();
}

app.setTemplate = function(id, tpl) {
	if (typeof tpl === 'string') {
		templatecache[id] = compileTemplate(new Template(), tpl);
	} else if (typeof tpl === 'function') {
		templatecache[id] = tpl;
	}
}

app.extendView = function(properties) {
	var ChildView = View.extend(properties);
	hooks.trigger('view:extend', ChildView);
	return ChildView;
}

app.getView = function(name) {
	return new (View.get(name));
}

app.definePage = function(properties) {
	var page = Page.define(properties);
	hooks.trigger('page:define', page);
	return page;
}

app.definePageMeta = function(meta)  {
	if (!(meta instanceof Array)) meta = [meta]
	meta.forEach(function(m) {
		pagemeta[m.name] = m;
		hooks.trigger('page:defineMeta', m);
	});
}

app.getPage = function(name) {
	return Page.get(name);
}

var aEl = document.createElement('a');
app.loadResource = function(urls, type, callback) {
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

		url = aEl.href = createurl(url);

		if (typeof resourcecache[url] === 'string') {
			return callback();
		}

		var id = resourcecache[url] = createid();

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

	var u = [], combo = config.resourceCombo;
	urls.forEach(function(url) {
		aEl.href = createurl(url);
		if (!resourcecache[aEl.href]) {
			resourcecache[aEl.href] = true;
			u.push(url);
		}
	});

	if (combo) {
		u = combo(u);
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
}

function getState() {
	return navigation.getStack().getState();
}

app.navigation = {
	push: function(fragment, options) {
		navigation.push(fragment, options);
	},

	pop: function() {
		navigation.pop();
	},

	resolveFragment: function(name, params) {
		return navigation.resolve(name, params);
	},

	getReferer: function() {
		return getState().referer;
	},

	getParameter: function(name) {
		var state = getState();
		return state.params[name] || state.datas[name];
	},

	getParameters: function() {
		var state = getState(),
			params = {};

		for (var n in state.params) {
			params[n] = state.params[n];
		}

		for (var n in state.datas) {
			params[n] = state.datas[n];
		}

		return params;
	},

	setData: function(name, value) {
		getState().datas[name] = value;
	},

	setTitle: function(title) {
		var state = getState();
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setTitle(title);
		}
		state.pageMeta.title = title;
	},

	setButton: function(options) {
		var state = getState();
		if (app.config.enableNavbar) {
			app.config.enableNavbar.instance.setButton(options);
		}
		if (!state.pageMeta.buttons) {
			state.pageMeta.buttons = [options];
		} else {
			for (var i = 0; i < state.pageMeta.buttons.length; i++) {
				var button = state.pageMeta.buttons[i];
				if (button.type === 'back' && options.type === 'back' ||
						button.id === options.id) {
					for (var p in options) {
						button[p] = options[p];
					}
					return;
				}
			}
			state.pageMeta.buttons.push(options);
		}
	},

	setToolbar: function(options) {
		var state = getState();
		if (app.config.enableToolbar) {
			app.config.enableToolbar.instance.set(options);
		}
		state.pageMeta.toolbar = options;
	}
}

app.scroll = {
	getScrollHeight: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getScrollHeight(c_scroll.wrapEl);
		} else {
			return doc.body.scrollHeight;
		}
	},

	getScrollTop: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getScrollTop(c_scroll.wrapEl);
		} else {
			return doc.body.scrollTop;
		}
	},

	refresh: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.refresh(c_scroll.wrapEl);
		}
	},

	offset: function(el) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.offset(c_scroll.wrapEl, el);
		} else {
			return Scroll.offset(doc.body, el);
		}
	},

	scrollTo: function(y) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.scrollTo(c_scroll.wrapEl, y);
		} else {
			doc.body.scrollTop = y;
		}
	},

	scrollToElement: function(el) {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.scrollToElement(c_scroll.wrapEl, el);
		} else {
			el.scrollIntoView();
		}
	},

	getViewHeight: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getViewHeight(c_scroll.wrapEl);
		} else {
			return window.innerHeight;
		}
	},


	getBoundaryOffset: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			return Scroll.getBoundaryOffset(c_scroll.wrapEl);
		} else {
			return 0;
		}
	},

	stopBounce: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.stopBounce(c_scroll.wrapEl);
		}
	},

	resumeBounce: function() {
		var c_scroll = config.enableScroll;

		if (c_scroll) {
			Scroll.resumeBounce(c_scroll.wrapEl);
		}
	},

	addEventListener: function(name, func, isBubble) {
		var c_scroll = config.enableScroll,
			i_content = config.enableContent.instance,
			el = c_scroll?c_scroll.wrapEl:window;
		el.addEventListener(name, func, isBubble);
	},

	removeEventListener: function(name, func) {
		var c_scroll = config.enableScroll,
			i_content = config.enableContent.instance,
			el = c_scroll?c_scroll.wrapEl:window;
		el.removeEventListener(name, func);
	},

	getElement: function() {
		var c_scroll = config.enableScroll;
		return (c_scroll?c_scroll.wrapEl:doc.body);
	}
}

})(window, window['app']||(window['app']={module:{},plugin:{}}));