define(function(require, exports, module) {

require('reset');
var win = window,
	doc = win.document,

	Class = require('class'),
	navigate = require('navigate').singleton,
	Page = require('./page'),
	STATUS = Page.STATUS,
	Navigation = Class.create({
		initialize : function(state) {
			var that = this,
				name = state.name.split('.')
				;
				
			that.appName = name[0];
			that.routeName = name[1];
			that.state = state;
		},

		getParameter : function(name) {
			return this.state.params[name];
		},

		getArgument : function(name) {
			return this.state.args[name];
		},

		getData : function(name) {
			return this.state.datas[name];
		},

		push : function(fragment, options) {
			navigate.forward(fragment, options);
		},

		pop : function() {
			navigate.backward();
		},

		ready : function() {
			var page = Page.get(this.appName)
				;

			if (page.status < STATUS.READY) {
				page.status = STATUS.READY;
				page.trigger('ready', this);
			}
		},

		compile : function() {
			var page = Page.get(this.appName)
				;

			function _compiled() {
				if (page.status < STATUS.COMPILED) {
					page.status = STATUS.COMPILED;
					page.trigger('compiled');
				}
			}

			if (!page.compiledTemplate) {
				page.loadTemplate(function(text) {
					page.compileTemplate(text, function() {
						_compiled();	
					});
				});
			} else {
				_compiled();
			}
		},

		unload : function() {
			var that = this,
				page = Page.get(this.appName)
				;

			if (page.status > STATUS.UNLOADED) {
				page.status = STATUS.UNLOADED;
				page.trigger('unloaded');
			}
		}
	});

return Navigation;
});