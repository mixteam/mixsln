define(function(require, exports, module) {
require('reset');

var win = window,
    doc = win.document,
    Class = require('class'),
    Message = require('message'),
    View = require('./view'),

    STATUS = {
		'UNKOWN' : 0,
		'UNLOADED' : 0,
		'READY' : 1,
		'COMPILED' : 2,
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
			that.status = STATUS.UNKOWN;
		},

		getTitle : function() {
			//can overrewite
			return this.title;
		},

		fill : function(datas, callback) {
			var that = this
				;

			that.renderDatas(datas, function(content) {
				that.trigger('rendered', content);
				callback && callback();				
			});
		},

		ready : function() {/*implement*/},
		unload : function() {/*implement*/}
	});

Page.STATUS = STATUS;
Page.global = {};
Page.fn = {};
Page.define = function(properties) {
	var cPage, iPage;

	cPage = Page.extend(properties);
	cPage.implement(Page.fn);
	iPage = new cPage();

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