## mix.core.util.History

History 作为全局路由服务用于处理 hashchange 事件或 pushState，匹配适合的路由，并触发回调函数。
History 会自动判断浏览器对 pushState 的支持，以做内部的选择。 不支持 pushState 的浏览器将会继续使用基于锚点的 URL 片段， 如果兼容 pushState 的浏览器访问了某个 URL 锚点，将会被透明的转换为真实的 URL。


模块依赖
---------------
Reset, Class, Message


start
------------------

当所有的 路由 创建并设置完毕（路由创建请参考Router），调用 history.start() 开始监控 hashchange 事件并分配路由。
 
需要指出的是，如果想在应用中使用 HTML5 支持的 pushState，只需要这样做：history.start({pushState : true}) 。

如果应用不是基于域名的根路径 /，需要告诉 History 基于什么路径： history.start({pushState: true, root: "/public/search/"})。

当执行后，如果某个路由成功匹配当前 URL，history.start() 返回 true。 如果没有定义的路由匹配当前 URL，返回 false。

如果服务器已经渲染了整个页面，但又不希望开始 History 时触发初始路由，传入 silent : true 即可。

