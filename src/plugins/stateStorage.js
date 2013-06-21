(function(win, app){
	var ss = win.sessionStorage,
		stack = app.module.Navigation.instance.getStack(),
		SS_PREIX = 'mix_storage_001_'
		;

	function cleanup(state) {
		var o = {};

		for (var p in state) {
			if (p === 'pageMeta') continue;
			var type = Object.prototype.toString.call(state[p]);
			if (type === '[object Number]' || type === '[object String]') {
				o[p] = state[p];
			} else if (type === '[object Array]') {
				o[p] = state[p].map(function(s) {return cleanup(s)});
			} else if (type === '[object Object]') {
				o[p] = cleanup(state[p]);
			}
		}

		return o;
	}

	app.plugin.stateStorage = {

		saveAll: function() {
			ss.setItem(SS_PREIX + 'state_index', stack._stateIdx);
			ss.setItem(SS_PREIX + 'state_length', stack._states.length);
			stack._states.forEach(function(state, i) {
				ss.setItem(SS_PREIX + 'state_item[' + i + ']', JSON.stringify(cleanup(state)));
			});
		},

		save: function() {
			var stateIdx = stack._stateIdx,
				state = stack._states[stateIdx]
				;

			ss.setItem(SS_PREIX + 'state_item[' + stateIdx + ']', JSON.stringify(cleanup(state)));
		},

		loadAll: function() {
			var len, i;

			stack._stateIdx = parseInt(ss.getItem(SS_PREIX + 'state_index') || 0);
			len = parseInt(ss.getItem(SS_PREIX + 'state_length') || 0);

			for (i = 0;i < len; i++) {
				stack._states[i] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + i + ']') || '{}');
			}
		},

		load: function() {
			var stateIdx = stack._stateIdx
				;

			stack._states[stateIdx] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + stateIdx + ']') || '{}');
		},

		clear: function() {
			var len = stack._stateLimit;

			ss.removeItem(SS_PREIX + 'state_index');
			ss.removeItem(SS_PREIX + 'state_length');

			for (var i = 0; i < len; i++) {
				ss.removeItem(SS_PREIX + 'state_item[' + i + ']');
			}
		},

		onNavigationSwitch: function() {
			this.saveAll();
		},

		onAppStart: function() {
			this.loadAll();
		}
	};
})(window, window['app']);