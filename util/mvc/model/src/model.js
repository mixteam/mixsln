// --------------------------------
// Thanks to:
//	-http://backbonejs.org
//	-http://underscorejs.org
define(function(require, exports, module) {

require('reset');

var Class = require('class'),
	_ = require('utilities')
	;

/**
 * @class Model
 */
var Model = Class.create({
	/**
	 * @constructor
	 * @param {Object=} attrs
	 * @param {Object=} defaults
	 * @param {Object=} options
	 */
	initialize : function(attrs, defaults, options) {

	    attrs || (attrs = {});
	    
	    if (options && options.parse) 
	    	attrs = this.parse(attrs);

	    if (defaults) {
	      	attrs = Object.extend({}, defaults, attrs);
	    }

	    this._attributes = {};
	    this._escapedAttributes = {};

	    this.set(attrs);
	},

	/**
	 * get json data
	 * @return {Object} the json data
	 */
    toJSON: function() {
      return Object.clone(this._attributes);
    },

    /**
     * get the value of an attribute
     * @param {string} attr
     * @return {*} the attr's value
     */
    get: function(attr) {
      return this._attributes[attr];
    },

    /**
     * get the HTML-escaped value of an attribute
     * @param {string} attr
     * @return {*} the attr's value
     */
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    /**
     * Returns `true` if the attribute contains a value that is not null or undefined.
     * @param {string} attr
     * @return {boolean}
     */
    has: function(attr) {
      return this.get(attr) != null;
    },

    /**
     * set a hash of model attributes on the object.
     * @param {string} key
     * @param {*} value
     */
    set: function(key, value) {
      var attrs;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (Object.isTypeof(key) == 'object') {
        attrs = key;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Run validation.
      //if (!this._validate(attrs)) return false;

      var now = this._attributes;
      var escaped = this._escapedAttributes;

      Object.each(attrs, function(value, key) {
      	if (now[key] !== value)  {
      		delete escaped[key];
      		now[key] = value;
      	}
      });
    },

    /**
     * create a new model with attributes to this one.
     * @return {Model}
     */
    clone: function() {
      return new this.constructor(this._attributes);
    }
});

module.exports = Model;

});