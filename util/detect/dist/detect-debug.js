/**
 * @fileOverview 统一环境检测包[Detect] Core 核心文件，在应用的最初始时加载，保持最简洁，无任何依赖
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.3.1
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//
// TODO: 
//  - 

(function(w) {

	var INFO, init, detect, key, d = w.document;

	if(typeof DETECT === "undefined") {
		DETECT = {};
	}

	if(DETECT.version) {
		return;
	}

	DETECT.version = "0.1";

	//全局DETECT信息初始化
	INFO = {
		network: {
			brandwidth:-1, //单位 kb/s，空值为-1
			type:'',
			grade:'',
			//grade等级标准粗略定义：
			//低：slow：1kbps - 768kbps
			//中：medium：：768kbps - 1.5mbps
			//高：fast：1.5mbps+
			online:'' //'online'，'offline'，false
		},
		ua: {
			plat: {
				name:'',
				version:''
			},
			device: {
				name:'',
				version:''
			},
			browser: {
				name:'',
				version:'',
				webkitversion:''
			}
		},
		ability: {

		},
		hardware: {
			resolution: [],
			performance: ''
		},
		api: {}
	};

	init = {
		beacon_url: "",

		site_domain: w.location.hostname.
					replace(/.*?([^.]+\.[^.]+)\.?$/, '$1').
					toLowerCase(),

		user_ip: ''
	};

	detect = {
		utils: {

			getCookie: function(name) {
				if(!name) {
					return null;
				}

				name = ' ' + name + '=';

				var i, cookies;
				cookies = ' ' + d.cookie + ';';
				if ( (i=cookies.indexOf(name)) >= 0 ) {
					i += name.length;
					cookies = cookies.substring(i, cookies.indexOf(';', i));
					return cookies;
				}

				return null;
			},

			setCookie: function(name, subcookies, max_age) {
				var value=[], k, nameval, c, exp;

				if(!name) {
					return false;
				}

				for(k in subcookies) {
					if(subcookies.hasOwnProperty(k)) {
						value.push(encodeURIComponent(k) + '=' + encodeURIComponent(subcookies[k]));
					}
				}

				value = value.join('&');

				nameval = name + '=' + value;

				c = [nameval, "path=/", "domain=" + impl.site_domain];
				if(max_age) {
					exp = new Date();
					exp.setTime(exp.getTime() + max_age*1000);
					exp = exp.toGMTString();
					c.push("expires=" + exp);
				}

				if ( nameval.length < 4000 ) {
					d.cookie = c.join('; ');
					// confirm cookie was set (could be blocked by user's settings, etc.)
					return ( value === this.getCookie(name) );
				}

				return false;
			},

			removeCookie: function(name) {
				return this.setCookie(name, {}, 0);
			},

			print: function(){
				document.getElementById('J_DETECT').innerHTML = ('DETECT.INFO：<br/>'+JSON.stringify(DETECT.INFO));
			},

			pluginConfig: function(o, config, plugin_name, properties) {
				var i, props=0;
				if(!config || !config[plugin_name]) {
					return false;
				}

				for(i=0; i<properties.length; i++) {
					if(typeof config[plugin_name][properties[i]] !== "undefined") {
						o[properties[i]] = config[plugin_name][properties[i]];
						props++;
					}
				}

				return (props>0);
			}

		},

		init: function(config){

			var k;

			if(!config) {
				config = {};
			}

			for(k in this.plugins) {

				/*
				if( config[k]
					&& ("enabled" in config[k])
					&& config[k].enabled === false
				) {
					init.disabled_plugins[k] = 1;
					continue;
				}

				else if(init.disabled_plugins[k]) {
					delete init.disabled_plugins[k];
				}
				*/

				//如果有plugin，则执行plugin的init
				if(this.plugins.hasOwnProperty(k)
					&& typeof this.plugins[k].init === "function"
				) {
					this.plugins[k].init(config);
				}
			}

			return this;

		},

		info: function(){

		}
	};

	detect.INFO = INFO;

	for(key in detect) {
		if(detect.hasOwnProperty(key)) {
			DETECT[key] = detect[key];
		}
	}

	DETECT.plugins = DETECT.plugins || {};

}(window));