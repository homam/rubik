/// <reference path="../three-dev.js" />


var makeCamera = function (scene) {
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);

    var updatePosition = function (xyRotation, zPos) {
        camera.position.x = Math.sin(xyRotation) * 500;
        camera.position.y = Math.cos(xyRotation) * 500;
        camera.position.z = zPos;
    };

    camera.up = new THREE.Vector3(0, 0, 1);

    scene.add(camera);

    var sx = 16, sz = 300;
    var rotation = 16 / 20;
    updatePosition(rotation, sz);

    var down = false;
    var onDocumentMouseDown = function (clientX, clientY, target) {
        if (target == renderer.renderer.domElement) {
            down = true;
            sx = clientX;
            sz = clientY;
        }
    };
    var onDocumentMosueUp = function (){ down = false; };
    var onDocumentMouseMove = function (clientX, clientY) {
        if (down) {
            var dx = clientX - sx;
            var dy = clientY - sz;
            rotation += dx / 80;
            sx += dx;
            sz += dy;
            updatePosition(rotation, camera.position.z + dy*2);
        }
    }

    return {
        camera: camera,
        ui: {
            onMouseDown: onDocumentMouseDown,
            onMouseUp: onDocumentMosueUp,
            onMouseMove: onDocumentMouseMove
        }
    };
}

