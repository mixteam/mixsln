(function(a,b){function e(){return d?d.fn.getScrollTop():c.body.scrollTop}function g(){return d?d.offsetHeight:c.body.clientHeight}var d,c=a.document;b.plugin.lazyload={_options:null,_getOffset:function(a){var h,e=b.component.getActiveContent(),f=getComputedStyle(a),g=parseFloat(a.getAttribute("height")||a.offsetHeight||f.height),i=parseFloat(a.offsetTop),j=0;if(!d)for(h=e.parentNode;h!=c.body;)j+=parseFloat(h.offsetTop),h=h.parentNode;for(h=a.parentNode;h!=e;)i+=parseFloat(h.offsetTop),h=h.parentNode;return{top:i+j,bottom:i+g+j}},check:function(){for(var a=this._options,c=a.page.dataAttr||"data-src",d=b.component.getActiveContent(),f=d.querySelectorAll("img["+c+"]"),h=e(),i=e()+g(),j=0;f.length>j;j++){var m,k=f[j],l=this._getOffset(k);(l.top>h&&i>l.top||l.bottom>h&&i>l.bottom)&&(m=k.getAttribute(c),m&&(k.setAttribute("src",m),k.removeAttribute(c)))}},on:function(a,e){this._options=e,d=b.component.get("scroll"),this.check=this.check.bind(this),d?b.component.on("scrollEnd",this.check):c.addEventListener("touchend",this.check,!1),a.on("rendered",this.check,this)},off:function(a){d?b.component.off("scrollEnd",this.check):c.removeEventListener("touchend",this.check,!1),a.off("rendered",this.check,this)}}})(window,window.app);