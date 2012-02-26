/// <reference path="../three-dev.js" />
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
    var round = function (x) { return Math.round(x / 100); };
    var vectorToNormalizedDirectional = function (v) {
        var max = Math.max(abs(v.x), abs(v.y), abs(v.z));
        if(max> abs(v.x)) {
            if (max > abs(v.y))
                return new THREE.Vector3(0, 0, sign(v.z));
            return new THREE.Vector3(0, sign(v.y), 0);
        }
        return new THREE.Vector3(sign(v.x), 0, 0);
    };


    var findMouseEventIntersection = function (event) {
        var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
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
        // event.preventDefault();

        var rayInfo = findMouseEventIntersection(event);

        if (!!rayInfo.intersection) {
            var intersect = rayInfo.intersection;
            var worldVectorParallelToIntersectionFaceNormal =
                intersect.object.matrixRotationWorld.multiplyVector3(intersect.face.normal.clone());
            mouseOnMeshInitPosition = {
                mouse: {
                    x: event.clientX,
                    y: event.clientY
                },
                worldVectorParallelToIntersectionFaceNormal: worldVectorParallelToIntersectionFaceNormal,
                rayDirection: rayInfo.direction,
                intersection: intersect
            };
            return;

            var o = intersects[0].object;
            var isAxis = function (axisName) { return round(o.position[axisName]) != 0 };
            var axis = _.find(['x', 'y', 'z'], function (axisName) {
                if (isAxis(axisName) != 0) return axisName;
            });

            console.log(axis, round(o.position[axis]));
        } else
            cam.ui.onMouseDown(event);
    };

    var onDocumentMouseUp = function (event) {
        if (isMouseDown) {
            if (!!mouseOnMeshInitPosition) {
                var rayInfo = findMouseEventIntersection(event);

                var rayDirection = rayInfo.direction.clone();

                var rayDirectionsDelta = rayDirection.subSelf(mouseOnMeshInitPosition.rayDirection);
                var normalizedDirectional = vectorToNormalizedDirectional(rayDirectionsDelta);

                var dx = event.clientX - mouseOnMeshInitPosition.mouse.x;
                var dy = event.clientY - mouseOnMeshInitPosition.mouse.y;

                if (dx == 0 && dy == 0) return;

                var roundedWorldRotVetor = mouseOnMeshInitPosition.worldVectorParallelToIntersectionFaceNormal.homamRound();

                var rotationAxis = roundedWorldRotVetor.clone().crossSelf(normalizedDirectional);
                console.log(
                    "normalizedDirectional", normalizedDirectional.toString(),
                    "roundedWorldRotVetor", roundedWorldRotVetor.toString(),
                    "rotation axis:", rotationAxis.toString());

                console.log(mouseOnMeshInitPosition.intersection.object.position.toString());
                var axis = _.find(['x', 'y', 'z'], function (a) { return rotationAxis[a] != 0; });
                var row = sign0(round(mouseOnMeshInitPosition.intersection.object.position[axis]));
                
                rot(axis, row, rotationAxis[axis]);
            }
        }
        isMouseDown = false;
        mouseOnMeshInitPosition = null;
        cam.ui.onMouseUp(event);
    };

    var onDocumentMouseMove = function (event) {
        if (isMouseDown) {
            if (!!mouseOnMeshInitPosition) {
            }
        }

        cam.ui.onMouseMove(event);
    };



    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

};