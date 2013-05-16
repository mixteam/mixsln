(function(win, app, undef) {


function NavBar() {

}

var navBarProto = {
	anime: function() {},
    setTitle: function(title) {},
    setButton: function(options) {},
    showButton: function(type) {},
    hideButton: function(type) {}
}

app.module.NavBar = NavBar;

})(window, window['app']||(window['app']={module:{},plugin:{}}));