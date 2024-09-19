import { PitchScene } from "~/components/environment/PitchScene/PitchScene";
import WorldCanvas from "~/components/canvas/WorldCanvas";
import { getWorldContent } from "~/models/world-model.server";
import { json } from "@remix-run/node";
import { StarFireSync } from "~/components/synchronization/StarFireSync";
import { OverlayPainter } from "~/components/synchronization/sync-ui/OverlayPainter";

export async function loader() {

  
    const user = await getWorldContent('andre-vacha')
  
    return json({ user });
  }



export default function PitchDeck(){
    return(
        <>
        <StarFireSync>
            <OverlayPainter />
            <div id='constellation-canvas' style={{
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
            overflow: 'hidden',
            }}>
                <WorldCanvas />
            </div>
            <div 
            id="disable-pointer-events"
            style={{
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
            overflow: 'hidden',
            }}>
            <PitchScene/>
            </div>
        </StarFireSync>

       
        
        </>
    )
}