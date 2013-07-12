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
	var $ = win['$'];

	if (typeof this.el === 'string') {
		var selectors = this.el.split(/\s*\>\s*/),
			wrap = this.el = document.createElement('div')
			;

		selectors.forEach(function(selector) {
			var matches;
			if ((matches = selector.match(/^(\w+)?(?:\#([^.]+))?(?:\.(.+))?$/i))) {
				var node = document.createElement(matches[1] || 'div');
				matches[2] && node.setAttribute('id', matches[2]);
				matches[3] && (node.className = matches[3]);
				wrap.appendChild(node);
			} else {
				wrap.innerHTML = selector;
			}
			wrap = wrap.childNodes[0];
		});

		this.el = this.el.removeChild(this.el.childNodes[0]);
	}


	if ($) {
		this.$el = $(this.el);
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