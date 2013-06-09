(function(win, app, undef) {


function Content() {

}

var ContentProto = {
	getActive : function() {},
	getInactive: function() {},
	switchActive: function() {},
	toggleClass: function() {},
	fill: function(html) {}
}

for (var p in ContentProto) {
	Content.prototype[p] = ContentProto[p];
}

app.module.Content = Content;

})(window, window['app']||(window['app']={module:{},plugin:{}}));