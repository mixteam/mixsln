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

		initNavibar : function(el) {
			var viewport = components['viewport']
				;

			viewport.className += ' enableNavibar';
			components['navibar'] = el;

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

			active.setAttribute('index', '0');
			inactive.setAttribute('index', '1');

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

				toggleClass : function() {
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

			// 简单的转场效果
			function action(type) {
				var wrap = el.querySelector('div'),
					wrapWidth = wrap.offsetWidth,
					active,	inactive, originX, originY
					;

				content.fn.switchActive();
				active = content.fn.getActive();
				inactive = content.fn.getInactive();
				
				active.style.display = 'block';
				active.style.top = '-9999px';
				wrap.appendChild(active);

				originX = Transform.getX(wrap);
				originY = Transform.getY(wrap);
				originX += (type === 'forward'?-wrapWidth:wrapWidth);

				Transform.start(wrap, '0.4s', 'ease', 0, originX, originY, function() {
					content.fn.toggleClass();
					active.style.left = (-originX) + 'px';
					active.style.top = '';
					active.style.display = '';
					inactive.innerHTML = '';
					wrap.removeChild(inactive);
					wrap.style.webkitTransform = Transform.getTranslate(originX, 0);
					that.trigger(type  + 'TransitionEnd');
				});
			}

			// 复杂的转场效果
			/*
			function action(type) {
				var wrap = el.querySelector('div'),
					wrapWidth = wrap.offsetWidth,
					active,	inactive, originX, originY
					;

				originX = Transform.getX(wrap);
				originY = Transform.getY(wrap);

				content.fn.switchActive();
				active = content.fn.getActive();
				inactive = content.fn.getInactive();

				active.style.display = 'block';
				
				// 两个页面是在-webkit-box下，呈现并排状态，用relative定位，当有转场效果时，得重新计算各自的偏移。
				// 每单位偏移量为wrap的宽度。
				if (type === 'forward') {
					if (active.getAttribute('index') === '1') {
						// 被激活的div在原先div之后，偏移量为原始偏移量
						active.style.left = (-originX) + 'px';
					} else {
						// 被激活的div在原先div之前，两个div需要互换位置，被激活的div向右偏移一个单位，原先div向左偏移一个单位
						active.style.left = (-originX+wrapWidth) + 'px';
						inactive.style.left = (-originX-wrapWidth) + 'px';
					}
					originX -= wrapWidth;
				} else if (type === 'backward') {
					if (active.getAttribute('index') === '1') {
						// 被激活的div在原先div之后，需要向左偏移两个单位
						active.style.left = (-originX-wrapWidth*2) + 'px';
					} else {
						// 被激活的div在原先div之前，同时向左平移一个单位
						active.style.left = (-originX-wrapWidth) + 'px';
						inactive.style.left = (-originX-wrapWidth) + 'px';
					}
					originX += wrapWidth;
				}

				Transform.start(wrap, '0.4s', 'ease', 0, originX, originY, function() {
					content.fn.toggleClass();
					// 回正偏移量
					active.style.left = (-originX) + 'px';
					active.style.display = '';
					inactive.innerHTML = '';
					wrap.style.webkitTransform = Transform.getTranslate(originX, 0);
					that.trigger(type  + 'TransitionEnd');
				});
			}
			*/

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