## mix.core.ui.Component

提供规范化的模块开发

###模块开发结构

		[button]
			build/
			test/
			src/swipe.js
			module.json

module.json的定义类似package.json

		{
		    "name" : "swipe",
		    "description" : "swipe module",
		    "author" : "zhuxun",
		    "version" : "0.1.0",
		    "namespace" : "mix/modules/",
		    "main" : "./src/swipe.js"
		}

* swipe.js 定义Swipe模块的行为

###使用方法

var $ = require('dom'),
	Swipe = require('swipe'),
	swipe = new Swipe(options)
	;

swipe.render(selector);

###模块封装

./bin/build module_dir [options]

    >node ./bin/build ./swipe
    >21:57:02 - [build] success to "swipe\build\swipe.js"

options如下：

    -b 或 --build-path    编译后存放的路径，默认为build
    -p 或 --package-file  模块描述文件，默认为component.json
    --test				  是否编译用于测试的HTML
    --version-postfix     是否携带版本信息，默认为false
    -v 或 --version       显示版本## mix.core.ui.Module