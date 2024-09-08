import * as BABYLON from "@babylonjs/core"
import * as GUI from "@babylonjs/gui"
import { RenderingGroups } from "./constants"; // Import the RenderingGroups

export function addPhysicsText(scene, text, startPosition, appearanceDelay, sweepDelay, disposeDelay, maxLineLength, layerMask) {
    const glowLayer = new BABYLON.GlowLayer('glow', scene);
    glowLayer.intensity = 0.5;

    function splitTextIntoLines(text, maxLineLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length <= maxLineLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    function createGlow(text, options, advancedTexture) {
        const fontFamily = options.family || null;
        const color = options.color || null;
        const glow = options.backgroundGlow || null;
        const intensity = options.glowIntensity || null;
        const size = options.fontSize || null;
        const Y_AXIS = options.y_axis || "0px";
        const X_AXIS = options.x_axis || "0px";

        const text1 = new GUI.TextBlock();
        text1.text = text;
        text1.color = "white";
        text1.fontFamily = fontFamily;
        text1.fontWeight = 400;
        text1.fontSize = 92 * size;
        text1.shadowBlur = 20 * intensity;
        text1.shadowColor = "green";
        text1.shadowOffsetX = 1;
        text1.shadowOffsetY = 1;
        text1.resizeToFit = true;
        advancedTexture.addControl(text1);

        const blurtext2 = new GUI.TextBlock();
        blurtext2.text = text;
        blurtext2.color = color;
        blurtext2.fontFamily = fontFamily;
        blurtext2.fontWeight = 400;
        blurtext2.fontSize = 92 * size;
        blurtext2.shadowBlur = 70 * intensity;
        blurtext2.shadowColor = glow;
        blurtext2.shadowOffsetX = -7;
        blurtext2.shadowOffsetY = 1;
        blurtext2.fontWeight = "bold";
        blurtext2.resizeToFit = true;
        advancedTexture.addControl(blurtext2);

        const blurtext3 = new GUI.TextBlock();
        blurtext3.text = text;
        blurtext3.color = color;
        blurtext3.fontFamily = fontFamily;
        blurtext3.fontWeight = 400;
        blurtext3.fontSize = 92 * size;
        blurtext3.shadowBlur = 10 * intensity;
        blurtext3.shadowColor = glow;
        blurtext3.shadowOffsetX = 7;
        blurtext3.shadowOffsetY = 1;
        blurtext3.resizeToFit = true;
        advancedTexture.addControl(blurtext3);

        const blurtext4 = new GUI.TextBlock();
        blurtext4.text = text;
        blurtext4.color = color;
        blurtext4.fontFamily = fontFamily;
        blurtext4.fontWeight = 400;
        blurtext4.fontSize = 92 * size;
        blurtext4.shadowBlur = 60 * intensity;
        blurtext4.shadowColor = glow;
        blurtext4.shadowOffsetX = -1;
        blurtext4.shadowOffsetY = 1;
        blurtext4.resizeToFit = true;
        advancedTexture.addControl(blurtext4);

        text1.top = blurtext2.top = blurtext3.top = blurtext4.top = Y_AXIS;
        text1.left = blurtext2.left = blurtext3.left = blurtext4.left = X_AXIS;

        return {
            text1: text1,
            blurtext2: blurtext2,
            blurtext3: blurtext3,
            blurtext4: blurtext4
        };
    }

    const letters = [];
    const fontSize = 4;
    const lineHeight = fontSize / 8;
    const letterSpacing = fontSize / 6;

    const lines = splitTextIntoLines(text, maxLineLength);

    let currentYPosition = startPosition.y;
    lines.forEach((line, lineIndex) => {
        const lineLength = line.length * letterSpacing;
        const startXPosition = startPosition.x - lineLength / 2;

        const lineLetters = [];
        for (let i = line.length - 1; i >= 0; i--) {
            const letter = line[i];

            const letterMesh = BABYLON.MeshBuilder.CreatePlane(`letter_${lineIndex}_${i}`, { width: 1.5, height: 2 }, scene);
            letterMesh.position = new BABYLON.Vector3(startXPosition + (line.length - 1 - i) * letterSpacing, currentYPosition, startPosition.z);
            letterMesh.isVisible = false;
            letterMesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

            // Set the rendering group to the text group
            letterMesh.renderingGroupId = RenderingGroups.text;

            // Set the layer mask to match the text camera if provided
            if (layerMask !== undefined) {
                letterMesh.layerMask = layerMask;
            }

            glowLayer.addIncludedOnlyMesh(letterMesh);

            const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(letterMesh);
            createGlow(letter, {
                family: "Indie Flower",
                color: "#FDAA48",
                backgroundGlow: "#FFA500",
                glowIntensity: 1.3,
                fontSize: fontSize,
                y_axis: "0px",
                x_axis: "0px"
            }, advancedTexture);

            lineLetters.push(letterMesh);
        }
        currentYPosition -= lineHeight;
        letters.push(...lineLetters.reverse());
    });

    for (let i = 0; i < letters.length; i++) {
        setTimeout(() => {
            letters[i].isVisible = true;

            // Animation setup
            const animation = new BABYLON.Animation(
                "scalingAnimation",
                "scaling",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const keys = [
                { frame: 0, value: new BABYLON.Vector3(0.01, 0.01, 0.01) },
                { frame: 15, value: new BABYLON.Vector3(1, 1, 1) }
            ];

            animation.setKeys(keys);
            letters[i].animations.push(animation);

            const animatable = scene.beginAnimation(letters[i], 0, 15, false);

            animatable.onAnimationEnd = () => {
                setTimeout(() => {
                    if (scene.getPhysicsEngine()) {
                        // Create a physics aggregate for the letter
                        const letterAggregate = new BABYLON.PhysicsAggregate(
                            letters[i],
                            BABYLON.PhysicsShapeType.BOX,
                            { mass: 1, restitution: 0.9 },
                            scene
                        );

                        // Apply a gentle breeze-like impulse
                        const gentleImpulse = new BABYLON.Vector3(Math.random() * 10 - 5, Math.random() * 5, Math.random() * 10 - 5);
                        letterAggregate.body.applyImpulse(gentleImpulse, letters[i].getAbsolutePosition());

                        setTimeout(() => {
                            if (letterAggregate) {
                                letterAggregate.dispose();
                            }
                            letters[i].dispose();
                        }, disposeDelay);
                    } else {
                        console.warn("Physics engine not initialized");
                    }
                }, sweepDelay);
            };

        }, i * appearanceDelay);
    }
}

export function addCenteredPhysicsText(scene, text, camera, layerMask) {
    const distanceFromCamera = 5; // Distance in front of the camera
    const cameraDirection = camera.getDirection(BABYLON.Axis.Z);
    const startPosition = camera.position.add(cameraDirection.scale(distanceFromCamera));

    const appearanceDelay = 50;
    const sweepDelay = 3000;
    const disposeDelay = 4000;
    const maxLineLength = 20;

    addPhysicsText(scene, text, startPosition, appearanceDelay, sweepDelay, disposeDelay, maxLineLength, layerMask);
}

function getRandomPositionInTopHalfSphere(radius, center) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(1 - v); // Restrict phi to [0, π/2]
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return new BABYLON.Vector3(x, y, z).add(center);
}

function isFarEnough(position, positions, minDistance) {
    for (let i = 0; i < positions.length; i++) {
        if (BABYLON.Vector3.Distance(position, positions[i]) < minDistance) {
            return false;
        }
    }
    return true;
}

export function addPhysicsTextSwarm(scene, texts, radius, minDistance, center) {
    const positions = [];
    const appearanceDelay = 50;
    const sweepDelay = 3000;
    const disposeDelay = 4000;
    const maxLineLength = 20;

    texts.forEach(text => {
        let position;
        let attempts = 0;
        do {
            position = getRandomPositionInTopHalfSphere(radius, center);
            attempts++;
        } while (!isFarEnough(position, positions, minDistance) && attempts < 100);

        if (attempts < 100) {
            positions.push(position);
            addPhysicsText(scene, text, position, appearanceDelay, sweepDelay, disposeDelay, maxLineLength);
        } else {
            console.warn(`Could not place text: "${text}" without intersecting after 100 attempts`);
        }
    });
}