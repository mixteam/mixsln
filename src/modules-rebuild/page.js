(function(win, app, undef) {


function Page() {

}

var pageProto = {
	navigation: {
		push: function(fragment, options) {},
		pop: function() {},
		getParameter: function(name) {},
		getData: function(name) {},
		setData: function(name, value) {},
		setTitle: function(title) {},
		setButton: function(options) {}
	},
	viewport: {
		fill: function(html) {},
		el: null,
		$el: null
	},
	ready : function() {/*implement*/},
	unload : function() {/*implement*/}	
}

Page.fn = {};
Page.define = function() {}
Page.get = function() {}
Page.registerPlugin = function() {}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));