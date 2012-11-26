## mix.core.util.Utilities

无侵入工具方法

用mixin的方式，混入underscore，同时也方便以后自己扩展。

使用方法：

		var Util = require('util'),
			util = new Util()
			;

			consolo.log(util.uniqueId());