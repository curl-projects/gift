import { useEffect } from "react";
import { useConstellationMode } from "./ConstellationModeContext";

export function OverlayPainter(){
    const { overlayMode, setOverlayMode } = useConstellationMode();

    useEffect(()=>{
        setTimeout(()=>{
            setOverlayMode(true)
        }, 1000)
    }, [])

    useEffect(() => {
        const tlContainer = document.querySelector('.tl-container');
        const tlBackground = document.querySelector('.tl-background');

        if (overlayMode) {
            tlContainer?.classList.add('overlay-active');
            tlBackground?.classList.add('overlay-active');
        } else {
            tlContainer?.classList.remove('overlay-active');
            tlBackground?.classList.remove('overlay-active');
        }
    }, [overlayMode]);


    return null
}