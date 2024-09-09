import * as BABYLON from '@babylonjs/core';
import { RenderingGroups } from './constants'; // Import the RenderingGroups

export function fadeInScene(scene, camera){
    BABYLON.Effect.ShadersStore["fadePixelShader"] =
                        "precision highp float;" +
                        "varying vec2 vUV;" +
                        "uniform sampler2D textureSampler; " +
                        "uniform float fadeLevel; " +
                        "void main(void){" +
                        "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
                        "baseColor.a = 1.0;" +
                        "gl_FragColor = baseColor;" +
	"}";
	var fadeLevel = {
        value : 1.0
        };
	var postProcess = new BABYLON.PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, camera);
	postProcess.onApply = (effect) => {
   		effect.setFloat("fadeLevel", fadeLevel.value);
    };	
    
    const ppAni = new BABYLON.AnimationGroup('ppAni', scene);
    ppAni.normalize(0, 100);
    //set target's value
    var animation = new BABYLON.Animation('fadeAnim',"value",60,BABYLON.Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
    var fadeOutKeys = [
        { frame: 0, value: 0 },
        { frame: 800, value: 1 }
    ];      
            animation.setKeys(fadeOutKeys);
    postProcess.animations.push(animation);
    ppAni.addTargetedAnimation(animation, fadeLevel);
    ppAni.play();

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
}