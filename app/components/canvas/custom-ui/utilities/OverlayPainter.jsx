import { useEffect } from "react";
import { useConstellationMode } from "./ConstellationModeContext";

export function OverlayPainter(){
    const { overlayControls } = useConstellationMode(); // Destructure overlayControls

    useEffect(() => {
        console.log("OVERLAY PAINTER", overlayControls)
        const tlContainer = document.querySelector('.tl-container');
        const tlBackground = document.querySelector('.tl-background');
        if(overlayControls.trueOverlay){
            const overlayDiv = document.createElement('div');
            overlayDiv.id = 'trueOverlay';
            overlayDiv.style.position = 'fixed';
            overlayDiv.style.top = 0;
            overlayDiv.style.left = 0;
            overlayDiv.style.width = '100%';
            overlayDiv.style.height = '100%';
            overlayDiv.style.zIndex = 9999; // Ensure it's above all other elements
            overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background

            // Append the overlay div to the body
            document.body.appendChild(overlayDiv);
            overlayControls.onComplete && overlayControls.onComplete(); // placeholder, nothing to await here
        }
        else{
            // rip down overlay if it exists
            const existingOverlay = document.getElementById('trueOverlay');
            if (existingOverlay) {
                document.body.removeChild(existingOverlay);
            }

            if (overlayControls.dark) {
                tlContainer?.classList.add('overlay-active');
                tlBackground?.classList.add('overlay-active');
            } else {
                tlContainer?.classList.remove('overlay-active');
                tlBackground?.classList.remove('overlay-active');
            }
    
            // Apply transition duration
            const duration = overlayControls.immediate ? 0 : overlayControls.duration;
            tlContainer?.style.setProperty('--overlay-transition-duration', `${duration}s`);
            tlBackground?.style.setProperty('--overlay-transition-duration', `${duration}s`);
            setTimeout(()=>{
                overlayControls.onComplete && overlayControls.onComplete();
            }, duration)
            
        }
      
    }, [overlayControls]);

    return null;
}