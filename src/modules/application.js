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
	isAndroid = (/android/gi).test(appVersion),
	isIOS = (/iphone|ipad/gi).test(appVersion),

	am = app.module,
	StateStack = am.StateStack,
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
		enableMessageLog: false,
		resourceBase: './',
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
var orientationEvent = 'onorientationchange' in win?'orientationchange':'resize';
window.addEventListener(orientationEvent, function(e){
	setTimeout(function() {
		hooks.trigger('orientaion:change');
	}, 10);
}, false);

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

function handlerScrollEvent() {

	function fireEvent(el, eventName) {
		var event = doc.createEvent('HTMLEvents');
		event.initEvent(eventName, false, true);
	    el.dispatchEvent(event);
	} 

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
		c_navbar.instance = new Navbar(c_navbar.wrapEl, c_navbar);
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
	var startup = page.startup,
		teardown = page.teardown;

	page.ready = function(state) {
		hooks.trigger('page:ready', state, page);
	}

	page.startup = function(state) {
		checkTemplate(page, 'template', function() {
			hooks.trigger('page:startup', state, page);
			startup.call(page);
		});
	}

	page.teardown = function(state) {
		hooks.trigger('page:teardown', state, page);
		teardown.call(page);
	}

	page.html = function(html) {
		config.enableContent.instance.html(html);
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
		isFirstSwitch = true, isSamePage = false
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

					if (button.type === 'back') {
						if (button.autoHide !== false && state.index < 1) {
							button.hide = true;
						} else {
							button.hide = false;
						}
						if (!handler) {
							handler = button.handler = function() {
								app.navigation.pop();
							}
						}
					}

					if (typeof handler === 'string') {
						handler = page[handler];
					}
					button.handler = function(e) {
						handler.call(page, e, state.index);
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

			if (!isSamePage && !isFirstSwitch){
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
		var offsetHeight = c_scroll?config.viewport.offsetHeight:doc.documentElement.clientHeight;
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

			if (c_transition && !isFirstSwitch) {
				var offsetX = c_transition.wrapEl.offsetWidth * (transition === 'backward'?1:-1),
					className = c_transition.wrapEl.className += ' ' + transition
					;

				Transition.move(c_transition.wrapEl, offsetX, 0, function() {
					c_transition.wrapEl.className = className.replace(' ' + transition, '');
					c_transition.wrapEl.style.left = (-Animation.getTransformOffset(c_transition.wrapEl).x) + 'px';
					i_content.setClassName();
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
	function setPage() {
		var lastFragment = page.el.getAttribute('data-fragment'), 
			lastCache = pagecache[lastFragment];

		if (state.move === 'backward' && lastFragment === state.fragment) return;
		if (lastCache) {
			lastCache.page.teardown(lastCache.state);
			delete pagecache[lastFragment];
		}

		pagecache[state.fragment] = {state:state, page:page};
		page.el.setAttribute('data-fragment', state.fragment);
		page.startup(state);
	}

	// dynamic load
	function pageLoad() {
		var meta;
		if ((meta = pagemeta[state.name])) {
			meta.css && app.loadResource(meta.css);
			meta.js && app.loadResource(meta.js, pageReady);
		}
	}

	function pageReady() {
		page = Page.get(state.name);
		page.el = i_content.getActive();
		$ && (page.$el = $(page.el));
		page.ready(state);
		lastState = state;
		lastPage = page;
		isFirstSwitch = false;
	}

	navigation.on('forward backward', function(_state) {
		state = _state;
		page = Page.get(state.name);
		state.pageMeta || (state.pageMeta = {});
		state.plugins || (state.plugins = {});

		if (lastState) {
			isSamePage = (lastState.name === state.name);
		}

		if (!isSamePage) hooks.trigger('navigation:switch', state);
		page?pageReady():pageLoad();
	});

	hooks.on('navigation:switch', function() {
		setContent();
		setTransition();
		setPlugin('onNavigationSwitch');
	});

	hooks.on('page:ready', function() {
		setNavbar();
		setToolbar();
		setScroll();
		setPage();
	});

	hooks.on('navigation:switchend && page:ready', function() {
		refreshContent();
		setPlugin('onNavigationSwitchEnd');
	});

	hooks.on('orientaion:change', function() {
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
app.loadResource = function(urls, callback) {
	if (typeof urls === 'string') {
		urls = [urls];
	} else {
		urls = urls.slice(0);
	}

	function load(url, callback) {
		aEl.href = app.config.resourceBase + url;
		url = aEl.href;

		if (resourcecache[url]) {
			callback();
		} else {
			var id = resourcecache[url] = 'resource-' + Date.now() + '-' + Object.keys(resourcecache).length;

			if (url.match(/\.js$/)) {
				var script = document.createElement('script'), loaded = false;
				script.id = id;
				script.async = true;
				script.onload = script.onreadystatechange  = function() {
					if (!loaded) {
						loaded = true;
						callback && callback(url);
					}
				}
				script.src = url;
				doc.body.appendChild(script);
			} else if (url.match(/\.css$/)) {
				var link = document.createElement('link');
				link.id = id;
				link.type = 'text/css';
				link.rel = 'stylesheet';
				link.href = url;
				doc.body.appendChild(link);
				callback();
			}
		}
	}

	load(urls.shift(), function() {
		if (urls.length) {
			load(urls.shift(), arguments.callee);
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
		navigation.resolve(name, params);
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
			return document.documentElement.clientHeight;
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