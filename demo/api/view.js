function view_showLoading() {
	api.view.showLoading('加载中');
	setTimeout(function() {
		api.view.hideLoading();
	}, 1000);
}

function view_onPulldownHandler() {
	alert('pulldown');
	setTimeout(function() {
		api.view.resetPulldown();
	}, 1000);
}

function view_onPullupHandler() {
	alert('pullup');
	setTimeout(function() {
		api.view.resetPullup();
	}, 1000);
}

function view_onPulldown() {
	api.view.onPulldown(view_onPulldownHandler);
}

function view_onPullup() {
	api.view.onPullup(view_onPullupHandler);	
}

function view_offPulldown() {
	api.view.offPulldown(view_onPulldownHandler);
}

function view_offPullup() {
	api.view.offPullup(view_onPullupHandler);	
}