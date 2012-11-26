define(function(require, exports, module) {

var Template = require('template'),
	tmpl = new Template('template demo'),
	doc = document,
	B_parse, B_update,
	E_dom,
	T_template,
	T_data,
	T_result,
	T_path,
	T_chunk_data,
	T_chunk_result
	;

	function $$(id) {
		return doc.getElementById(id);
	}

	B_parse = $$('B_parse');
	B_update = $$('B_update');
	E_dom = $$('J_dom');
	T_template = $$('T_template');
	T_data = $$('T_data');
	T_result = $$('T_result');
	T_path = $$('T_chunk_path');
	T_chunk_data = $$('T_chunk_data');
	T_chunk_result = $$('T_chunk_result');

	B_parse.onclick = function() {
		var tmplstr = T_template.innerHTML.replace(/\&lt;/g, '<').replace(/\&gt;/g, '>'),
			data = eval('(' + T_data.value + ')');
			;

		tmpl.compile(tmplstr);
		var html = tmpl.all(data, true);

		T_result.value = html;
		E_dom.innerHTML = html;
	}

	B_update.onclick = function() {
		var path = T_path.value,
			chunk_data = eval('(' + T_chunk_data.value + ')')
			;

		var html = tmpl.update(path, chunk_data);

		T_chunk_result.value = html;
	}

});