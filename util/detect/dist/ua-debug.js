/**
 * @fileOverview 统一环境检测包[Detect] UA检测
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.2.0
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//  - zepto detect module
//
// 0.2.0：
//  - 增加iPod、UC、QQ
//  - 增加webkitversion字段，以应对套壳浏览器
//
// TODO: 
//  - 除错和测试，增加新设备，观察不同设备的特点

(function(w) {

	DETECT = DETECT || {};
	DETECT.plugins = DETECT.plugins || {};

	var core = {
		rule: function(){
			var ua = navigator.userAgent;
			var D = DETECT.INFO.ua;
		    var webkit = ua.match(/WebKit\/([\d.]+)/),
				android = ua.match(/(Android)\s+([\d.]+)/),
				ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
				iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
				ipod = ua.match(/(iPod.*OS)\s([\d_]+)/),
				webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
				blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
				uc_webkit = ua.match(/UC\sAppleWebKit\/([\d.]+)/),
				uc_proxy = ua.match(/(UCWEB)(\d.+?(?=\/))/), //TIPS: (\d.+?(?=\/)) 中的 \d是数字 .是任意 +?是懒惰模式只匹配一次 (?=\/)是零宽断言只匹配斜杠前面的部分不包含斜杠
				qq = ua.match(/(MQQBrowser)\/(\d.+?(?=\/|\sMozilla)).*AppleWebKit\/([\d.]+)/);

			//浏览器信息
			if(webkit){D.browser.name = 'webkit', D.browser.version = D.browser.webkitversion = webkit[1];}
			//TIPS：uc-webkit的检测结果会包含webkit的检测结果，因为都有webkit字样；所以webkit放在最前面。
			//TIPS：iOS下的UC的webkit模式，跟Safari的UA特征一致，无法区分
			if(uc_webkit){
				D.browser.name = 'uc-webkit', D.browser.webkitversion = uc_webkit[1];
			}
			//TIPS：uc的webkit模式，UA不带浏览器自身版本号，只带webkit版本号。而proxy模式，UA只带浏览器自身版本号。
			if(uc_proxy){
				D.browser.name = 'uc-proxy', D.browser.version = uc_proxy[2];
			}
			//TIPS：QQ同时带有自身版本号和webkit版本号
			if(qq){
				if(qq[2].length == 2) qq[2] = qq[2].replace(/(\d)/,"$1."); //TIPS：iOS上qq版本号比较凌乱且中间不带. 只能手动加上
				D.browser.name = 'qq', D.browser.version = qq[2], D.browser.webkitversion = qq[3];
			}

			//平台信息
			if(android) D.plat.name = 'android', D.plat.version = android[2];
			if(iphone) D.plat.name = 'ios', D.plat.version = iphone[2].replace(/_/g, '.'), D.device.name = 'iphone';
			if(ipad) D.plat.name = 'ios', D.plat.version = ipad[2].replace(/_/g, '.'), D.device.name = 'ipad';
			if(ipod) D.plat.name = 'ios', D.plat.version = ipod[2].replace(/_/g, '.'), D.device.name = 'ipod';
			if(webos) D.plat.name = 'webos', D.plat.version = webos[2];
			//TODO：缺少device版本，如4S等，待观察
		}

	};

	DETECT.plugins.UA = {
		init: function(config){
			DETECT.utils.pluginConfig(core, config, "UA");
			core.rule();
		}
	}

}(window));