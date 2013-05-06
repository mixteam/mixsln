(function(win, app){
	var util = app.util,
		doc = win.document
		;

	app.view.fn.parseMultiTemplate = function(text) {
		var wrap = doc.createElement('div'),
			templateTags, templateTexts, templates = {}
			;

		wrap.innerHTML = text;
		templateTags = wrap.querySelectorAll('script[type="text/template"]');

		if (templateTags.length === 0) {
			templates.main = text;
		} else {
			util.each(templateTags, function(tag) {
				var name = tag.getAttribute('id');
				templates[name] = tag.innerHTML;
			});
		}

		return templates;
	}

	app.view.fn.compileMultiTemplate = function(tpls, callback) {
		var that = this,
			compiled = {};

		util.each(tpls, function(tpl, name) {
			that.compileTemplate(tpl, function(ctpl) {
				compiled[name] = ctpl;
			});
		});

		if (callback) {
			callback(compiled);
		} else {
			return compiled;
		}
	}


	app.view.fn.loadTemplate = function(url, callback) {
		var that = this
			;

		if (arguments.length === 1) {
			callback = arguments[0];
			url = that.template || that.templates;
		}

		if (util.isTypeof(url, 'string')) {
			app.loadFile(url, function(text, callback) {
				var tpls = that.parseMultiTemplate(text);
				that.compileMultiTemplate(tpls, callback);
			});
		} else {
			if (url) {
				that.compileMultiTemplate(url, callback);
			} else {
				callback();
			}
		}
	}

	app.view.fn.renderTemplate = function() {
		return this.renderMultiTemplate.apply(this, arguments);
	}

	app.view.fn.renderMultiTemplate = function(dataSet, callback) {
		var that = this,
			engine = app.config.templateEngine,
			templates = that.compiledTemplate,
			contents = {}, div
			;

		util.each(dataSet, function(datas, name) {
			var compiledTemplate = templates[name];

			if (compiledTemplate) {
				contents[name] = (engine && engine.render) ? engine.render(compiledTemplate, datas) : compiledTemplate;
			}
		});

		if (contents.main) {
			div = doc.createElement('div');
			div.innerHTML = contents.main;

			util.each(contents, function(html, name) {
				if (name === 'main') return;
				var el = div.querySelector('#' + name)
					;
				el && (el.innerHTML = html);
			});

			contents = div.innerHTML;
		}

		if (callback) {
			callback(contents);
		} else {
			return contents;
		}
	}

	app.view.fn.renderSingleTemplate = function(name, datas, callback) {
		var that = this,
			dataSet = {}
			;

		dataSet[name] = datas;
		if (callback) {
			that.renderMultiTemplate(dataSet, function(contents) {
				callback(contents[name]);
			});
		} else {
			return that.renderMultiTemplate(dataSet)[name];
		}
	}

	app.plugin.multiTemplate = true;
})(window, window['app']);