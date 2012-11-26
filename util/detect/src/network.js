/**
 * @fileOverview 统一环境检测包[Detect] Network网络环境嗅探
 * @author SMbey0nd http://github.com/SMbey0nd
 * @version 0.3.0
 * MIT Licensed.
 */
// --------------------------------
// Thanks to:
//  - boomerang http://lognormal.github.com/boomerang/doc/howtos/index.html
//
// 0.3.1：
//  - 优化图片：1.png换成jpg，减少内存占用、减少电量消耗。2.图片总体积压缩1倍，超时时间减少1倍。
//
// 0.3.0：
//  - 新增图片连续测速失败则退出的逻辑处理，增加离线判断逻辑，修复若干BUG
//
// TODO: 
//  - 缩小优化图片尺寸
//  - 增加webtiming
//  - 增加延迟细节测量 - 效仿facebook dopplor，先发一个0K极小图片获得DNS延迟

(function(w) {

	DETECT = DETECT || {};
	DETECT.plugins = DETECT.plugins || {};

	var IMG_TIMEOUT = 600; //快捷设置统一图片超时时间
	var images = [
		//TODO：{ name: "image-l.gif", size: 0, timeout: 0}, //16kbps - 2k
		{ name: "http://img04.taobaocdn.com/tps/i4/T1t._HXjxXXXbGICsI-120-120.jpg", size: 886, timeout: IMG_TIMEOUT }, //16kbps - 1k
		{ name: "http://img01.taobaocdn.com/tps/i1/T1dD_GXhBgXXakeN3e-390-390.jpg", size: 6530, timeout: IMG_TIMEOUT }, //56kbps - 3.5k
		{ name: "http://img02.taobaocdn.com/tps/i2/T10MfHXidcXXauBRvZ-618-618.jpg", size: 15870, timeout: IMG_TIMEOUT }, //128kbps - 8k
		{ name: "http://img03.taobaocdn.com/tps/i3/T1fr2HXdBdXXbwcy7e-950-950.jpg", size: 47613, timeout: IMG_TIMEOUT }, //384kbps - 24k
		{ name: "http://img04.taobaocdn.com/tps/i4/T1gYrHXjNgXXc1iuUZ-1194-1194.jpg", size: 64390, timeout: IMG_TIMEOUT } //512kbps - 32k
		/*
		{ name: "image-5.png", size: 4509613, timeout: 1200 },
		{ name: "image-6.png", size: 9084559, timeout: 1200 }
		// image-l.gif http://img04.taobaocdn.com/tps/i4/T13ivDXhNmXXc6Yc2r-1-1.gif
		*/
	];
	images.end = images.length;
	images.start = 0;

	var core = {
		//属性
		base_url: '', // ../src/images/
		timeout: 7000, //15000
		exptime: 86400000, //一天
		ignore_num: 3, //连续几次失败则跳出

		//状态
		results: [],
		running: false,
		aborted: false,
		complete: false,
		//runs_left: 1,

		//方法
		//图片加载后的后续处理，定义result集合，写入该图片load时间，超时处理等
		prefix: function(){
			var type = this.checktype();
			DETECT.INFO.network.type = type;

			var online = this.checkonline();
			DETECT.INFO.network.online = online;

			//读取localstrage
			var info = this.getLocal('DETECT_INFO');

			//console.log(info);
			if(info && !this.exp()){ //本地已有数据并且没过期，记入DETECT并退出
				var bw = info.brandwidth,
					grade = info.grade;
				DETECT.INFO.network.brandwidth = parseInt(bw);
				DETECT.INFO.network.grade = grade;
				DETECT.utils.print();
				console.log('读取localstrage');
				return;
			}

			//如果本地没有数据，并且是离线状态，直接退出
			if(online == 'offline'){
				return;
			}

			//alert(this.timeout);
			setTimeout(DETECT.plugins.network.abort, this.timeout);
			core.defer(core.iterate); //延迟10ms执行iterate //iterate用来初始化result中的r 并执行load_img

		},
		exp:function(){ //1天=24*60*60*1000=86400000毫秒
			var now = new Date().getTime(), local = this.getLocal('DETECT_INFO').exptime;
			return now - local >= this.exptime;
		},
		getLocal: function(k){
			var k = localStorage.getItem(k);
			return ((k===null||k==='undefined')?null:JSON.parse(k)); //BUGFIX：Android webkit不支持JSON.parse(null)，会报错，所以增加一层判断
		},
		setLocal: function(k,v){
			v = JSON.stringify(v);
			return localStorage.setItem(k,v);
		},
		img_loaded: function(i, tstart, success){ //参数：当前图片序号、开始时间、剩余次数-1(5)、true
		
			if(this.results[i])	{	//当前图片已测过 
				return;
			}

			/*
			// 如果超时，设置下一张图，终止
			if(success === null) { //当前超时
				this.results[i+1] = {t:null, state: null}; //设置下一张图
				return;
			}
			*/
			var result = {
					start: tstart,
					end: new Date().getTime(),
					t: null,
					state: success
				};

			// 如果成功则记录时间差
			if(success) {
				result.t = result.end - result.start; //如果失败，result.t则是null
			}

			this.results[i] = result;

			//如果1、2、3的state都是null，则跳出
			var ignore = this.ignore_num;
			if(i == ignore-1){ //仅在第3张图时检查
				var l = [], hash = {};
				for(var j=0;j<ignore;j++){
					//l[j] = this.results[j].state;
					l[j] = (this.results[j].state == true ? 1 : 0);
					hash[l[j]] = (l[j] == 1 ? true: false);
				}
				var n = 0;
				for(var k in hash){
					n++;
				}
				//console.log(n);
				//console.log(hash);
				if(n == 1 && hash[0] && hash[0] == false){
					console.log(l);
					console.log('连续'+ignore+'次失败，可能已经掉线');
					//DETECT.plugins.network.abort();
					return false;
				}
			}


			// 图片加载超时（网速太慢），则跳到下一张
			if(i >= images.end-1 //当前图片序号是最后一张 或者
				|| typeof this.results[i+1] !== "undefined" //r[i+1]有值
			) {
				//第一次运行是一个试点来决定我们可以下载的最大图片是什么，然后后续run只下载图像就够了
				/*
				if(run === this.nruns) { //如果当前大轮训次数 === 大轮询总次数
					images.start = i; //images.start 为当前图片序号
					//alert(i);
				}
				*/
				//this.defer(this.iterate); //延迟10ms执行iterate //iterate用来初始化result中的r 并执行load_img
				this.finish();
			} else {
				this.load_img(i+1, this.img_loaded); //进入下一张图，执行load_img 参数：当前图片序号+1、剩余次数-1(5)、img_loaded回调
			}
		},
		finish: function(){
			//计算bw
			var bw = this.calculate(),
				grade = this.grade(bw),
				type = DETECT.INFO.network.type;

			//setcookies
			//写入INFO
			DETECT.INFO.network.brandwidth = bw;
			DETECT.INFO.network.grade = grade;
			//document.body.innerHTML = ('DETECT.INFO：<br/>'+JSON.stringify(DETECT.INFO));
			DETECT.utils.print();

			//写入localstorage
			/*
			localStorage.setItem('DETECT_INFO_NETWORK', true);
			localStorage.setItem('DETECT_INFO_NETWORK_BRANDWIDTH', bw);
			localStorage.setItem('DETECT_INFO_NETWORK_GRADE', grade);
			*/
			var exptime = new Date().getTime();
			//console.log(o);
			this.setLocal('DETECT_INFO', {type:type,brandwidth:bw,grade:grade,exptime:exptime});
			//console.log(JSON.parse(this.getLocal('DETECT_INFO')));

			this.complete = true;
			this.running = false;
		},
		checkonline:function(){
			var online = navigator.onLine;
			if(navigator.hasOwnProperty('onLine')){
				return online?'online':'offline';
			}else{
				return false;
			}
		},
		checktype: function(){
			//var isOnline = navigator.onLine;
			var connection = navigator.connection;
			if(connection){
				//var onlinetxt = isOnline?'在线':'不在线';
				var type = '';
				switch(connection.type){
					case connection.UNKNOWN:
						type = 'UNKNOWN';
						break;
					case connection.ETHERNET:
						//type = navigator.connection.ETHERNET + 'ETHERNET';
						type = 'ETHERNET';
						break;
					case connection.WIFI:
						//type = navigator.connection.WIFI + 'WIFI';
						type = 'WIFI';
						break;
					case connection.CELL_2G:
						//type = navigator.connection.CELL_2G + '2G';
						type = '2G';
						break;
					case connection.CELL_3G:
						//type = navigator.connection.CELL_3G + '3G';
						type = '3G';
						break;
				}
				return type;

			}else{
				return false;
			}
		},
		calculate: function(){
			//计算
			var result = -1,
				nimgs=0,
				bw,
				sum=0,
				bandwidths=[],
				r=this.results;
			for(i=r.length-1; i>=0; i--) {
				if(!r[i]) {
					break;
				}
				if(r[i].t === null) {
					continue;
				}
				nimgs++;
				bw = images[i].size*1000/r[i].t; // 字节/秒
				bandwidths.push(bw);
			}
			
			var n = bandwidths.length;
			for(j=0; j<n; j++){
				sum += bandwidths[j];
				//alert(bandwidths[j]);
			}
			result = Math.round(sum/n);
			console.log(nimgs+'次平均网速：'+ result +'字节/秒，相当于' + result*8/1000 + 'Kbps');
			return result;
		},
		grade: function(bw){
			//网速：
			//低速（2G）：76.8kbps-
			//中速（WIFI/3G）：76.8kbps-150kbps
			//高速（WIFI/3G）：150kbps+
			var bps = bw*8;
			if(bps>0 && bps<76800){
				return 'slow';
			}else if(bps>=76800 && bps<150000){
				return 'medium';
			}else if(bps>=150000){
				return 'fast';
			}
		},

		//延迟10ms
		defer: function(func){
			var that = this;
			return setTimeout(function(){func.call(that); that=null;}, 10);
		},
		load_img: function(i, callback){ //参数：当前图片序号、剩余次数-1(5)、img_loaded回调
			var url = this.base_url + images[i].name
				+ '?t=' + (new Date().getTime()) + Math.random(), // Math.random() is slow, but we get it before we start the timer
				timer = 0, tstart = 0,
				img = new Image(),
				that = this;

			//img的onload和定时器同时触发，如果onload在timeout时间内完毕，则清楚定时器，进入正常流
			//如果超出timeout还没onload，则直接调用callback，成功参数传入null
			img.onload = function() {
				img.onload=img.onerror=null;
				img=null;
				clearTimeout(timer); //清除定时器
				if(callback) {
					callback.call(that, i, tstart, true); //回调img_loaded 参数：this、当前图片序号、开始时间、剩余次数-1(5)、成功
				}
				that=callback=null;
			};
			img.onerror = function() {
				img.onload=img.onerror=null;
				img=null;
				clearTimeout(timer);
				if(callback) {
					callback.call(that, i, tstart, false);
				}
				that=callback=null;
			};

			timer = setTimeout(function() { //在当前images设定的timeout时间后，再执行一个img_loaded回调
						if(callback) {
							callback.call(that, i, tstart, null);
						}
					},
					images[i].timeout
					//	+ Math.min(400, this.latency ? this.latency.mean : 400)
				);

			tstart = new Date().getTime();
			img.src = url;

		},

		iterate: function(finish){
			if(this.aborted) {
				return false;
			}

			if(finish) { //如果runs_left为0 就结束
				this.finish();
			}
			/*
			else if(this.latency_runs) {
				this.load_img('l', this.latency_runs--, this.lat_loaded);
			}
			*/
			else {
				//this.results.push({}); //初始化一个新的r
				this.load_img(images.start, this.img_loaded); //参数：当前图片序号、大轮训次数-1去掉、img_loaded回调
			}
		}
	};

	DETECT.plugins.network = {
		init: function(config){
			DETECT.utils.pluginConfig(core, config, "network");
			//core.runs_left = 1;

			//页面加载完成后
			this.run();

			return this;
		},
		run: function(){
			core.running = true;
			core.prefix();

			return this;
		},
		abort: function(){
			core.aborted = true;
			if(core.running) core.finish();
			console.log('超过预设时间：' + core.timeout);
			return this;
		}
	};


}(window));