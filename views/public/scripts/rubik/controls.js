/// <reference path="../libs/three-dev.js" />
/// <reference path="../_.js" />

var initControls = function (cubeMeshes, cam) {
    var objects = cubeMeshes;
    var camera = cam.camera;
    var projector = new THREE.Projector();

    // utils
    var sign = function(x) {
        return x>= 0?1:-1;
    };
    var sign0 = function (x) {
        if (x == 0) return 0;
        return x > 0 ? 1 : -1;
    };
    var abs = Math.abs;
    var round = function (x) { return Math.round(x / cube_outer_size); };
    var vectorToNormalizedDirectional = function (v) {
        var max = Math.max(abs(v.x), abs(v.y), abs(v.z));
        if(max> abs(v.x)) {
            if (max > abs(v.y))
                return new THREE.Vector3(0, 0, sign(v.z));
            return new THREE.Vector3(0, sign(v.y), 0);
        }
        return new THREE.Vector3(sign(v.x), 0, 0);
    };


    var findMouseEventIntersection = function (clientX, clientY) { 
        var vector = new THREE.Vector3((clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var direction = vector.subSelf(camera.position).normalize();

        var ray = new THREE.Ray(camera.position, direction);

        var intersects = ray.intersectObjects(objects);

        if (intersects.length > 0) {
            var intersect = intersects[0];
            console.log("intersection:", intersect, intersect.face.toString(), "facing direction:",
                    intersect.object.matrixRotationWorld.multiplyVector3(intersect.face.normal.clone()).toString()
                  );
            return {
                intersection: intersect,
                direction: direction
            };
        }

        return {
            direction: direction
        };
    };


    var isMouseDown = false;
    var mouseOnMeshInitPosition = null; // {mouse: {x,y}, worldVectorParallelToIntersectionFaceNormal, rayDirection, intersection}

    var onDocumentMouseDown = function (event) {
        isMouseDown = true;

        var clientX = event.clientX, clientY = event.clientY, target = event.target;
    
        var rayInfo = findMouseEventIntersection(clientX, clientY);

        if (!!rayInfo.intersection) {
            var intersect = rayInfo.intersection;
            var worldVectorParallelToIntersectionFaceNormal =
                intersect.object.matrixRotationWorld.multiplyVector3(intersect.face.normal.clone());
            mouseOnMeshInitPosition = {
                mouse: {
                    x: clientX,
                    y: clientY
                },
                worldVectorParallelToIntersectionFaceNormal: worldVectorParallelToIntersectionFaceNormal,
                rayDirection: rayInfo.direction,
                intersection: intersect
            };
        } else
            cam.ui.onMouseDown(clientX, clientY, target);
    };

    var onDocumentMouseUp = function (event) {
        var clientX = event.clientX, clientY = event.clientY;
        if (isMouseDown) {
            if (!!mouseOnMeshInitPosition) {
                var rayInfo = findMouseEventIntersection(clientX, clientY);

                var rayDirection = rayInfo.direction.clone();

                var rayDirectionsDelta = rayDirection.subSelf(mouseOnMeshInitPosition.rayDirection);
                var normalizedDirectional = vectorToNormalizedDirectional(rayDirectionsDelta);

                var dx = clientX - mouseOnMeshInitPosition.mouse.x;
                var dy = clientY - mouseOnMeshInitPosition.mouse.y;

                if (dx == 0 && dy == 0) return;

                var roundedWorldRotVetor = mouseOnMeshInitPosition.worldVectorParallelToIntersectionFaceNormal.homamRound();

                var rotationAxis = roundedWorldRotVetor.clone().crossSelf(normalizedDirectional);
                console.log(
                    "normalizedDirectional", normalizedDirectional.toString(),
                    "roundedWorldRotVetor", roundedWorldRotVetor.toString(),
                    "rotation axis:", rotationAxis.toString());

                if (rotationAxis.isZero()) return; // cannot rotate around 0 vector

                console.log(mouseOnMeshInitPosition.intersection.object.position.toString());
                var axis = _.find(['x', 'y', 'z'], function (a) { return rotationAxis[a] != 0; });
                var row = sign0(round(mouseOnMeshInitPosition.intersection.object.position[axis]));
                
                rot(axis, row, rotationAxis[axis]);
            }
        }
        isMouseDown = false;
        mouseOnMeshInitPosition = null;
        cam.ui.onMouseUp(clientX, clientY);
    };

    var onDocumentMouseMove = function (event) {
        var clientX = event.clientX, clientY = event.clientY;
        if (isMouseDown) {
            if (!!mouseOnMeshInitPosition) {
            }
        }

        cam.ui.onMouseMove(clientX, clientY);
    };


    document.body.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (e.touches.length == 1) {
            var touch = e.touches[0];
            onDocumentMouseDown(touch);
        }
    },false);

    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
        if (e.touches.length == 1) {
            var touch = e.touches[0];
            onDocumentMouseMove(touch);
        }
    },false);

    document.body.addEventListener('touchend', function (e) {
        e.preventDefault();
        if (e.touches.length == 0 && e.changedTouches.length == 1) {
            var touch = e.changedTouches[0];
            onDocumentMouseUp(touch);
        }
    },false);



    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

};