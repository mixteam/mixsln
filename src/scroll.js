function quadratic2cubicBezier(a, b) {
    return [[(a / 3 + (a + b) / 3 - a) / (b - a), (a * a / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)],
        [(b / 3 + (a + b) / 3 - a) / (b - a), (b * b / 3 + a * b * 2 / 3 - a * a) / (b * b - a * a)]];
}


Array.prototype.slice.call(document.querySelectorAll(".content")).forEach(function(element){
    enableGestureEvents(element);
    var originalY;
    var currentY;


    function getMaxScrollTop() {
        return -element.scrollHeight+element.parentNode.offsetHeight-88;
    }

    element.addEventListener("touchstart",function(){
        element.style.webkitTransition = "none";
        element.style.webkitTransform = getComputedStyle(element).webkitTransform;
    },false)

    element.addEventListener("panstart",function(e){
        originalY = 0;
        var transform = getComputedStyle(element).webkitTransform;
        if(transform == "none")
            originalY = 0;
        else {
            if(transform.match(/^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/))
                originalY = parseInt(RegExp.$2)||0;
            else if(transform.match(/^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/))
                originalY = parseInt(RegExp.$2)||0;
        }
        //console.log(e.displacementX,e.displacementY);
    },false)
    element.addEventListener("pan",function(e){
        currentY = originalY + e.displacementY;
        //currentY = 0;
        if(currentY>0) {
            element.style.webkitTransform = "translate3d(0,"+ (currentY/2)+"px,0)";
        }
        else if(currentY<getMaxScrollTop()) {
            element.style.webkitTransform = "translate3d(0,"+ ((getMaxScrollTop()-currentY)/2+currentY)+"px,0)";
        }
        else {
            element.style.webkitTransform = "translate3d(0,"+ currentY+"px,0)";
        }
    },false);
                                                                          
    //panend happened before flick, transition will be overwrite by flick event if there is
    element.addEventListener("panend",function(e){
        if(currentY>0) {
            element.style.webkitTransition = "-webkit-transform 0.4s ease-out 0s";
            element.style.webkitTransform = "translate3d(0,0,0)";
            waitTransition(element,"-webkit-transform",function(){
                element.style.webkitTransition = "none";
            });
        }
        if(currentY<getMaxScrollTop()) {
            element.style.webkitTransition = "-webkit-transform 0.4s ease-out 0s";
            element.style.webkitTransform = "translate3d(0,"+getMaxScrollTop()+"px,0)";
            waitTransition(element,"-webkit-transform",function(){
                element.style.webkitTransition = "none";
            });
        }


    },false)

    element.addEventListener("flick",function(e){
        if(currentY<getMaxScrollTop()||currentY>0)
            return;
        var s0 = 0;

        var transform = getComputedStyle(element).webkitTransform;
        if(transform.match(/^matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, ([\d-]+), ([-\d]+), [\d-]+, \d+\)/))
            s0 = parseInt(RegExp.$2)||0;
        else if(transform.match(/^matrix\(\d+, \d+, \d+, \d+, ([-\d]+), ([-\d]+)\)$/))
            s0 = parseInt(RegExp.$2)||0; 

        var v0 = e.valocityY;

        if(v0>1.5) v0 = 1.5;
        if(v0<-1.5) v0 = -1.5;
        
        var a = 0.0015*(v0/Math.abs(v0));
        var t = v0/a;

        var s = s0 + t*v0/2;

        if( s > 0 || s<getMaxScrollTop() ) {
            var sign = s > 0 ? 1 : -1;
            var edge = s > 0 ? 0 : getMaxScrollTop();
            var s = edge;
            t = ( sign * Math.sqrt(2*a*(s-s0)+v0*v0)-v0)/a;
            v = v0 - a * t;
            console.log(t); 
            element.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier("+quadratic2cubicBezier(-v0/a,-v0/a+t)+") 0s";
            element.style.webkitTransform = "translate3d(0,"+s.toFixed(0)+"px,0)";
            waitTransition(element,"-webkit-transform",function(){
                v0 = v;
                s0 = s;
                a = 0.0045*(v0/Math.abs(v0));
                t = v0/a;
                s = s0 + t*v0/2;
                element.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier("+quadratic2cubicBezier(-t,0)+") 0s";
                element.style.webkitTransform = "translate3d(0,"+s.toFixed(0)+"px,0)";
                waitTransition(element,"-webkit-transform",function(){
                    element.style.webkitTransition = "-webkit-transform 0.4s ease-out 0s";
                    element.style.webkitTransform = "translate3d(0,"+edge+"px,0)";
                    waitTransition(element,"-webkit-transform",function(){
                        element.style.webkitTransition = "none";
                    });
                });

            });
        }
        else {
            element.style.webkitTransition = "-webkit-transform " + t.toFixed(0) + "ms cubic-bezier("+quadratic2cubicBezier(-t,0)+") 0s";
            element.style.webkitTransform = "translate3d(0,"+s.toFixed(0)+"px,0)";
        }
    });                                                                    

})

document.body.addEventListener("touchmove",function(e){
    e.preventDefault();
},false);

function waitTransition(element,propertyName,callback) {
    function eventHandler(e){
        if(e.srcElement!==element || e.propertyName!=propertyName) {
            return;
        }
        console.log("run");
        callback();
        element.removeEventListener("webkitTransitionEnd",eventHandler,false);
    }
    element.addEventListener("webkitTransitionEnd",eventHandler,false);
}
