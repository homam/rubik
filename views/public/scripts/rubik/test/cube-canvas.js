/// <reference path="../libs/three.js" />
/// <reference path="../../libs/_.js" />

var getCubeTexture = (function () {

    var textures = {};

    var makeTexture = function (color, size) {

        var width = size;
        var coloredWidth = size * .8;

        var el = document.createElement("canvas");
        el.width = width;
        el.height = width;

        var ctx = el.getContext('2d');


        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, width);

        ctx.fillStyle = new THREE.Color(color).getContextStyle()
        ctx.fillRect(width / 2 - coloredWidth / 2, width / 2 - coloredWidth / 2, coloredWidth, coloredWidth);

        var url = el.toDataURL();
        var img = new Image();
        img.src = url;

        var texture = new THREE.Texture(el);
        texture.needsUpdate = false;
        
        return texture;

    }

    return function (color, size) {
        if (!textures[color]) {
            textures[color] = makeTexture(color, size);
        }
        return textures[color];
    };
})();



var makeCube = function (scene, axes, renderer, size) {
    
    // cache utils
    makeCube.cache = !!makeCube.cache ? makeCube.cache : {
        get: function (key, maker) {
            if (typeof this[key] === "undefined") {
                this[key] = maker();
            }
            return this[key];
        }
    };

    //  0     1    2     3    4     5
    var currentFaceIndexAxesMap = ['x', '-x', 'y', '-y', 'z', '-z'];

    var getFaceColorByIndex = function (faceIndex) {
        var axisName = currentFaceIndexAxesMap[faceIndex];
        return axes.colors[axisName].color;
    };



    var materials = makeCube.cache.get("CubeMaterials", function () {
        var materials = [];
        for (var i = 0; i < 6; i++)
            materials.push(new THREE.MeshLambertMaterial({ map: getCubeTexture(getFaceColorByIndex(i), size), overdraw: true }));
        return materials;
    });


    size = !!size ? size : 60;
    var cube = new THREE.Mesh(
        makeCube.cache.get("CubeGeometry", function () { return new THREE.CubeGeometry(size, size, size, 1, 1, 1, materials); }),
        makeCube.cache.get("MeshFaceMaterial", function () { return new THREE.MeshFaceMaterial(); })
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

            var rotationPerTick = (Math.PI / 2) / config.anim.rotationSpeed; // const
            var rotationAxis = axis;
            var rotationProgress = 0;

            console.log("r");

            var animate = function (ev) {

                rotationProgress += rotationPerTick;

                var end = false;
                if (rotationProgress >= Math.PI / 2) {
                    end = true;
                }

                var rotation_matrix = new THREE.Matrix4()['setRotation' + axis.toUpperCase()](rotationPerTick * dir); //https://github.com/mrdoob/three.js/issues/1219#issuecomment-3750958
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
        }
    };
};