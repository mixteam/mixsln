/**
* @fileOverview get fun with CommonJS!
* @author zhuxun.jb@taobao.com
*/
(function(win, doc, undef) {
    if (win["define"]) return;
    var NS_SEP = "/", ID_REG_PREFIX = /^#/, ID_REG_POSTFIX = /\.js$/i, modules = win["modules"] || (win["modules"] = {}), scope = modules, cjs = win, head = win.head || doc.head, basePath = "", aliasReg = [], aliasRep = [], resolvedId = {};
    function parseId(id, useAlias) {
        if (resolvedId[id]) {
            return resolvedId[id];
        }
        var _id = id.replace(ID_REG_PREFIX, "").replace(ID_REG_POSTFIX, "");
        if (useAlias) {
            aliasReg.forEach(function(reg, i) {
                _id = _id.replace(reg, aliasRep[i]);
            });
        }
        return resolvedId[id] = _id;
    }
    function defineNS(ns, name) {
        return ns[name] || (ns[name] = {});
    }
    function findNS(ns, name) {
        return ns[name];
    }
    function buildRequire(moduleId, dependencies) {
        var moduleIdPath = moduleId.split(NS_SEP);
        moduleIdPath.pop();
        dependencies.forEach(function(depsId) {
            var depsIdPath, resolvedPath, resolvedDepsId, path;
            depsId = parseId(depsId, true);
            if (depsId.indexOf(".") === 0) {
                depsIdPath = depsId.split(NS_SEP);
                resolvedPath = moduleIdPath.slice();
                while (path = depsIdPath.shift()) {
                    if (path === "..") {
                        resolvedPath.pop();
                    } else if (path !== ".") {
                        resolvedPath.push(path);
                    }
                }
                resolvedDepsId = resolvedPath.join(NS_SEP);
            }
            if (resolvedDepsId && depsId !== resolvedDepsId) {
                resolvedId[depsId] = resolvedDepsId;
            }
            if (!findNS(scope, resolvedDepsId || depsId)) {
                throw new Error('require a undefined module "' + (resolvedDepsId || depsId) + '" in "' + moduleId + '"');
            }
        });
        return function(id) {
            return require(id);
        };
    }
    function define(moduleId, dependencies, factory) {
        var require, module, exports;
        moduleId = parseId(moduleId);
        module = defineNS(scope, moduleId);
        exports = module.exports;
        if (exports) {
            throw new Error(moduleId + " has already defined");
        } else {
            module.id = moduleId;
            exports = module.exports = {};
        }
        require = buildRequire(moduleId, dependencies);
        if (typeof factory === "function") {
            module.executed = false;
            module.factory = factory;
            module.exports = function() {
                var module = this, factory = module.factory;
                module.exports = factory(require, module.exports, module) || module.exports;
                module.executed = true;
                delete module.factory;
                return module.exports;
            };
        } else {
            module.executed = true;
            module.exports = factory;
        }
    }
    function require(moduleId) {
        moduleId = parseId(moduleId, true);
        var module = findNS(scope, moduleId);
        if (module && module.exports) {
            return module.executed ? module.exports : module.exports();
        } else {
            throw new Error(moduleId + " has not defined");
        }
    }
    // function load(url, callback) {
    // 	var script = doc.createElement('script')
    // 		;
    // 	if (url.indexOf('http') < 0) {
    // 		url = basePath + url;
    // 	}
    // 	script.loaded = false;
    // 	script.type = 'text/javascript';
    // 	script.async = true;
    // 	script.onload = script.onreadystatechange  = function() {
    // 		if (!script.loaded) {
    // 			script.loaded = true;
    // 			callback && callback();
    // 		}
    // 	}
    // 	script.src = url;
    // 	head.appendChild(script);
    // }
    // function use(dependencies, callback) {
    // 	var args = [];
    // 	if (typeof dependencies === 'string') {
    // 		dependencies = [dependencies];
    // 	}
    // 	dependencies.forEach(function(id) {
    // 		args.push(require(id));
    // 	});
    // 	callback && callback.apply(win, args);
    // }
    // function alias(opt) {
    // 	basePath = opt.basePath;
    // 	if (opt.alias) {
    // 		for (var name in opt.alias) {
    // 			var value = opt.alias[name]
    // 				;
    // 			aliasReg.push(new RegExp('^' + name, 'i'));
    // 			aliasRep.push(value);
    // 		}
    // 	}
    // }
    cjs.define = define;
    cjs.require = require;
})(window, window.document);