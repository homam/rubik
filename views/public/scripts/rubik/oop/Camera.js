/// <reference path="../libs/three-dev.js" />


var makeCamera = function (scene) {

    /* util functions */
    var sign = function (x) {
        return x > 0 ? 1 : -1;
    };
    var sign0 = function (x) {
        if (x === 0) return 0;
        return x > 0 ? 1 : -1;
    };
    var cosd = function (d) { return Math.cos(d * Math.PI / 180); }
    /* end util functions */

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.up = new THREE.Vector3(0, 0, 1);
    scene.add(camera);

    var radious = cube_outer_size * 8,
        theta = 45,
        onMouseDownTheta = 45,
        phi = 45,
        onMouseDownPhi = 45;

    var onMouseDownPosition = new THREE.Vector2();

    var updatePosition = function () {
        camera.position.x = radious * Math.sin(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        camera.position.z = radious * Math.sin(phi * Math.PI / 180);
        camera.position.y = radious * Math.cos(theta * Math.PI / 180) * Math.cos(phi * Math.PI / 180);
        camera.updateMatrix();
    };

    var zoom = function (newRadious) {
        if ((newRadious > cube_outer_size * 20) || (newRadious < cube_outer_size*5)) return;
        radious = newRadious;
        updatePosition();
    };

    

    updatePosition();

    var isMouseDown = false;
    var isShiftKeyDown = false;

    var onDocumentMouseDown = function (clientX, clientY, target) {
        if (target == renderer.renderer.domElement) {
            isMouseDown = true;
            onMouseDownTheta = theta;
            onMouseDownPhi = phi;
            onMouseDownPosition.x = clientX;
            onMouseDownPosition.y = clientY;
        }
    };

    var onDocumentMosueUp = function (clientX, clientY) {
        isMouseDown = false;
        onMouseDownPosition.x = clientX - onMouseDownPosition.x;
        onMouseDownPosition.y = clientY - onMouseDownPosition.y;
    };

    var onDocumentMouseMove = function (clientX, clientY) {
        if (isMouseDown) {

            if (isShiftKeyDown) {
                zoom(radious+sign0(clientY - onMouseDownPosition.y)*50);

            } else {

                var lastPhi = phi;

                phi = ((clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;
                theta = (sign(cosd(phi)) * (clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta; // multiplying by sign(cosd(phi) to fix inverse rotation direction issue


                if (sign0(cosd(lastPhi)) != sign0(cosd(phi))) {
                    camera.up = camera.up.multiplyScalar(-1); // gimbal lock
                }

                onMouseDownTheta = theta;
                onMouseDownPhi = phi;
                onMouseDownPosition.x = clientX;
                onMouseDownPosition.y = clientY;

                updatePosition();
            }
        }
    }

    var onDocumentGesureEnd = function (scale) {
        var newRadious = radious - (scale - 1) * 10;
        zoom(newRadious);
    };


    window.addEventListener('keydown', function (event) {
        var code = event.keyCode;
        isShiftKeyDown = (16 == code);
    }, false);

    window.addEventListener('keyup', function (event) {
        var code = event.keyCode;
        isShiftKeyDown = !(16 == code);
    }, false);


    window.addEventListener('gesturechange', function (event) {
        onDocumentGesureEnd(event.scale);
    }, false);

    /*
    c = new THREE.TrackballControls(camera);
    onDocumentMosueUp = function () { c.update(); };
    onDocumentMouseDown = function () { c.update(); };
    onDocumentMouseMove = function () { c.update(); };
    //*/

    return {
        camera: camera,
        ui: {
            onMouseDown: onDocumentMouseDown,
            onMouseUp: onDocumentMosueUp,
            onMouseMove: onDocumentMouseMove
        }
    };



    /*


    function onDocumentMouseWheel(event) {

        radious -= event.wheelDeltaY;

        camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        camera.position.y = radious * Math.sin(phi * Math.PI / 360);
        camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        camera.updateMatrix();
    }

    */
}

