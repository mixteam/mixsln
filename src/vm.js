function ArrayViewModel(data,parent) {
    var me = new Array(data.length);
    var children = {};
    for(var i = 0; i < data.length; i++) {
        void function(p){
                Object.defineProperty(this,p,{
                    get:function(){
                        if(typeof data[p] == "object")
                            return children[p];
                        else return data[p];
                    }, 
                    set:function(v){
                        data[p] = v ;
                        if(typeof data[p] == "object") {
                            children[p] = new ViewModel(data[p]);
                            children[p].addEventListener("propertyChange",function(e){
                                me.dispatchEvent({type:"propertyChange",propertyName:p,path:p+"."+e.path});
                            })
                        }
                        this.dispatchEvent({type:"propertyChange",propertyName:p,path:p});
                    }
                });
                if(typeof data[p] == "object") {
                    children[p] = new ViewModel(data[p]);
                    children[p].addEventListener("propertyChange",function(e){
                        me.dispatchEvent({type:"propertyChange",propertyName:p,path:p+"."+e.path});
                    })
                }
        }.call(me,i);
    }
    EventSource.call(me);
    return me;
}

function ViewModel(data,parent) {
    if(data instanceof Array)
        return new ArrayViewModel(data,parent);
    var children = {};
    var me = this;
    for(var p in data) {
        if(data.hasOwnProperty(p)) {
            void function(p){
                Object.defineProperty(this,p,{
                    get:function(){
                        if(typeof data[p] == "object")
                            return children[p];
                        else return data[p];
                    }, 
                    set:function(v){
                        data[p] = v ;
                        if(typeof data[p] == "object") {
                            children[p] = new ViewModel(data[p]);
                            children[p].addEventListener("propertyChange",function(e){
                                me.dispatchEvent({type:"propertyChange",propertyName:p,path:p+"."+e.path});
                            })
                        }
                        this.dispatchEvent({type:"propertyChange",propertyName:p,path:p});
                    }
                });
                if(typeof data[p] == "object") {
                    children[p] = new ViewModel(data[p]);
                    children[p].addEventListener("propertyChange",function(e){
                        me.dispatchEvent({type:"propertyChange",propertyName:p,path:p+"."+e.path});
                    })
                }
            }.call(this,p);
        }
    }
    EventSource.call(this);
}