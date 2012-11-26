define("mix/core/util/utilities/1.0.0/utilities-debug", ["mix/core/base/class/1.0.0/class-debug", "mix/libs/underscore/1.3.3/underscore-debug"], function(require, exports, module) {

var Class = require('mix/core/base/class/1.0.0/class-debug'),
	_ = require('mix/libs/underscore/1.3.3/underscore-debug');

var Util = Class.create({
	initialize : function() {
		// TODO
	},
  
  // TODO addition 
});

Util.implement(_);
Util.singleton = new Util;

module.exports = Util;

});