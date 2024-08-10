import { redirect } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return [
    { title: "World Models" },
    { name: "description", content: "Realizing World Models -- a gift for Andre" },
  ];
};

export let loader = async () => {
  // Redirect to the new route
  return redirect("/world-models/andre-vacha");
};

export default function Index() {
  // This component will not be rendered because of the redirect in the loader
  return null;
}
