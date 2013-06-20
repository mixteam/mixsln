(function(win, undef) {
    var doc = win.document,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        WindVane = win.WindVane || (win.WindVane = {}),
        WindVane_Native = win.WindVane_Native,
        callbackMap = {},
        iframePool = [], iframeLimit = 3,
   
        WV_Data = {
            LOCAL_PROTOCOL: 'hybrid',
            KV_SPLIT: '=',
            PARAM_SPLIT: '&',
            MSG_TIMEOUT: 'TIMEOUT'
        },
   
        WV_Core = {
            call: function(obj, method, param, successCallback, failureCallback, timeout) {
                var sid;

                if (timeout > 0) {
                    sid = setTimeout(function() {
                        WV_Core.onFailure(sid, {ret:WV_Data.MSG_TIMEOUT});
                    }, timeout);
                } else {
                    sid = WV_Private.getSid();
                }

                WV_Private.registerCall(sid, successCallback, failureCallback);

                if (WindVane_Native && WindVane_Native.callMethod) {
                    WindVane_Native.callMethod(obj, method, WV_Private.buildParam(param), sid + '');
                } else {
                    WV_Private.callMethod(obj, method, WV_Private.buildParam(param), sid + '');
                }
            },
       
            fireEvent: function(eventname, eventparam) {
                var ev = doc.createEvent('HTMLEvents');
                ev.initEvent(eventname, true, true);
                ev.param = WV_Private.parseParam(eventparam);
                doc.dispatchEvent(ev);
            },

            // {ret:'SUCCESS', value:{'a':1}}
            onSuccess: function(sid, msg) {
                clearTimeout(sid);
                var func = WV_Private.unregisterCall(sid).success;
                func && func(WV_Private.parseParam(msg));

                if (WindVane_Native && WindVane_Native.onComplete) {
                    WindVane_Native.onComplete(sid);
                } else {
                    WV_Private.onComplete(sid);
                }
            },


            // {ret:'FAILURE', value:{'a':1}}
            onFailure: function(sid, msg) {
                clearTimeout(sid);
                var func = WV_Private.unregisterCall(sid).failure;
                func && func(WV_Private.parseParam(msg));
                
                if (WindVane_Native && WindVane_Native.onComplete) {
                    WindVane_Native.onComplete(sid);
                } else {
                    WV_Private.onComplete(sid);
                }
            }
        },
   
        WV_Private = {
            //ifUseIframe: false,

            buildParam: function(obj) {
                var str = '';

                if (obj && typeof obj === 'object') {
                    for (var key in obj) {
                        str += (key + WV_Data.KV_SPLIT + obj[key] + WV_Data.PARAM_SPLIT);
                    }
                } else {
                    str = obj || '';
                }
       
                return str + '_ts=' + Date.now();
                // return JSON.stringify(obj);
            },

            parseParam: function(str) {
                var obj = {};

                if (str && typeof str === 'string') {
                    // str = str.split(WV_Data.PARAM_SPLIT);
                    // for (var i = 0; i < str.length; i++) {
                    //     if (str[i]) {
                    //         str[i] = str[i].split(WV_Data.KV_SPLIT);
                    //         obj[str[i][0]] = obj[str[i][1]];
                    //     }
                    // }
                    obj = JSON.parse(str);
                } else {
                    obj = str || {};
                }

                return obj;
            },

            getSid: function() {
                return Math.floor(Math.random() * (1 << 50));
            },
       
            getIframeId: function(sid) {
                return 'iframe_' + sid;
            },

            getSuccessId: function(sid) {
                return 'suc' + sid;
            },
       
            getFailedId: function(sid) {
                return 'err_' + sid;
            },
       
            registerCall: function(sid, successCallback, failedCallback) {
                if (successCallback) {
                    callbackMap[this.getSuccessId(sid)] = successCallback;
                }
       
                if (failedCallback) {
                    callbackMap[this.getFailedId(sid)] = failedCallback;
                }
            },
       
            unregisterCall: function(sid) {
                var sucId = this.getSuccessId(sid),
                    failId = this.getFailedId(sid)
                    call = {
                        success: callbackMap[sucId],
                        failure: callbackMap[failId]
                    }
                    ;

                delete callbackMap[sucId];
                delete callbackMap[failId];
                return call;
            },

            useIframe: function(sid, url) {
                //this.ifUseIframe || (this.ifUseIframe = true);

                var iframeid = this.getIframeId(sid),
                    iframe = iframePool.pop()
                    ;

                if (!iframe) {
                    iframe = doc.createElement('iframe');
                    iframe.setAttribute('frameborder', '0');
                    iframe.style.cssText = 'width:0;height:0;border:0;display:none;';
                }

                iframe.setAttribute('id', iframeid);
                iframe.setAttribute('src', url);

                if (!iframe.parentNode) {
                    setTimeout(function() {
                        doc.body.appendChild(iframe);
                    },5);
                }
            },

            retrieveIframe : function(sid) {
                //if (!this.ifUseIframe) return;

                var iframeid = this.getIframeId(sid),
                    iframe = doc.querySelector('#' + iframeid)
                    ;

                if (iframePool.length >= iframeLimit) {
                    doc.body.removeChild(iframe);
                } else {
                    iframePool.push(iframe);
                }
            },

            callMethod: function(obj, method, param, sid) {
                // [for protocol] hybrid://objectName:sid/methodName?a=b&c=d
                var src = WV_Data.LOCAL_PROTOCOL + '://' + obj + ':' + sid + '/' + method + '?' + param;
                this.useIframe(sid, src);
            },

            onComplete: function(sid) {
                this.retrieveIframe(sid);
            }
        }
        ;

    for (var key in WV_Core) {
        if (!hasOwnProperty.call(WindVane, key)) {
            WindVane[key] = WV_Core[key];
        }
    }
})(window);