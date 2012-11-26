# mix.core.util.Detect

## 统一环境检测包。
当前版本：V0.2.1

---

### detect
	环境检测核心文件(core)

包含以下组件(plugin)：

### Network
	网络状况检测
### UA
	用户代理检测
### Ability
	能力检测(incoming)
### Hardware
	硬件检测(incoming)
### DeviceAPI
	设备API检测(incoming)

---

## 用法
	1.引入detect.js文件
	2.引入需要的组件
	3.运行

```js
  	DETECT.init();
```

### 4.得到全局对象DETECT.INFO
DETECT.INFO包含如下信息：

```js
  INFO = {
		network: {
			brandwidth:-1,
			type:'',
			grade:''
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
		ability: {},
		hardware: {
			resolution: [],
			performance: ''
		},
		api: {}
	};
```

### 5.取得某一个你想要的信息：
```js
var info = DETECT.INFO.network.type //'WIFI'
```



