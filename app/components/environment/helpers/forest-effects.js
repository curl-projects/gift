import * as BABYLON from "@babylonjs/core";
import { RenderingGroups } from "./constants";

export function addFog(scene, fogColor) {
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 250.0;  // Start distance of the fog (increased for less intensity)
    scene.fogEnd = 900.0;   // End distance of the fog (increased for less intensity)
    scene.fogColor = fogColor;

    // Update fog distances based on camera position
    scene.registerBeforeRender(function () {
        const camera = scene.activeCamera;
        if (camera) {
            scene.fogStart = camera.position.z - 50.0;
            scene.fogEnd = camera.position.z + 100.0;
        }
    });
}

export function addExponentialFog(scene, fogColor) {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.0005;  // Density of the fog (adjust for desired intensity)
    scene.fogColor = fogColor;
}


export function addFireflyParticles(scene, maxVelocity, boxCenter, boxDimensions, numFireflies) {
    // Create a base mesh for the particles (a tiny square)
    var firefly = BABYLON.MeshBuilder.CreateBox("firefly", { size: 0.02 }, scene);
    firefly.isVisible = false;

    // Create the SPS
    var SPS = new BABYLON.SolidParticleSystem("firefly-sps", scene, { updatable: true });

    // Add the firefly mesh to the SPS
    SPS.addShape(firefly, numFireflies);

    // Build the SPS mesh
    var fireflyMesh = SPS.buildMesh();
    fireflyMesh.alwaysSelectAsActiveMesh = true; // Disable frustum culling
    fireflyMesh.renderingGroupId = RenderingGroups.environment; // Set the rendering group ID

    // Dispose of the base mesh as it is no longer needed
    firefly.dispose();

    // Create a glow layer to simulate light emission
    var gl = new BABYLON.GlowLayer("firefly-glow", scene);
    gl.intensity = 1.5;

    // Function to update the particles
    SPS.updateParticle = function (particle) {
        // Randomly position the particles within a defined box
        if (!particle.initialized) {
            particle.position = new BABYLON.Vector3(
                boxCenter.x + (Math.random() - 0.5) * boxDimensions.x,
                boxCenter.y + (Math.random() - 0.5) * boxDimensions.y,
                boxCenter.z + (Math.random() - 0.5) * boxDimensions.z
            );
            particle.velocity = new BABYLON.Vector3(
                (Math.random() - 0.5) * maxVelocity,  // Use maxVelocity parameter
                (Math.random() - 0.5) * maxVelocity,
                (Math.random() - 0.5) * maxVelocity
            );
            particle.glowTimer = Math.random() * 100; // Start with a random glow timer
            particle.glowDuration = Math.random() * 100 + 50; // Random glow duration between 50 and 150 frames
            particle.isGlowing = false; // Start with no glow
            particle.initialized = true;
        }

        // Add some randomness to the movement to simulate less linear behavior
        particle.velocity.addInPlace(new BABYLON.Vector3(
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005
        ));

        // Cap the velocity to the maxVelocity
        particle.velocity.x = Math.max(Math.min(particle.velocity.x, maxVelocity), -maxVelocity);
        particle.velocity.y = Math.max(Math.min(particle.velocity.y, maxVelocity), -maxVelocity);
        particle.velocity.z = Math.max(Math.min(particle.velocity.z, maxVelocity), -maxVelocity);

        // Move the particle
        particle.position.addInPlace(particle.velocity);

        // Bounce the particles within the box boundaries
        if (particle.position.x > boxCenter.x + boxDimensions.x / 2 || particle.position.x < boxCenter.x - boxDimensions.x / 2) particle.velocity.x *= -1;
        if (particle.position.y > boxCenter.y + boxDimensions.y / 2 || particle.position.y < boxCenter.y - boxDimensions.y / 2) particle.velocity.y *= -1;
        if (particle.position.z > boxCenter.z + boxDimensions.z / 2 || particle.position.z < boxCenter.z - boxDimensions.z / 2) particle.velocity.z *= -1;

        // Update glow state
        particle.glowTimer++;
        if (particle.glowTimer >= particle.glowDuration) {
            particle.glowTimer = 0;
            particle.glowDuration = Math.random() * 100 + 50; // Reset glow duration
            particle.isGlowing = !particle.isGlowing;
        }

        // Set the color based on the glow state
        particle.color = particle.isGlowing ? new BABYLON.Color4(1.0, 0.5, 0.0, 1.0) : new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
    };

    // Initialize the SPS
    SPS.initParticles();

    // Set the SPS to update the particles at each frame
    scene.registerBeforeRender(function () {
        SPS.setParticles();
    });

    // Add the firefly mesh to the glow layer
    gl.addIncludedOnlyMesh(fireflyMesh);

    // Apply a standard material with emissive color to the firefly mesh
    var fireflyMaterial = new BABYLON.StandardMaterial("fireflyMaterial", scene);
    fireflyMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.0); // Strong orange-yellow color
    fireflyMesh.material = fireflyMaterial;
}

