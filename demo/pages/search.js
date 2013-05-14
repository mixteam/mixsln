/**
 * @author 武仲(wuzhong@taobao.com)
 * @since 5/14/13 3:29 PM
 * @module
 * @description
 *  TODO
 */
//原生支持jsonp，当然普通的ajax也可以的，看具体加载器的加载方式
callback({
    ready : function(param) {
        //设置header，也支持现有的方式
        loader.setHeader();
        //准备css
        loader.prepareCss();
        //准备最外边的div
        loader.prepareContent();
        //获取模板
        getTemplate();
        //获取数据
        getApiData();
        //渲染
        loader.render();
        //page的跳转使用： loader.navi(url,param)/loader.back()
    },
    unload : function() {
        //destory
    }
});