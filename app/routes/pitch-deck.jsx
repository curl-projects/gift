import { PitchScene } from "~/components/environment/PitchScene/PitchScene";
import WorldCanvas from "~/components/canvas/WorldCanvas";
import { getWorldContent, getJournalEntries } from "~/models/world-model.server";
import { json } from "@remix-run/node";
import { useStarFireSync } from "~/components/synchronization/StarFireSync";
import { OverlayPainter } from "~/components/synchronization/sync-ui/OverlayPainter";

export async function loader() {

  
    const user = await getWorldContent('andre-vacha')
    const journalEntries = await getJournalEntries('andre-vacha')
  
    return json({ user, journalEntries });
  }



export default function PitchDeck(){
    const { campfireView } = useStarFireSync();
    return(
        <>
        
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
            style={{
            height: '100vh',
            width: '100vw',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: campfireView?.active ? 'unset' : 'none',
            }}>
            <PitchScene/>
            </div>        
        </>
    )
}