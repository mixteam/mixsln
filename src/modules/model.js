//@require message

(function(win, app, undef) {

var Message = app.module.MessageScope,
	mid = 0, cid = 0;

function Model(data) {
	var that = this,
		initializing  = true,
		children = {}
		;

	Message.mixto(that, 'model-' + mid++);

	that.addProperty = function(key, value) {
		Object.defineProperty(that, key, {
			get: function() {
				return children[key] || data[key];
			},
			set: function(value) {
				if (children[key]) {
					children[key].destory();
					delete children[key];
				}

				if (value != null) {
					data[key] = value;
					if (typeof value === 'object') {
						children[key] = new Model(value);
						children[key].on('propertyChange',  function(e) {
							that.trigger('propertyChange', {
								target: e.target,
								value: e.value,
								name: e.name,
								path: key + '.' + e.path
							});
						});
					}
				}

				!initializing && that.trigger('propertyChange', {
					target: that,
					value: children[key] || data[key],
					name: key,
					path: key
				});
			}
		});

		that[key] = value;
	}

	that.update = function(data) {
		if (data instanceof Array) {
			for (var i = 0; i < data.length; i++) {
				if (!(data[i] instanceof Model)) {
					this.addProperty(i, data[i]);
				}
			}
		} else {
			for (var key in data) {
				if (that.hasOwnProperty(key)) {
					throw new Error('property conflict "' + key + '"');
				}

				if (data.hasOwnProperty(key) && !(data[key] instanceof Model)) {
					this.addProperty(key, data[key]);
				}
			}
		}
	}

	that.destory = function() {
		for (var key in children) {
			children[key].destory();
		}
		that.off();
	}

	that.on('propertyChange', function(e) {
		that.trigger('change:' + e.path, e.value);
	});

	that.update(data);

	initializing = false;
}

function Collection(data) {
	var that = this
		;

	if (!data instanceof Array) return;

	that.length = data.length;

	that.push = function(value) {
		data.push(value);
		that.length = data.length;
		that.addProperty(data.length - 1, value);
	}

	that.pop = function() {
		var value = data.pop();
		that.length = data.length;
		that[data.length] = null;
		return value;
	}

	Model.call(that, data);
}

app.module.Model = Model;
app.module.Collection = Collection;


})(window, window['app']||(window['app']={module:{},plugin:{}}));