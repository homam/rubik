// lights
var makeLights = function (scene) {
    [
				new THREE.Vector3(3000, 3000, 3000),
 				new THREE.Vector3(-3000, -3000, -3000),
				new THREE.Vector3(-3000, 3000, -3000),
				new THREE.Vector3(3000, -3000, 3000),
				new THREE.Vector3(3000, -3000, -3000)].forEach(function (pos) {

        // light
        var light = (function () {
            var light = new THREE.SpotLight(0xFFFFFF);
            light.castShadow = true;
            light.position = pos;
            light.dynamic = true;
            scene.add(light);

            var lightObj = new THREE.Mesh(new THREE.SphereGeometry(20, 20, 20),
						new THREE.MeshBasicMaterial({ color: 0xFCFC00 }));
            lightObj.position = light.position;
            lightObj.castShadow = false;
            lightObj.receiveShadow = false;
           scene.add(lightObj);

            return light;
        })();
    });
};
