define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),
    View = require('./view'),

    STATUS = {
		'DEFINED' : 0,
		'UNLOADED' : 1,
		'LOADED' : 2,
		'READY' : 3
	},
	pages = {},
	Page = Class.create({
		Extends : View,
		Implements : Message,

		initialize : function() {
			var that = this,
				name = that.name
				;

			Message.prototype.initialize.call(that, 'page.' + name);
			View.prototype.initialize.apply(that, arguments);
			that.status = STATUS.DEFINED;
		},

		getTitle : function() {
			//can overrewite
			return this.title;
		},

		fill : function(datas, callback) {
			var that = this
				;

			if (!Object.isTypeof(datas, 'string')) {
				datas = that.renderTemplate(datas);
			}
			that.trigger('rendered', datas);
			callback && callback();
		},

		ready : function() {/*implement*/},
		unload : function() {/*implement*/}
	});

Page.STATUS = STATUS;
Page.global = {};
Page.fn = {};
var isExtend = false;
function extendPageFn() {
	if (!isExtend) {
		isExtend = true;
		Object.extend(Page.prototype, Page.fn);
	}
}
Page.define = function(properties) {
	extendPageFn();

	var cPage = Page.extend(properties), 
		iPage = new cPage()
		;

	Object.each(Page.global, function(val, name) {
		var type = Object.isTypeof(val);

		switch (type){
			case 'array':
				iPage[name] = val.slice(0).concat(iPage[name] || []);
				break;
			case 'object':
				iPage[name] = Object.extend(val, iPage[name] || {});
				break;
			case 'string':
			case 'number':
				(iPage[name] == null) && (iPage[name] = val);
				break;
		}
	});
	return (pages[iPage.name] = iPage);
}
Page.get = function(name) {
	return pages[name];
}
Page.each = function(callback) {
	Object.each(pages, callback);
}

return Page;

});