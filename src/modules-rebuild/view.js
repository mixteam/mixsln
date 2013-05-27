(function(win, app, undef) {
	
function View() {

}

var viewProto = {
	loadTemplate: function(url, callback) {},
	compileTemplate: function(text, callback) {},
	renderTemplate: function(datas, callback) {}
}

View.fn = {};
View.define = function(propeties) {}
View.get = function(name) {}

app.module.View = View;

})(window, window['app']||(window['app']={module:{},plugin:{}}));