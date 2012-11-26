## mix.core.ui.Template

支持Mustache语法的模板引擎（核心渲染引擎为[Handlebars](https://github.com/mixteam/handlebars.js)，[使用文档](http://handlebarsjs.com/)）

###使用方法：

    var Template = require('template'),
        tmpl = new Template('template.js demo'),
        html
        ;
        
        tmpl.compile('{{name}}, helloworld!');
        
        html = tmpl.all({
          name : 'MIX'
        });
        
        console.log(html);
        
###输出：

    > MIX, helloworld!

支持chunk方式局部更新

###使用方法：
    var Template = require('template'),
        tmpl = new Template('template.js demo'),
        html
        ;
        
        tmpl.compile('{{#chunk first}}{{name}}, helloworld! +
                      '{{/chunk}}{{#chunk second}} I'm {{name}}.{{/chunk}}');
        
        html = tmpl.all({
          first : {
            name : 'MIX'
          },
          second : {
            name : 'Zhu Xun'
          }
        });
        
        console.log(html);
        
        html = tmpl.update('second', {
          name : 'Jin Bo'
        });
        
        console.log(html);

###输出

    > MIX, hellworld! I'm Zhu Xun.
    
    > MIX, hellworld! I'm Jin Bo.
    
其中`chunk`的Blocker行为类似于原生的`with`，同时定义了片段。

update方法，需要提供一个指向片段的路径以及更新该片段的数据。

更多复杂的模板例子可以参加[test.html](https://github.com/mixteam/template.js/tree/master/test/test.html)

###0.2版本会加入的东东

* 可以把渲染出来的dom组装为dom
* 支持dom的局部更新
  