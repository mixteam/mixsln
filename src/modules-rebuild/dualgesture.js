//@require gesture

(function(win, app, undef) {

var doc = win.document,
    docEl = doc.documentElement
    ;

var dualGesture =  {
    panning : false,
    rotating : false,
    pinching : false,
    streching : false,
    zooming : false
}

function dualtouchstartHandler(event) {
    dualGesture.panning = false;
    dualGesture.rotating = false;
    dualGesture.pinching = false;
    dualGesture.streching = false;
    dualGesture.zooming = false;

    docEl.addEventListener('dualtouch', dualtouchHandler, false);
    docEl.addEventListener('dualtouchend', dualtouchendHandler, false);
}

function dualtouchHandler(event) {
    var transform = event.transform;

    if(!dualGesture.zooming) {
        fireEvent(event.srcElement, 'zoomstart', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(!dualGesture.rotating && transform.rotate > 0.1) {
        dualGesture.rotating = true;
        fireEvent(event.srcElement, 'rotatestart', {
            rotate : transform.rotate,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(!dualGesture.panning && Math.sqrt(Math.pow(transform.translate[0], 2) + Math.pow(transform.translate[1], 2)) >10 ) {
        dualGesture.panning = true;
        fireEvent(event.srcElement, 'dualpanstart', {
            translate : transform.translate,
            displacementX : transform.translate[0],
            displacementY : transform.translate[1],
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(!dualGesture.streching && transform.scale > 1.1) {
        dualGesture.streching = true;
        dualGesture.pinching = false;
        fireEvent(event.srcElement, 'strechstart', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(!dualGesture.pinching && transform.scale < 0.9) {
        dualGesture.streching = false;
        dualGesture.pinching = true;
        fireEvent(event.srcElement, 'pinchstart', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(dualGesture.zooming) {
        fireEvent(event.srcElement, 'zoom', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(dualGesture.pinching) {
        fireEvent(event.srcElement, 'pinch', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(dualGesture.streching) {
        fireEvent(event.srcElement, 'strech', {
            scale : transform.scale,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(dualGesture.rotating) {
        fireEvent(event.srcElement, 'rotate', {
            rotate : transform.rotate,
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }

    if(dualGesture.panning) {
        fireEvent(event.srcElement, 'dualpan', {
            translate : transform.translate,
            displacementX : transform.translate[0],
            displacementY : transform.translate[1],
            touches : event.touches,
            touchEvent: event.touchEvent
        });
    }
}

function dualtouchendHandler(event) {
    docEl.removeEventListener('dualtouch', dualtouchHandler, false);
    docEl.removeEventListener('dualtouchend', dualtouchendHandler, false);
}

docEl.addEventListener('dualtouchstart', dualtouchstartHandler, false);

})(window, window['app']||(window['app']={module:{},plugin:{}}));