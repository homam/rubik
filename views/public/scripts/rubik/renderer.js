/// <reference path="../eventtarget.js" />

var makeRenderer = function (scene, camera) {

    // renderer
    var renderer = (function () {
        var renderer = new THREE.CanvasRenderer();//CanvasRenderer(); //WebGLRenderer //SVGRenderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        // renderer.setClearColorHex(0xEEEEEE, 1.0);
        renderer.clear();
        renderer.shadowCameraFov = 50;
        renderer.shadowMapWidth = 1024;;
        renderer.shadowMapHeight = 1024;
        renderer.shadowMapEnabled = false;

        return renderer;
    })();

    var tickerEvent = new EventTarget();
    
    var render = function (t) {
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
        tickerEvent.fire({ type: "tick", t: t });
    }

    var animate = function (t) {
        requestAnimationFrame(animate);
        render(t);
    }

    return {
        tickerEvent: tickerEvent,
        renderer: renderer,
        start: function () {
            animate(new Date().getTime());
        }
    };
};