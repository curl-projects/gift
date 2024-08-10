import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import WorldCanvas from "~/components/canvas/WorldCanvas.jsx";
import { getWorldContent } from "~/models/world-model.server";


export async function loader({ params }) {
  const person = params.person;
  console.debug("Person:", person)

  const user = await getWorldContent(person)
  // get page content

  return json({ user });
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