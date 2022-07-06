import * as React from "react";
import type * as RemixServer from "@remix-run/server-runtime";
import * as RemixReact from "@remix-run/react";
import NProgress from "nprogress";
import nProgressStylesHref from "nprogress/nprogress.css";
import * as Meta from "~/meta";

export const meta: RemixServer.MetaFunction = () => Meta.create();

let latencyTotal = 0;
let latencyCount = 0;
let onLatencyChange: undefined | ((latency: number) => void);
if (typeof document !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = (async (...args) => {
    let start = Date.now();
    let response = await originalFetch(...args);
    let end = Date.now();

    latencyCount++;
    latencyTotal += end - start;
    onLatencyChange?.(latencyTotal / latencyCount);

    return response;
  }) as typeof fetch;
}

function App({ children }: React.PropsWithChildren<{}>) {
  const transition = RemixReact.useTransition();
  const fetchers = RemixReact.useFetchers();
  const [latency, setLatency] = React.useState(0);

  React.useEffect(() => {
    onLatencyChange = setLatency;
    return () => {
      onLatencyChange = undefined;
    };
  }, []);

  const state = React.useMemo<"idle" | "loading">(
    function getGlobalState() {
      const states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers]
  );

  React.useEffect(() => {
    switch (state) {
      case "loading":
        NProgress.start();
      default:
        NProgress.done();
    }
  }, [state]);

  React.useEffect(() => {
    return () => {
      NProgress.remove();
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <RemixReact.Meta />
        <link rel="stylesheet" href={nProgressStylesHref} />
        <RemixReact.Links />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                margin: 40px auto;
                max-width: 650px;
                line-height: 1.6;
                font-size: 18px;
                color: #444;
                padding: 0 10px;
              }
              a {
                color: #0066cc;
              }
              a, button {
                cursor: pointer;
              }
              h1, h2, h3 {
                line-height: 1.2;
              }
              header h1 {
                font-size: 1.2em;
              }
              label, input[type="text"] {
                display: block;
              }
              @media (prefers-color-scheme: dark) {
                body {
                  background-color: #1a1a1a;
                  color: #fff;
                }
                a {
                  color: #0099ff;
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <RemixReact.Form id="logout-form" method="post" action="/logout" />

        <header>
          <h1>{Meta.create().title}</h1>
          <nav>
            <RemixReact.Link to="/">Home</RemixReact.Link> /{" "}
            <RemixReact.Link to="/counter">Counter</RemixReact.Link> /{" "}
            <span>Latency: {latency === 0 ? "?" : latency.toFixed(2)}ms</span>
          </nav>
        </header>
        {children}
        <RemixReact.ScrollRestoration />
        <RemixReact.Scripts />
        <RemixReact.LiveReload />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <App>
      <RemixReact.Outlet />
    </App>
  );
}

export function CatchBoundary() {
  const caught = RemixReact.useCatch();

  return (
    <App>
      <h1>{caught.status}</h1>
      {caught.statusText && <p>{caught.statusText}</p>}
    </App>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error);

  return (
    <App>
      <main>
        <h1>Internal Server Error</h1>
        <p>Something went wrong that we haven't accounted for.</p>
      </main>
    </App>
  );
}
