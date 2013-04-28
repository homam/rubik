/// <reference path="../../libs/_.js" />
/// <reference path="../../libs/Three-dev.js" />

Cube = function (scene, renderer, outersize, pos) {

    var materials = (function () {

        // x = 0, -x = 1, y = 2, -y = 3, z = 4, -z = 5
        var faceColors = [0xFFD339, 0xB23400, 0xF64BFF, 0x00C3CC, 0x36B24E, 0x6755FF];

        var materials = [];
        for (var i = 0; i < 6; i++) {
            if ((pos.x > -1 && i == 1) || (pos.y > -1 && i == 3) || (pos.z > -1 && i == 5) || (pos.x < 1 && i == 0) || (pos.y < 1 && i == 2) || (pos.z < 1 && i == 4))
                materials.push({ index: i, active: false, material: new THREE.MeshBasicMaterial({ color: 0 }) });
            else
                materials.push({ index: i, active: true, material: new THREE.MeshBasicMaterial({ color: faceColors[i] }) });
        }
        return materials;

    })();

    var meshFaceMaterial = new THREE.MeshFaceMaterial();

    var size = outersize * .9;

    var cube = new THREE.Mesh(
       new THREE.CubeGeometry(size, size, size, 1, 1, 1,
            _.map(materials, function (f) { return f.material; })), meshFaceMaterial);

    // active (colored) faces, used in click intersection detection
    cube.rubikActiveFaces = _.map(_.filter(materials, function (f) { return f.active; }), function (f) { return f.index; });
    scene.add(cube);
    cube.dynamic = false;
    cube.matrixAutoUpdate = true;
    cube.rotation.set(0, 0, 0);
    //cube.matrix.setRotationFromEuler(cube.rotation);
    cube.position.set(pos.x * outersize, pos.y * outersize, pos.z * outersize);


    this.mesh = cube;
    this.tickerEvent = renderer.tickerEvent;

};

Cube.prototype.rotate = function (axis, dir, callback) {

    var rotationPerTick = (Math.PI / 2) / config.anim.rotationSpeed; // const
    var rotationAxis = axis;
    var rotationProgress = 0;

    var tickerEvent = this.tickerEvent;
    var cube = this.mesh;

    var animate = function (ev) {

        rotationProgress += rotationPerTick;

        var end = (rotationProgress >= Math.PI / 2);

        //https://github.com/mrdoob/three.js/issues/1219#issuecomment-3750958
        var rotation_matrix = new THREE.Matrix4()['setRotation' + axis.toUpperCase()](rotationPerTick * dir); 
        rotation_matrix.multiplySelf(cube.matrix);
        cube.rotation.getRotationFromMatrix(rotation_matrix);
        cube.position.getPositionFromMatrix(rotation_matrix);

        if (end) {
            tickerEvent.removeListener("tick", animate);
            if (!!callback)
                callback(cube);
        }
    };



    tickerEvent.addListener("tick", animate);
};