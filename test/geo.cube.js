/// <reference path="../three.js" />
/// <reference path="../_.js" />


var makeCube = function (scene, axes, renderer, size) {
                                //  0     1    2     3    4     5
    var currentFaceIndexAxesMap = ['x', '-x', 'y', '-y', 'z', '-z'];

    var getFaceColorByIndex = function (faceIndex) {
        var axisName = currentFaceIndexAxesMap[faceIndex];
        return axes.colors[axisName].color;
    };

    var materials = [];
    for (var i = 0; i < 6; i++)
        materials.push(new THREE.MeshBasicMaterial({ color: getFaceColorByIndex(i) }));


    size = !!size ? size : 60;
    var cube = new THREE.Mesh(
        new THREE.CubeGeometry(size,size, size, 1, 1, 1, materials),
        new THREE.MeshFaceMaterial()
    );
    scene.add(cube);
    cube.dynamic = true;
    cube.matrixAutoUpdate = true;
    cube.rotation.set(0, 0, 0);
    cube.matrix.setRotationFromEuler(cube.rotation);


    var tickerEvent = renderer.tickerEvent;

    return {
        mesh: cube,
        rotate: function (axis, dir, callback) {
            var rotationPerTick = (Math.PI / 2) / 20; // const
            var rotationAxis = axis;
            var originalTime = null;    
            var rotationProgress = 0;

            var animate = function (ev) {
                var time = ev.t;
                if (!originalTime)
                    originalTime = time;

                rotationProgress += rotationPerTick;
               
                var end = false;
                if (rotationProgress >= Math.PI / 2) {
                    end = true;
                }

                var rotation_matrix = new THREE.Matrix4()['setRotation' + axis.toUpperCase()](rotationPerTick * dir); //https://github.com/mrdoob/three.js/issues/1219#issuecomment-3750958
                rotation_matrix.multiplySelf(cube.matrix);
                cube.rotation.setRotationFromMatrix(rotation_matrix);
                cube.position.setPositionFromMatrix(rotation_matrix);

                if (end) {
                    tickerEvent.removeListener("tick", animate);
                    if (!!callback)
                        callback(cube);
                }
            };


            
            tickerEvent.addListener("tick", animate);
        }
    };
};