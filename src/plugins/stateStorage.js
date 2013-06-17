(function(win, app){
	var doc = win.document,
		ss = win.sessionStorage,
		navigation = app.module.Navigation.instance,
		statestack = navigation.getStack(),
		SS_PREIX = 'mix_storage_001_'
		;

	app.plugin.stateStorage = {
		saveAll: function() {
			var strStateIdx = statestack._stateIdx + '',
				strStateLen = statestack._states.length + ''
				;

			ss.setItem(SS_PREIX + 'state_index', statestack._stateIdx);
			ss.setItem(SS_PREIX + 'state_length', statestack._states.length);
			statestack._states.forEach(function(state, i) {
				ss.setItem(SS_PREIX + 'state_item[' + i + ']', JSON.stringify(state));
			});
		},

		save: function() {
			var stateIdx = statestack._stateIdx,
				state = statestack._states[stateIdx]
				;

			ss.setItem(SS_PREIX + 'state_item[' + stateIdx + ']', JSON.stringify(state));
		},

		loadAll: function() {
			var len, i;

			statestack._stateIdx = parseInt(ss.getItem(SS_PREIX + 'state_index') || 0);
			len = parseInt(ss.getItem(SS_PREIX + 'state_length') || 0);

			for (i = 0;i < len; i++) {
				statestack._states[i] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + i + ']') || '{}');
			}
		},

		load: function() {
			var stateIdx = statestack._stateIdx
				;

			statestack._states[stateIdx] = JSON.parse(ss.getItem(SS_PREIX + 'state_item[' + stateIdx + ']') || '{}');
		},

		clear: function() {
			var len = statestack._stateLimit;

			ss.removeItem(SS_PREIX + 'state_index');
			ss.removeItem(SS_PREIX + 'state_length');

			for (var i = 0; i < len; i++) {
				ss.removeItem(SS_PREIX + 'state_item[' + i + ']');
			}
		},

		onNavigationSwtich: function() {
			this.saveAll();
		},

		onAppStart: function() {
			this.loadAll();
		}
	};
})(window, window['app']);