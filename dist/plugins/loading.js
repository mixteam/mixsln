(function(e,t){var n,a,i,o=e.document,r=(t.config,[]);t.plugin.loading={show:function(e){if(e&&(i.innerHTML=e,"block"!==a.style.display)){a.style.display="block";var t=document.body.getBoundingClientRect(),n=i.getBoundingClientRect();i.style.left=(t.width-n.width)/2+"px",i.style.top=(window.innerHeight-n.height)/2-t.top+"px"}var o=Date.now();return r.push(o),o},hide:function(e){e?r.splice(r.indexOf(e),1):r=[],0===r.length&&(i.innerHTML="",a.style.display="none")},onAppStart:function(){a=document.createElement("div"),a.className="loading",a.style.cssText=["display: none","background: transparent","position: absolute","width: 100%","height: 100%","left: 0","top: 0","overflow: hidden","z-index: 99999"].join(";"),i=document.createElement("div"),i.style.cssText=["position:absolute","width: 100px","height: 90px","line-height: 100px","background-color: rgba(0,0,0,0.5)","color: #FFF","text-align: center","font-size: 11px","border-radius: 13px"].join(";"),a.appendChild(i),o.body.appendChild(a)},onNavigationSwitch:function(){n=this.show("正在加载")},onDomReady:function(){this.hide(n)}}})(window,window.app);