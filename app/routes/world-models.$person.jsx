import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import WorldCanvas from "~/components/canvas/WorldCanvas.jsx";
import { getWorldContent, saveAnnotation } from "~/models/world-model.server";

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
        return json({ error: error.message }, { status: 500 });
      }

    default:
      return json({ error: "Unknown action type" }, { status: 400 });
  }
}

export default function WorldModel(){

    return(
        <div className='canvasDiv'>
            <ClientOnly>
                {() => <WorldCanvas 

                />}
            </ClientOnly>
        </div>
    )
}