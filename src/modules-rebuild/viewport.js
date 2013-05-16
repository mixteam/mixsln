(function(win, app, undef) {


function Viewport() {

}

var viewportProto = {
	getActive : function() {},
	getInactive: function() {},
	switchActive: function() {},
	toggleClass: function() {},
	fill: function(html) {}
}

app.module.Viewport = Viewport;

})(window, window['app']||(window['app']={module:{},plugin:{}}));