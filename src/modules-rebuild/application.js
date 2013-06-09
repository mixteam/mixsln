//@require message
//@require navigation
//@require template
//@require view
//@require page
//@require navbar
//@require content
//@require scroll
//@require transition


(function(win, app, undef) {

app.config = {}
app.start = function() {}
app.registerPlugin = function() {}

app.view = app.module.View;
app.page = app.module.Page;

})(window, window['app']||(window['app']={module:{},plugin:{}}));