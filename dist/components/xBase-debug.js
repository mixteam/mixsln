define("#mix/sln/0.1.0/components/xBase-debug", [ "mix/core/0.3.0/base/reset-debug", "mix/core/0.3.0/base/class-debug" ], function(require, exports, module) {
    require("mix/core/0.3.0/base/reset-debug");
    var win = window, doc = win.document, Class = require("mix/core/0.3.0/base/class-debug"), components = {}, xBase = Class.create({
        initialize: function(name, module) {
            var that = this;
            that._module = module;
            that._isEnable = false;
        },
        getModule: function() {
            return this._module;
        },
        enable: function() {
            // overwrite
            var that = this, module = that._module;
            if (module && !that._isEnabled) {
                that._isEnabled = true;
                return true;
            }
        },
        disable: function() {
            // overwrite
            var that = this, module = that._module;
            if (module && that._isEnabled) {
                that._isEnabled = false;
                return true;
            }
        }
    });
    function createXComponent(name, properties) {
        var _init, _enable, _disable, extentions, xComponent, component;
        if (properties.hasOwnProperty("init")) {
            _init = properties.init;
            delete properties.init;
        }
        if (properties.hasOwnProperty("enable")) {
            _enable = properties.enable;
            delete properties.enable;
        }
        if (properties.hasOwnProperty("disable")) {
            _disable = properties.disable;
            delete properties.disable;
        }
        extentions = Object.extend({
            initialize: function(module) {
                var that = this;
                xComponent.superclass.initialize.call(that, name, module);
                _init && _init.call(that);
            }
        }, properties);
        if (_enable) {
            extentions.enable = function() {
                var is;
                if (xComponent.superclass.enable.call(this)) {
                    is = _enable.call(this);
                    is == null || (is = true);
                }
                return is;
            };
        }
        if (_disable) {
            extentions.disable = function() {
                var is;
                if (xComponent.superclass.disable.call(this)) {
                    is = _disable.call(this);
                    is == null || (is = true);
                }
                return is;
            };
        }
        xComponent = xBase.extend(extentions);
        component = components[name] = {
            name: name,
            klass: xComponent,
            count: 0,
            instance: [],
            map: {}
        };
        xComponent.create = function(el) {
            var cid = name + "-" + Date.now() + "-" + (component.count + 1), instance;
            el.setAttribute("cid", cid);
            instance = new xComponent(el);
            component.instance.push(instance);
            component.map[cid] = component.length - 1;
            return instance;
        };
        return xComponent;
    }
    function parseXComponents() {
        Object.each(components, function(component, name) {
            var elements = doc.querySelectorAll('*[is="' + name + '"]');
            Object.each(elements, function(el) {
                if (!el.getAttribute("cid")) {
                    component.klass.create(el).enable();
                }
            });
        });
    }
    xBase.createXComponent = createXComponent;
    xBase.parseXComponents = parseXComponents;
    return xBase;
});