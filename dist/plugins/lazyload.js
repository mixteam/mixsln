!function(a,b){a.document,b.plugin.lazyload={_options:null,_domready:!1,handleEvent:function(a){"scrollend"===a.type&&this._domready&&this.check()},check:function(){for(var a=this._options,c=a.dataAttr||"data-src",d=b.scroll.getElement().querySelectorAll("img["+c+"]"),e=b.scroll.getScrollTop(),f=e+b.scroll.getViewHeight(),g=0;g<d.length;g++){var h,i=d[g],j=b.scroll.offset(i);(j.top>e&&j.top<f||j.bottom>e&&j.bottom<f)&&(h=i.getAttribute(c))&&(i.setAttribute("src",h),i.removeAttribute(c))}},onNavigationSwitch:function(){this._domready=!1},onDomReady:function(a){this._options=a,this._domready=!0,this.check()},onPageShow:function(a,c){this._options=c,b.scroll.addEventListener("scrollend",this,!1)},onPageHide:function(){b.scroll.removeEventListener("scrollend",this)}}}(window,window.app);