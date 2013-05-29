(function(win, app, undef) {

var anim = app.module.Animation
	;

function Scroll(element) {

}

var scrollProto = {
	refresh : function() {},
	getHeight: function() {},
	getTop: function() {},
	to: function() {}
}

app.module.Scroll = Scroll;

})(window, window['app']||(window['app']={module:{},plugin:{}}));