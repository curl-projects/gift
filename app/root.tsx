import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import styles from "~/styles/index.css?url";
import { StarFireSync } from "~/components/synchronization/StarFireSync";

export const links = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "preconnect", href: "tldraw/tldraw.css" },
    // { rel: "preconnect", href: "https://fonts.googleapis.com" },
    // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap" },
    // { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Adamina&display=swap" },
    // { rel: "stylesheet", href: "https://fonts.googleapis.com/css?family=Finger+Paint" },
    // {
    //   rel: "stylesheet",
    //   href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700&display=swap",
    // },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <StarFireSync>
        {children}
        </StarFireSync>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
