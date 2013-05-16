(function(win, app, undef) {


function Scroll() {

}

var scrollProto = {
	refresh : function() {},
	getHeight: function() {},
	getTop: function() {},
	to: function() {}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));