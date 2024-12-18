import { useActionData } from "@remix-run/react";
import { useDataContext } from '~/components/synchronization/DataContext';
import { json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import WorldCanvas from "~/components/canvas/WorldCanvas.jsx";
import { getWorldContent, saveAnnotation } from "~/models/world-model.server";
import { useEffect } from "react";
import { CampfireScene } from "~/components/environment/CampfireScene/CampfireScene";

export async function loader({ params }) {
  const person = params.person;
  console.debug("Person:", person)

  const user = await getWorldContent(person)
  // get page content

  return json({ user });
}

export default function WorldModel(){
    const actionData = useActionData();

    useEffect(()=>{
        console.log("ACTION DATA:", actionData)
    }, [actionData])

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
          <CampfireScene/>
        </div>

    
        </>
    )
}