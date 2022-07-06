import type * as RemixServer from "@remix-run/server-runtime";
import * as RemixReact from "@remix-run/react";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: RemixServer.EntryContext
) {
  let body = await renderToReadableStream(
    <RemixReact.RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set("Content-Type", "text/html");

  return new Response(body as any, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
