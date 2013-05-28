(function(win, app, undef) {


var Message = app.module.MessageScope
	;

function Page() {
	Message.mixto(this, 'page');
}

var PageProto = {
	navigation: {
		push: function(fragment, options) {
			this.trigger('navigation:push', fragment, options);
		},

		pop: function() {
			this.trigger('navigation:pop');
		},

		getParameter: function(name) {
			var value;

			this.once('navigation:getParameter:callback', function(v) {
				value = v;
			})
			this.trigger('navigation:getParameter', name);
			return value;
		},

		getData: function(name) {
			var value;
			
			this.once('navigation:getData:callback', function(v) {
				value = v;
			})
			this.trigger('navigation:getData', name);	

			return value;
		},

		setData: function(name, value) {
			this.trigger('navigation:setData', name, value);
		},

		setTitle: function(title) {
			this.trigger('navigation:setTitle', title);	
		},

		setButton: function(options) {
			this.trigger('navigation:setTitle', options);
		}
	},

	viewport: {
		fill: function(html) {
			this.trigger('viewport:fill', html);
		},
		el: null,
		$el: null
	},

	ready : function() {/*implement*/},
	unload : function() {/*implement*/}	
}

for (var p in PageProto) {
	Page.prototype[p] = PageProto[p];
} 

Page.fn = {};
Page.define = function() {}
Page.get = function() {}
Page.registerPlugin = function() {}

app.module.Page = Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));