define(function(require, exports, module) {

require('reset');
var win = window,
	doc = win.document,
	Class = require('class'),
	Message = require('message'),
	navigate = require('navigate').singleton,
	Scroll = require('./scroll'),
	Transform = require('./transform'),
	components = {},
	emptyFunc = function(){},
	extendFns = function(el, fns) {
		el.fn || (el.fn = {});
		Object.extend(el.fn, fns);
	},
	
	Compontent = Class.create({
		Implements : Message,

		initialize : function() {
			Message.prototype.initialize.call(this, 'component');
		},

		get : function(name) {
			return components[name];
		},

		initViewport : function(el) {
			components['viewport'] = el;

			if (!el.getAttribute('id'))
				el.setAttribute('id', 'viewport-' + Date.now());
		},

		initTitlebar : function(el) {
			var viewport = components['viewport']
				;

			viewport.className += ' enableTitlebar';
			components['titlebar'] = el;

			extendFns(el, {
				change : function(text, movement) {
					var that = this,
						wrap = el.querySelector('ul'),
						title = wrap.querySelector('li:first-child')
						;

					function handler(e) {
						wrap.className = '';
						wrap.removeEventListener('webkitTransitionEnd', handler);
					}

					title.innerHTML = text;
					wrap.className = movement;
					setTimeout(function() {
						wrap.className += ' transition';
						wrap.addEventListener('webkitTransitionEnd', handler, false);
					}, 1);
				}
			});
		},

		initBtn : function(name, el)  {
			components[name] = el;

			var that = this
				;

			extendFns(el, {
				setText : function(text) {
					el.innerText = text;
				},

				show : function() {
					el.style.visibility = '';
				},

				hide : function() {
					el.style.visibility = 'hidden';
				}
			});

			el.addEventListener('click', function(e) {
				that.trigger(name + 'Click');
				e.preventDefault();
				return false;
			});

			return el;
		},

		initBackBtn : function(el) {
			this.initBtn('backBtn', el);
		},

		initFuncBtn : function(el) {
			this.initBtn('funcBtn', el);
		},

		initContent : function(el) {
			components['content'] = el;

			var active = el.querySelector('div > .active'), 
				inactive = el.querySelector('div > .inactive')
				;

			extendFns(el, {
				getActive : function() {
					return active;
				},

				getInactive : function() {
					return inactive;
				},

				switchActive : function() {
					swap = inactive;
					inactive = active;
					active = swap;
				},

				setClass : function() {
					inactive.className = 'inactive';
					active.className = 'active';
					
				}
			});
		},

		getActiveContent : function() {
			return components['content'].fn.getActive();
		},

		initScroll : function(el) {
			components['scroll'] = el;

			var that = this,
				children = el.children[0],
				scroller = new Scroll(el),
				viewport = components['viewport']
				;

			viewport.className += ' enableScroll';
			el.className += ' scroll';

			scroller._scrollEndHandler = function() {
				that.trigger('scrollEnd');
			}
			scroller.enable();

			extendFns(el, {
				refresh : function() {
					scroller.refresh();
				},

				getScrollHeight : function() {
					return scroller.getHeight();
				},

				getScrollTop : function() {
					return scroller.getTop();
				},

				scrollTo : function(top) {
					scroller.to(top);
				}
			});
		},

		initTransition : function(el) {
			components['transition'] = el;

			var that = this,
				viewport = components['viewport'],
				content = components['content']
				;

			viewport.className += ' enableTransition';
			el.className += ' transition';

			function action(type) {
				var wrap = el.querySelector('div'),
					active,	originX, originY
					;

				content.fn.switchActive();
				active = content.fn.getActive(),
				active.innerHTML = '';

				originY = Transform.getY(wrap);
				originX = (type === 'forward'?'-':'') + '33.33%';

				Transform.start(wrap, '0.4s', 'ease', 0, originX, originY, function() {
					content.fn.setClass();
					originY = Transform.getY(wrap);
					wrap.style.webkitTransform = Transform.getTranslate(0, originY);
					that.trigger(type  + 'TransitionEnd');
				});
			}

			extendFns(el, {
				forward : function() {
					action('forward');
				},

				backward : function() {
					action('backward');
				}
			});
		}
	})
	;

return new Compontent();
});