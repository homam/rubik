/// <reference path="../three-dev.js" />

(function () {
    var round = function (x) { return Math.round(x * 100) / 100 };

    THREE.Vector3.prototype.toString = function () { return "(" + round(this.x) + "," + round(this.y) + "," + round(this.z) + ")"; }
    THREE.Vector3.prototype.equals = function (v) { return this.x === v.x && this.y === v.y && this.z === v.z; };
    THREE.Color.prototype.toString = function () { return "Color(" + this.r + ", " + this.g + ", " + this.b + ")" };
    THREE.Matrix4.prototype.toString = function () {

        var str = "";
        for (var i = 1; i < 5; i++) {
            for (var j = 1; j < 5; j++) {
                str += round(this['n' + i.toString() + j.toString()]) + "\t";
            }
            str += "\n";
        }

        return str;
    };

    THREE.Face4.prototype.toString = function () {
        return "Face Normal" + this.normal.toString() + "";
    };

    THREE.Vector3.prototype.homamRound = function () {
        this.x = round(this.x);
        this.y = round(this.y);
        this.z = round(this.z);
        return this;
    };
})();