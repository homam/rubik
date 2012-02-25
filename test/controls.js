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
    var abs =Math.abs;
    var worldAxesRotationInfo = [
    { name: 'x', vector: new THREE.Vector3(1, 0, 0), rotAround: { 'y': { axis: 'y', sign: 1 }, 'x': { axis: 'z', sign: 1 } } },
    { name: '-x', vector: new THREE.Vector3(-1, 0, 0), rotAround: { 'y': { axis: 'y', sign: -1 }, 'x': { axis: 'z', sign: 1 } } },
    { name: 'y', vector: new THREE.Vector3(0, 1, 0), rotAround: { 'y': { axis: 'x', sign: -1 }, 'x': { axis: 'z', sign: 1 } } },
    { name: '-y', vector: new THREE.Vector3(0, -1, 0), rotAround: { 'y': { axis: 'x', sign: 1 }, 'x': { axis: 'z', sign: 1 } } },
    { name: 'z', vector: new THREE.Vector3(0, 0, 1), rotAround: { 'y': { axis: 'x', sign: 1 }, 'x': { axis: 'y', sign: 1 } } },
    { name: '-z', vector: new THREE.Vector3(0, 0, -1), rotAround: { 'y': { axis: 'x', sign: 1 }, 'x': { axis: 'y', sign: -1 } } }
    ];

    var findMouseEventIntersection = function (event) {
        var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        projector.unprojectVector(vector, camera);

        var direction = vector.subSelf(camera.position).normalize();
        console.log("direction:", direction.toString());

        var ray = new THREE.Ray(camera.position, direction);

        var intersects = ray.intersectObjects(objects);

        if (intersects.length > 0) {
            var intersect = intersects[0];
            console.log("intersection:", intersect, intersect.face.toString(), "facing direction:",
                    intersect.object.matrixRotationWorld.multiplyVector3(intersect.face.normal.clone()).toString()
                  );
            return intersect;
        }

        return null;
    };


    var isMouseDown = false;
    var mouseOnMeshInitPosition = null; // {mouse: {x,y}, worldVector}
    var onDocumentMouseDown = function (event) {
        isMouseDown = true;
        // event.preventDefault();

        var intersect = findMouseEventIntersection(event);

        if (!!intersect) {
            var worldVectorParallelToIntersectionFaceNormal =
                intersect.object.matrixRotationWorld.multiplyVector3(intersect.face.normal.clone());
            mouseOnMeshInitPosition = {
                mouse: {
                    x: event.clientX,
                    y: event.clientY
                },
                worldVecotr: worldVectorParallelToIntersectionFaceNormal
            };
            return;
            var round = function (x) { return Math.round(x / 100); };

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
                var intersect = findMouseEventIntersection(event);

                var dx = event.clientX - mouseOnMeshInitPosition.mouse.x;
                var dy = event.clientY - mouseOnMeshInitPosition.mouse.y;

                if (dx == 0 && dy == 0) return;

                var roundedWorldRotVetor = mouseOnMeshInitPosition.worldVecotr.homamRound();
                console.log(dx, dy, roundedWorldRotVetor.toString());

                var screenAxis =  abs(dy) > abs(dx) ? 'y' : 'x';
                var d = abs(dy) > abs(dx) ? dy: dx;
                var axis = _.find(worldAxesRotationInfo, function (a) {
                    return a.vector.equals(roundedWorldRotVetor);
                });
                var rotAround = axis.rotAround[screenAxis];
                console.log(rotAround.axis, 1, rotAround.sign * sign(d));
                rot(rotAround.axis,1,rotAround.sign*sign(d));

                /*
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (axesVectors.x.equals(roundedWorldRotVetor))
                        rot('z', 1, sign(dx));
                }*/
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