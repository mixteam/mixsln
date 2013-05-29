(function(win, app, undef) {


var Message = app.module.MessageScope,
	pm = Message.get('page'),
	pages = {}
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

function Page() {
}

var PageProto = {
	navigation: {
		push: function(fragment, options) {
			pm.trigger('navigation:push', fragment, options);
		},

		pop: function() {
			pm.trigger('navigation:pop');
		},

		getParameter: function(name) {
			var value;

			pm.once('navigation:getParameter:callback', function(v) {
				value = v;
			})
			pm.trigger('navigation:getParameter', name);
			return value;
		},

		getData: function(name) {
			var value;
			
			pm.once('navigation:getData:callback', function(v) {
				value = v;
			})
			pm.trigger('navigation:getData', name);	

			return value;
		},

		setData: function(name, value) {
			pm.trigger('navigation:setData', name, value);
		},

		setTitle: function(title) {
			pm.trigger('navigation:setTitle', title);	
		},

		setButton: function(options) {
			pm.trigger('navigation:setTitle', options);
		}
	},

	viewport: {
		fill: function(html) {
			pm.trigger('viewport:fill', html);
		},
		el: null,
		$el: null
	},

	startup : function() {/*implement*/},
	teardown : function() {/*implement*/}	
}

for (var p in PageProto) {
	Page.prototype[p] = PageProto[p];
} 

Page.fn = {};

Page.define = function(properties) {
	function ChildPage() {
		Page.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);

		extend(this, Page.fn);
		extend(this, properties);
		Message.mixto(this, 'page.' + this.name);
	}
	inherit(ChildPage, Page);

	return (pages[properties.name] = new ChildPage());
}

Page.get = function(name) {
	return pages[name];
}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));