import { PitchScene } from "~/components/environment/PitchScene/PitchScene";

export default function PitchDeck(){
    return(
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
    )
}