import * as BABYLON from "@babylonjs/core";


export function addCampfireParticles(scene, campfire) {
    var glowLayer = new BABYLON.GlowLayer("campfire-glow", scene);
    glowLayer.intensity = 1.0;

    var spread = 0.5;
    var fireParticles = 200;
    var fireBaseParticles = 50;
    var smokeParticles = 100;
    var smokeOpacity = 0.4;
    var emberParticles = 50;
    var emberSize = 0.2;
    var size = 0.5;
    var speed = 3;

    function createFire(scene, initialHeight) {
        var sps = new BABYLON.SolidParticleSystem("fireSPS", scene);
        var cube = BABYLON.MeshBuilder.CreateBox('cube', { size: size }, scene);
        sps.addShape(cube, fireParticles);

        var mesh = sps.buildMesh();
        mesh.alwaysSelectAsActiveMesh = true; // Disable frustum culling
        var fireMaterial = new BABYLON.StandardMaterial("fireMat", scene);
        fireMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        fireMaterial.roughness = 0.2;
        mesh.material = fireMaterial;

        glowLayer.addIncludedOnlyMesh(mesh);
        cube.dispose();

        mesh.receiveShadows = false; // Ensure the SPS mesh does not cast shadows

        sps.initParticles = function () {
            for (var p = 0; p < sps.nbParticles; p++) {
                sps.recycleParticle(sps.particles[p]);
                sps.particles[p].age = Math.random() * sps.particles[p].life;
            }
        };

        sps.recycleParticle = function (particle) {
            particle.position.x = (Math.random() - 0.5) * spread;
            particle.position.y = initialHeight;
            particle.position.z = (Math.random() - 0.5) * spread;
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
            var maxScale = Math.random() * 0.2 + 0.1;
            particle.scale.x = maxScale;
            particle.scale.y = maxScale;
            particle.scale.z = maxScale;
            particle.life = (Math.random() * 50 + 50) / speed;
            particle.age = 0;
            particle.upwardSpeed = (Math.random() * 0.02 + 0.01) * speed;
            particle.horizontalSpeedX = (Math.random() - 0.5) * 0.02;
            particle.horizontalSpeedZ = (Math.random() - 0.5) * 0.02;
        };

        sps.updateParticle = function (particle) {
            particle.position.y += particle.upwardSpeed;
            particle.position.x += particle.horizontalSpeedX;
            particle.position.z += particle.horizontalSpeedZ;
            var scaleDecrement = 0.002;
            particle.scale.x -= scaleDecrement;
            particle.scale.y -= scaleDecrement;
            particle.scale.z -= scaleDecrement;
            particle.age++;
            if (particle.age >= particle.life || particle.scale.x <= 0) {
                sps.recycleParticle(particle);
            }
        };

        sps.initParticles();
        sps.setParticles();

        scene.registerBeforeRender(function () {
            sps.setParticles();
        });

        return sps;
    }

    function createFireBase(scene, initialHeight, horizontalSpread) {
        var sps = new BABYLON.SolidParticleSystem("fireBaseSPS", scene);
        var cube = BABYLON.MeshBuilder.CreateBox('cube', { size: size }, scene);
        sps.addShape(cube, fireBaseParticles);

        var mesh = sps.buildMesh();
        mesh.alwaysSelectAsActiveMesh = true; // Disable frustum culling
        var fireBaseMaterial = new BABYLON.StandardMaterial("fireBaseMat", scene);
        fireBaseMaterial.emissiveColor = new BABYLON.Color3(0.22, 0.12, 0.02);
        fireBaseMaterial.roughness = 0;
        mesh.material = fireBaseMaterial;

        glowLayer.addIncludedOnlyMesh(mesh);
        cube.dispose();

        mesh.receiveShadows = false; // Ensure the SPS mesh does not cast shadows

        sps.initParticles = function () {
            for (var p = 0; p < sps.nbParticles; p++) {
                sps.recycleParticle(sps.particles[p]);
                sps.particles[p].age = Math.random() * sps.particles[p].life;
            }
        };

        sps.recycleParticle = function (particle) {
            particle.position.x = (Math.random() - 0.5) * spread;
            particle.position.y = initialHeight;
            particle.position.z = (Math.random() - 0.5) * spread;
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
            var maxScale = Math.random() * 0.3 + 0.2;
            particle.scale.x = maxScale;
            particle.scale.y = maxScale;
            particle.scale.z = maxScale;
            particle.life = (Math.random() * 50 + 50) / speed;
            particle.age = 0;
            particle.upwardSpeed = (Math.random() * 0.01 + 0.005) * speed;
            particle.horizontalSpeedX = (Math.random() - 0.5) * horizontalSpread;
            particle.horizontalSpeedZ = (Math.random() - 0.5) * horizontalSpread;
        };

        sps.updateParticle = function (particle) {
            particle.position.y += particle.upwardSpeed;
            particle.position.x += particle.horizontalSpeedX;
            particle.position.z += particle.horizontalSpeedZ;
            var scaleDecrement = 0.002;
            particle.scale.x -= scaleDecrement;
            particle.scale.y -= scaleDecrement;
            particle.scale.z -= scaleDecrement;
            particle.age++;
            if (particle.age >= particle.life || particle.scale.x <= 0 || particle.position.y >= initialHeight + 2) {
                sps.recycleParticle(particle);
            }
        };

        sps.initParticles();
        sps.setParticles();

        scene.registerBeforeRender(function () {
            sps.setParticles();
        });

        return sps;
    }

    function createSmoke(scene, initialHeight) {
        var sps = new BABYLON.SolidParticleSystem("smokeSPS", scene);
        var cube = BABYLON.MeshBuilder.CreateBox('cube', { size: size * 0.5 }, scene);
        sps.addShape(cube, smokeParticles);

        var mesh = sps.buildMesh();
        mesh.alwaysSelectAsActiveMesh = true; // Disable frustum culling
        var smokeMaterial = new BABYLON.StandardMaterial("smokeMat", scene);
        smokeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        smokeMaterial.alpha = smokeOpacity;
        smokeMaterial.roughness = 1.0;
        mesh.material = smokeMaterial;

        cube.dispose();

        mesh.receiveShadows = false; // Ensure the SPS mesh does not cast shadows

        sps.initParticles = function () {
            for (var p = 0; p < sps.nbParticles; p++) {
                sps.recycleParticle(sps.particles[p]);
                sps.particles[p].age = Math.random() * sps.particles[p].life;
            }
        };

        sps.recycleParticle = function (particle) {
            particle.position.x = (Math.random() - 0.5) * spread;
            particle.position.y = initialHeight;
            particle.position.z = (Math.random() - 0.5) * spread;
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
            particle.scale.x = 0;
            particle.scale.y = 0;
            particle.scale.z = 0;
            particle.life = (Math.random() * 200 + 200) / speed;
            particle.age = 0;
            particle.upwardSpeed = (Math.random() * 0.03 + 0.02) * speed;
            particle.horizontalSpeedX = (Math.random() - 0.5) * 0.01;
            particle.horizontalSpeedZ = (Math.random() - 0.5) * 0.01;
        };

        sps.updateParticle = function (particle) {
            particle.position.y += particle.upwardSpeed;
            particle.position.x += particle.horizontalSpeedX;
            particle.position.z += particle.horizontalSpeedZ;
            if (particle.age < particle.life / 2) {
                var scaleIncrement = 0.01;
                particle.scale.x += scaleIncrement;
                particle.scale.y += scaleIncrement;
                particle.scale.z += scaleIncrement;
            } else {
                var scaleDecrement = 0.01;
                particle.scale.x -= scaleDecrement;
                particle.scale.y -= scaleDecrement;
                particle.scale.z -= scaleDecrement;
            }
            particle.age++;
            if (particle.age >= particle.life || particle.scale.x <= 0) {
                sps.recycleParticle(particle);
            }
        };

        sps.initParticles();
        sps.setParticles();

        scene.registerBeforeRender(function () {
            sps.setParticles();
        });

        return sps;
    }

    function createEmbers(scene, initialHeight) {
        var sps = new BABYLON.SolidParticleSystem("embersSPS", scene);
        var cube = BABYLON.MeshBuilder.CreateBox('cube', { size: emberSize }, scene);
        sps.addShape(cube, emberParticles);

        var mesh = sps.buildMesh();
        mesh.alwaysSelectAsActiveMesh = true; // Disable frustum culling
        var emberMaterial = new BABYLON.StandardMaterial("embersMat", scene);
        emberMaterial.emissiveColor = new BABYLON.Color3(169 / 255, 36 / 255, 20 / 255);
        emberMaterial.roughness = 0.3;
        mesh.material = emberMaterial;

        glowLayer.addIncludedOnlyMesh(mesh);
        cube.dispose();

        mesh.receiveShadows = false; // Ensure the SPS mesh does not cast shadows

        sps.initParticles = function () {
            for (var p = 0; p < sps.nbParticles; p++) {
                sps.recycleParticle(sps.particles[p]);
                sps.particles[p].age = Math.random() * sps.particles[p].life;
            }
        };

        sps.recycleParticle = function (particle) {
            particle.position.x = (Math.random() - 0.5) * spread;
            particle.position.y = initialHeight;
            particle.position.z = (Math.random() - 0.5) * spread;
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
            particle.scale.x = emberSize;
            particle.scale.y = emberSize;
            particle.scale.z = emberSize;
            particle.life = (Math.random() * 200 + 200) / speed;
            particle.age = 0;
            particle.upwardSpeed = (Math.random() * 0.03 + 0.02) * speed;
            particle.horizontalSpeedX = (Math.random() - 0.5) * 0.01;
            particle.horizontalSpeedZ = (Math.random() - 0.5) * 0.01;
        };

        sps.updateParticle = function (particle) {
            particle.position.y += particle.upwardSpeed;
            particle.position.x += particle.horizontalSpeedX;
            particle.position.z += particle.horizontalSpeedZ;
            if (particle.age >= particle.life * 0.75) {
                var scaleDecrement = 0.004;
                particle.scale.x -= scaleDecrement;
                particle.scale.y -= scaleDecrement;
                particle.scale.z -= scaleDecrement;
            }
            particle.age++;
            if (particle.age >= particle.life || particle.scale.x <= 0) {
                sps.recycleParticle(particle);
            }
        };

        sps.initParticles();
        sps.setParticles();

        scene.registerBeforeRender(function () {
            sps.setParticles();
        });

        return sps;
    }

    var fireBaseSPS = createFireBase(scene, 0, 0.005);
    var fireSPS = createFire(scene, 0);
    var smokeSPS = createSmoke(scene, 1.8);
    var embersSPS = createEmbers(scene, 1.8);

    fireBaseSPS.mesh.parent = campfire;
    fireSPS.mesh.parent = campfire;
    smokeSPS.mesh.parent = campfire;
    embersSPS.mesh.parent = campfire;

    fireBaseSPS.mesh.position.y += campfire.position.y;
    fireSPS.mesh.position.y += campfire.position.y;
    smokeSPS.mesh.position.y += campfire.position.y;
    embersSPS.mesh.position.y += campfire.position.y;

    return { fireSPS, fireBaseSPS, smokeSPS, embersSPS };

}