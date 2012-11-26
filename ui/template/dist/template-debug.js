define("mix/core/ui/template/0.2.0/template-debug", ["mix/core/base/reset/1.0.0/reset-debug", "mix/core/base/class/1.0.0/class-debug", "mix/libs/handlebars/1.0.5/handlebars-debug"], function(require, exports, module) {

require('mix/core/base/reset/1.0.0/reset-debug');

var Class = require('mix/core/base/class/1.0.0/class-debug'),
	Handlebars = require('mix/libs/handlebars/1.0.5/handlebars-debug'),
	undef = undefined,

	win = window,
	doc = win.document
	;

/**
 * @class Template
 */
var Template = Class.create({
	/**
	 * the constructor for Template
	 * @constructor
	 * @param {string=} name
	 * @param {Template=} root
	 */
	initialize : function(name, type, root) {
		var that = this
			;

		that._id = Template.id();
		that._name = name || 'template' + that._id;
		that._type = type || 'template';
		that._root = root || 'root';
		that._helpers = {};
		that._partials = {};
		that._chunks = {};
		that._html = '';
		that._nodeList = [];
		
	},

	_init : function() {
		var that = this
			;

		that._helpers = Object.extend(that._helpers, Handlebars.helpers);
		that._partials = Object.extend(that._partials, Handlebars.partials);

		// init helpers/partials/chunks
		Template.helpers(that);
		Template.partials(that);
		Template.chunks(that);
	},

	/**
	 * add a helper for template
	 * @param {string} name
	 * @param {Function} helper
	 */
	addHelper : function(name, helper) {
		var that = this;

		if (arguments.length === 1) {
			Object.each(arguments[0], function(helper, name) {
				that.addHelper(name, helper);
			});
			return;
		}

		that._helpers[name] = helper;
	},

	/**
	 * add a partial for template
	 * @param {string} name
	 * @param {string} partial
	 */
	addPartial : function(name, partial) {
		var that = this;

		if (arguments.length === 1) {
			Object.each(arguments[0], function(partial, name) {
				that.addHelper(name, partial);
			});
			return;
		}

		that._partials[name] = partial;
	},

	/**
	 * add a chunk for template
	 * @param {string} name
	 * @param {Template} chunk
	 */
	addChunk : function(name, chunk) {
		var that = this;

		that._chunks[name] = chunk;
	},

	/**
	 * compile the template string
	 * @param {string} tmplstr
	 */
	compile : function(tmplstr) {
		var that = this
			;

		if (tmplstr) {
			that._init();

			// compile and parse chunks
			that._template = Template.compile(that, tmplstr);
		}
	},

	_wrap : function(html) {
		var that = this,
			name = that._name,
			id = that._id,
			value = name + '/' + id,
			type = that._type,
			template = doc.createElement('template'),
			beginNode, endNode
			;

		template.innerHTML = html;
		beginNode = template.firstElementChild;
		endNode = template.lastElementChild;

		if (!beginNode) {
			beginNode = doc.createElement('template');
			if (template.firstChild) {
				template.insertBefore(beginNode, template.firstChild);
			} else {
				template.appendChild(beginNode);
			}
		}

		if (!endNode) {
			endNode = doc.createElement('template');
			template.appendChild(endNode);
		}

		beginNode.setAttribute(type + '-begin', value);
		endNode.setAttribute(type + '-end', value);

		that._html = template.innerHTML;
		that._nodeList = [];
		Object.each(template.childNodes, function(node) {
			that._nodeList.push(node);
		});
	},

	/**
	 * parse the template with data
	 * @param {object} data
	 * @return the parsed string
	 */
	all : function(data) {
		var that = this,
			root = that._root,
			helpers = that._helpers,
			name = that._name,
			data = data || that._data,
			html;

		that._data = data;

		if (root instanceof Template) {
			helpers = Object.extend({}, root._helpers, helpers);
		}

		html = that._template(data, {
			helpers : helpers
		});

		that._template2 = Handlebars.compile(html);

		html = that._template2({}, {
			partials : that._partials
		});

		that._wrap(html);

		return that._html;
	},

	_replace : function() {
		var that = this,
			name = that._name,
			id = that._id,
			type = that._type,
			nodes = that._nodeList,
			fragment = doc.createDocumentFragment(),
			beginNode, endNode, nextNode, parentNode
			;

		beginNode = doc.querySelector('*[' + type + '-begin="' + name + '/' + id + '"]');
		endNode = doc.querySelector('*[' + type + '-end="' + name + '/' + id + '"]');
		parentNode = beginNode.parentNode || endNode.parentNode;

		while (beginNode !== endNode) {
			nextNode = beginNode.nextElementSibling;
			parentNode.removeChild(beginNode);
			beginNode = nextNode;
		}

		Object.each(nodes, function(node) {
			fragment.appendChild(node);
		});

		parentNode.insertBefore(fragment, endNode);
		parentNode.removeChild(endNode);
	},

	/**
	 * update the chunk with data
	 * @param {string} path, for special chunk
	 * @param {object} data
	 * @return the updated string
	 */
	update : function(path, chunkData) {
		var that =  this,
			template = doc.createElement('template'),
			split, chunk, chunkName,
			data, partial, last
			;

		split = (typeof path === 'string' ? path.split(/[.\/]/g) : path);

		if (split.length) {
			chunkName = split.shift();
			chunk = that._chunks[chunkName];

			if (chunk) {
				that._partials[chunkName] = 
					chunk.update(split, chunkData);

				that._html = that._template2({}, {
					partials : that._partials
				});
			} else {
				data = that._data;
				split.unshift(chunkName);
				last = split.pop();

				Object.each(split, function(key) {
					data = data[key];
				});
				data[last] = chunkData;

				that.all(data);
				that._replace(partial);
			}
		} else {
			data = that._data;
			if (Object.keys(data).length !== Object.keys(chunkData).length) {
				chunkData = Object.extend({}, data, chunkData);
			}

			that.all(chunkData);
			that._replace(partial);
		}

		return that._html;
	},

	/**
	 * destroy the template
	 */
	destroy : function() {
		var that = this,
			chunks = that._chunks
			;

		Object.each(chunks, function(chunk) {
			chunk.destroy();
		});

		delete that._template;
		delete that._template2;
		delete that._data;
		delete that._chunks;
	}
}),


CHUNK_TAG = /(\{\{#chunk\s+[^}\s]+\s*[^}]*\}\})|(\{\{\/chunk\}\})/g,
CHUNK_OPEN_TAG = /\{\{#chunk\s+([^}\s]+)\s*\}\}/,
CHUNK_CLOSE_TAG = /\{\{\/chunk\}\}/,
TemplateId = 1
;

Template.id = function() {
	return TemplateId++;
}


Template.helpers = function(tmpl) {
	tmpl.addHelper('chunk', function(name) {
		var chunk
			;

		chunk = tmpl._chunks[name];
		tmpl._partials[name] = chunk.all(this);

		return new Handlebars.SafeString('{{> ' + name + '}}');
	});
};

Template.partials = function(tmpl) {
	// TODO
}

Template.chunks = function(tmpl) {
	// TODO
}

Template.compile = function(rootTmpl, text) {
	var tagMatchs,
		openStack = [],
		subtmplStack = []
		;

	tagMatchs = text.match(CHUNK_TAG);

	tagMatchs && tagMatchs.forEach(function(tag) {
		var openMatch, closeMatch,
			openTag, closeTag,
			openIdx, closeIdx,
			subtmpl, parentTmpl,
			lText, rText,
			name, chunk
			;

		// find closeTag
		closeMatch = tag.match(CHUNK_CLOSE_TAG);

		if (closeMatch) {
			// pop open stack
			openMatch = openStack.pop();
			subtmpl = subtmplStack.pop();
			parentTmpl = subtmplStack.length ?  subtmplStack[subtmplStack.length - 1] : rootTmpl;

			// get tag and name
			openTag = openMatch[0];
			closeTag = closeMatch[0];
			name = openMatch[1];

			// index of open/close tag
			openIdx = text.indexOf(openTag);
			closeIdx = text.indexOf(closeTag);

			// fetch the chunk text and update the text
			lText = text.substring(0, openIdx);
			chunk = text.substring(openIdx + openTag.length, closeIdx);
			rText = text.substring(closeIdx + closeTag.length);
			text = lText + '{{#with ' + name + '}}{{chunk "' + name + '"}}{{/with}}' + rText;

			// compile subtmpl
			subtmpl._name = name;
			subtmpl._root = parentTmpl;
			subtmpl._type = 'chunk';
			subtmpl._template = Handlebars.compile(chunk);

			parentTmpl.addChunk(name, subtmpl);
		} else {
			// push open stack
			openMatch = tag.match(CHUNK_OPEN_TAG);
			openStack.push(openMatch);

			parentTmpl = new Template();
			parentTmpl._init();
			subtmplStack.push(parentTmpl);
		}
	});

	
	return Handlebars.compile(text);
}

module.exports = Template;

});