(function(win, app, undef) {

function StateStack() {

}

var stateStackProto = {
	pushState: function() {},
	getState: function() {},
	getIndex: function() {}
}

StateStack.isEquals = function() {

}

function convertParams() {}
function extractNames() {}
function extractArgs() {}
function getHash() {}
function setHash() {}

function Navigation() {

}

var navigationProto = {
	_resetHandler: function() {},
	_changeHanlder: function() {},
	_matchRoute: function() {},
	_parseRoute: function() {},
	startRoute: function() {},
	stopRoute: function() {},
	addRoute: function() {},
	removeRoute: function() {},
	push: function() {},
	pop: function() {}
}

app.module.StateStack = StateStack;
app.module.Navigation = Navigation;

})(window, window['app']||(window['app']={module:{},plugin:{}}));