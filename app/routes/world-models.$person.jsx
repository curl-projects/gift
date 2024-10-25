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

export async function action({ request }) {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  switch (actionType) {
    case "saveAnnotation":
      const mediaId = formData.get("mediaId");
      const content = formData.get("content");
      const fromPos = formData.get("fromPos");
      const toPos = formData.get("toPos");

      try {
        const annotation = await saveAnnotation(mediaId, content, fromPos, toPos);
        return json({ annotation });
      } catch (error) {
        console.error("ERROR:", error)
        return json({ error: error.message }, { status: 500 });
      }
    default:
      return json({ error: "Unknown action type" }, { status: 400 });
  }
}

export default function WorldModel(){
    const { data } = useDataContext();
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