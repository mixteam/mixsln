(function(win, app, undef) {

var doc = win.document,
	views = {}
	;

function extend(target, properties) {
	for (var key in properties) {
		if (properties.hasOwnProperty(key)) {
			target[key] = properties[key];
		}
	}
}

function inherit(child, parent) {
	function Ctor() {}
	Ctor.prototype = parent.prototype;
	var proto = new Ctor();
	extend(proto, child.prototype);
	proto.constructor = child;
	child.prototype = proto;
}
	
function View() {
	var el, $el, $ = win['$'], matches;

	if (this.el) {
		if ((matches = this.el.match(/^(\w+)?(?:\#([^.]+))?(?:\.(.+))?$/i))) {
			el = document.createElement(matches[1] || 'div');
			matches[2] && el.setAttribute('id', matches[2]);
			matches[3] && (el.className = matches[3]);
		} else {
			var wrap = document.createElement('div');
			wrap.innerHTML = this.el;
			el = wrap.removeChild(wrap.childNodes[0]);
		}
	}


	Object.defineProperty(this, 'el', {
		get: function() {
			return el;
		}
	});

	if ($) {
		$el = $(el);
		Object.defineProperty(this, '$el', {
			get: function() {
				return $el;
			}
		});
	}
}

var ViewProto = {
	render: function(callback) {/*implement*/},
	destory: function(callback) {/*implement*/}
}

for (var p in ViewProto) {
	View.prototype[p] = ViewProto[p];
} 

View.fn = {};

View.extend = function(properties) {
	function ChildView() {
		View.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
	}
	inherit(ChildView, View);
	extend(ChildView.prototype, View.fn);
	extend(ChildView.prototype, properties);
	
	return (views[properties.name] = ChildView);
}

View.get = function(name) {
	return views[name];
}

app.module.View = View;

})(window, window['app']||(window['app']={module:{},plugin:{}}));