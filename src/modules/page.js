(function(win, app, undef) {


var Message = app.module.MessageScope,
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
	ready : function() {/*implement*/},
	startup : function() {/*implement*/},
	teardown : function() {/*implement*/},
	show : function() {/*implement*/},
	hide : function() {/*implement*/}
}

for (var p in PageProto) {
	Page.prototype[p] = PageProto[p];
} 

Page.fn = {};

Page.define = function(properties) {
	function ChildPage() {
		Page.apply(this, arguments);
		this.initialize && this.initialize.apply(this, arguments);
		Message.mixto(this, 'page.' + this.name);
	}
	inherit(ChildPage, Page);
	extend(ChildPage.prototype, Page.fn);
	extend(ChildPage.prototype, properties);

	return (pages[properties.name] = new ChildPage());
}

Page.get = function(name) {
	return pages[name];
}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));