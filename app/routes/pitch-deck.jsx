import { PitchScene } from "~/components/environment/PitchScene/PitchScene";
import WorldCanvas from "~/components/canvas/WorldCanvas";
import { getWorldContent } from "~/models/world-model.server";
import { json } from "@remix-run/node";

export async function loader() {

  
    const user = await getWorldContent('andre-vacha')
  
    return json({ user });
  }



export default function PitchDeck(){
    return(
        <>
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
        <div style={{
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

       
        
        </>
    )
}