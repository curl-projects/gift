export function animateMesh(scene, animationEvent){
    const { animationGroupName, props } = animationEvent;
    const animationGroup = scene.getAnimationGroupByName(animationGroupName);
    
    if (animationGroup) {
        const speed = props.speed || 1.0; // Default speed is 1.0 if not provided

        if (props.reverse) {
            console.log("STARTING REVERSE ANIMATION", props.startFrame, props.endFrame)
            animationGroup.play(false, speed, props.startFrame || animationGroup.to, props.endFrame || animationGroup.from);
            animationGroup.onAnimationEndObservable.addOnce(() => {
                animationGroup.pause();
                const idleAnimationGroup = scene.getAnimationGroupByName('idle');
                if (idleAnimationGroup) {
                    blendAnimations(animationGroup, idleAnimationGroup, 5); // Blend to idle animation
                }
                animationEvent.onComplete && animationEvent.onComplete();
            });
        } else {
            animationGroup.start(false);
            animationGroup.onAnimationEndObservable.addOnce(() => {
                const idleAnimationGroup = scene.getAnimationGroupByName('idle');
                if (idleAnimationGroup) {
                    blendAnimations(animationGroup, idleAnimationGroup, 5); // Blend to idle animation
                }
                animationEvent.onComplete && animationEvent.onComplete();
            });
        }
    }
}

function blendAnimations(fromGroup, toGroup, duration) {
    fromGroup.setWeightForAllAnimatables(1.0);
    toGroup.setWeightForAllAnimatables(0.0);
    toGroup.start(true, 1.0, toGroup.from, toGroup.to, false);

    const startTime = performance.now();
    const initialPosition = fromGroup.targetedAnimations[0].target.position.clone(); // Assuming the first targeted animation's target is the character

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const blend = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const blendFactor = Math.min(elapsed / duration, 1.0);
        const easedBlendFactor = easeInOut(blendFactor);

        fromGroup.setWeightForAllAnimatables(1.0 - easedBlendFactor);
        toGroup.setWeightForAllAnimatables(easedBlendFactor);

        // Adjust the position to avoid sliding
        const currentPosition = fromGroup.targetedAnimations[0].target.position;
        currentPosition.copyFrom(initialPosition);

        if (blendFactor < 1.0) {
            requestAnimationFrame(blend);
        } else {
            fromGroup.stop();
        }
    };
    blend();
}