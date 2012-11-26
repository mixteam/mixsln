// --------------------------------
// Thanks to:
//  - https://github.com/alipay/arale/blob/master/lib/class/docs/competitors.md
//  - http://ejohn.org/blog/simple-javascript-inheritance/
//  - https://github.com/alipay/arale/blob/master/lib/class/src/class.js
//  - http://mootools.net/docs/core/Class/Class
//  - http://ejohn.org/blog/simple-javascript-inheritance/
//  - https://github.com/ded/klass
//  - http://documentcloud.github.com/backbone/#Model-extend
//  - https://github.com/joyent/node/blob/master/lib/util.js
//  - https://github.com/kissyteam/kissy/blob/master/src/seed/src/kissy.js
//
// --------------------------------
// TODO: 
//  - 测试typeof和toString的性能
// The base Class implementation.
define("mix/core/base/class/1.0.0/class-debug", [], function(require, exports, module) {

function Class(o) {
  // Convert existed function to Class.
  if (!(this instanceof Class) && isFunction(o)) {
    return classify(o);
  }
}

Class.create = function(parent, properties) {
  if (!isFunction(parent)) {
    properties = parent;
    parent = null;
  }

  properties || (properties = {});
  parent || (parent = properties.Extends || Class);
  properties.Extends = parent;

  // The created class constructor
  function Klass() {
    // Call the parent constructor.
    parent.apply(this, arguments);

    // Only call initialize in self constructor.
    if (this.constructor === Klass && this.initialize) {
      this.initialize.apply(this, arguments);
    }
  }

  // Inherit class (static) properties from parent.
  if (parent !== Class) {
    mix(Klass, parent);
  }

  // Add instance properties to the klass.
  implement.call(Klass, properties);

  // Make klass extendable.
  return classify(Klass);
};

// Create a new Class that inherits from this class
Class.extend = function(properties) {
  properties || (properties = {});
  properties.Extends = this;

  return Class.create(properties);
};

// Mutators define special properties.
Class.Mutators = {
  'Extends': function(parent) {
    var existed = this.prototype;
    var proto = createProto(parent.prototype);

    // Keep existed properties.
    mix(proto, existed);

    // Enforce the constructor to be what we expect.
    proto.constructor = this;

    // Set the prototype chain to inherit from `parent`.
    this.prototype = proto;

    // Set a convenience property in case the parent's prototype is
    // needed later.
    this.superclass = parent.prototype;
  },

  'Implements': function(items) {
    isArray(items) || (items = [items]);
    var proto = this.prototype, item;

    while (item = items.shift()) {
      mix(proto, item.prototype || item);
    }
  },

  'Statics': function(staticProperties) {
      mix(this, staticProperties);
  }
};

// Shared empty constructor function to aid in prototype-chain creation.
function Ctor() {}

// See: http://jsperf.com/object-create-vs-new-ctor
var createProto = Object.__proto__ ?
        function(proto) {
            return { __proto__: proto };
        } :
        function(proto) {
            Ctor.prototype = proto;
            return new Ctor();
        };

function implement(properties) {
  var key, value;

  for (key in properties) {
    value = properties[key];

    if (Class.Mutators.hasOwnProperty(key)) {
      Class.Mutators[key].call(this, value);
    } else {
      this.prototype[key] = value;
    }
  }
}

function classify(cls) {
  cls.extend = Class.extend;
  cls.implement = implement;
  return cls;
}

var mix = Class.mix = function(r, s) {
  // Copy "all" properties including inherited ones.
  for (var p in s) {
    if (s.hasOwnProperty(p)) {
      // 在 iPhone 1 代等设备的 Safari 中，prototype 也会被枚举出来，需排除
      if (p !== 'prototype') {
        r[p] = s[p];
      }
    }
  }
}

var toString = Object.prototype.toString;
var isArray = Array.isArray;

if (!isArray) {
  isArray = function(val) {
    return toString.call(val) === '[object Array]';
  };
}

var isFunction = function(val) {
  return toString.call(val) === '[object Function]';
};

module.exports = Class;

});