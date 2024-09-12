import { useEffect } from "react";
import { useConstellationMode } from "./ConstellationModeContext";

export function OverlayPainter(){
    const { overlayControls } = useConstellationMode(); // Destructure overlayControls

    useEffect(() => {
        const tlContainer = document.querySelector('.tl-container');
        const tlBackground = document.querySelector('.tl-background');

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
    }, [overlayControls]);

    return null;
}