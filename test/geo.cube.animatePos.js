            var animatePos = function (t, end) {
                // rubik pos:
                //var original = cube.rubik.current;
                //var matrix = cube.rubik._matrices[rotationAxis](t);
            //var pos = matrix.multiplyVector3(new THREE.Vector3(original.x, original.y, original.z));
                if (end) {
                    cube.rubik.current = { x: round(pos.x), y: round(pos.y), z: round(pos.z) };

                }

                // cube.position = pos.multiplyScalar(cubeSize); // rubik pos

            };	