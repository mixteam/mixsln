## mix.core.ui.Component

提供规范化的组件开发

###组件开发结构

		[button]
			build/
			test/
			src/button.js
			assets/button.less
			assets/button.mu
			component.json

****NOTE(2012/11/20)*******
以下段落内容过期,当前componet.json已废弃,内容并入package.json。生成seajs模块的编译方法为，进入组件目录，运行"$node ../_bin/build" .

其中componet.json的定义类似package.json，增加了template和style两个配置项的设置

		{
		    "name" : "button",
		    "description" : "button component",
		    "author" : "zhuxun",
		    "version" : "0.1.0",
		    "namespace" : "mix/components/",
		    "main" : "./src/button.js",
		    "template" : "./assets/button.mu",
		    "style" : "./assets/button.less"
		}

* button.js 定义Button组件的行为
* button.less 定义Button组件的样式
* button.mu 定义Button组件的结构（模版）

###使用方法

var $ = require('dom'),
	Button = require('button'),
	btn = new Button(data)
	;

btn.render();

$(document.body).append(btn.getDom());

###组件封装

./bin/build component_dir [options]

    >node ./bin/build ./button
    >21:57:02 - [build] success to "button\build\button.js"

options如下：

    -b 或 --build-path    编译后存放的路径，默认为build
    -p 或 --package-file  模块描述文件，默认为component.json
    --test				  是否编译用于测试的HTML
    --version-postfix     是否携带版本信息，默认为false
    -v 或 --version       显示版本