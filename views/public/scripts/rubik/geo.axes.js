/// <reference path="../three.js" />

var makeAxes = function (scene, draw) {
    function v(x, y, z) {
        return new THREE.Vertex(new THREE.Vector3(x, y, z));
    }

    axesColors = {
        'x': { color: 0xaf0000, v: v(1, 0, 0), index: 0 }, '-x': { color: 0xffc5c5, v: v(-1, 0, 0), index: 1 },
        'y': { color: 0x081e77, v: v(0, 1, 0), index: 2 }, '-y': { color: 0xc2ccf3, v: v(0, -1, 0), index: 3 },
        'z': { color: 0x008c00, v: v(0, 0, 1), index: 4 }, '-z': { color: 0xbff8bf, v: v(0, 0, -1), index: 5 }
    };

    if (draw) {
        var length = 5000;
        var arrowPos = 350;
        var arrowLength = 50;
        var axesGeos = [
            { name: 'x', lines: [v(0, 0, 0), v(length, 0, 0), v(arrowPos, 0, 0), v(arrowPos - arrowLength, arrowLength, 0), v(arrowPos, 0, 0), v(arrowPos - arrowLength, -arrowLength, 0)] },
            { name: '-x', lines: [v(0, 0, 0), v(-length, 0, 0)] },
            { name: 'y', lines: [v(0, 0, 0), v(0, length, 0), v(0, arrowPos, 0), v(arrowLength, arrowPos - arrowLength, 0), v(0, arrowPos, 0), v(-arrowLength, arrowPos - arrowLength, 0)] },
            { name: '-y', lines: [v(0, 0, 0), v(0, -length, 0)] },
            { name: 'z', lines: [v(0, 0, 0), v(0, 0, length), v(0, 0, arrowPos), v(0, arrowLength, arrowPos - arrowLength), v(0, 0, arrowPos), v(0, -arrowLength, arrowPos - arrowLength)] },
            { name: '-z', lines: [v(0, 0, 0), v(0, 0, -length)] }];

        axesGeos.forEach(function (axe, index) {
            var lineGeo = new THREE.Geometry();
            lineGeo.vertices = axe.lines;
            var lineMat = new THREE.LineBasicMaterial({
                color: axesColors[axe.name].color,
                lineWidth: 1
            });
            var line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
        });
    }

    return {
        colors: axesColors
    };
};