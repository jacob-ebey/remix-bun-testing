import * as fs from "fs";
import * as path from "path";

import { createRequestHandler } from "@remix-run/server-runtime";
import * as build from "./build";

const mode = process.argv[2] === "dev" ? "development" : "production";

let requestHandler = createRequestHandler(build, mode);

setInterval(() => {
  Bun.gc(true);
}, 9000);

async function handler(request: Request): Promise<Response> {
  if (mode === "development") {
    let newBuild = await import("./build"); // <- This is the segfault source
    requestHandler = createRequestHandler(newBuild, mode);
  }

  const file = tryServeStaticFile("public", request);
  if (file) return file;

  return requestHandler(request);
}

const server = Bun.serve({
  port: 3000,
  fetch: mode === "development" ? liveReload(handler) : handler,
});

console.log(`Server started at ${server.hostname}`);

function tryServeStaticFile(
  staticDir: string,
  request: Request
): Response | undefined {
  const url = new URL(request.url);

  if (url.pathname.length < 2) return undefined;

  const filePath = path.join(staticDir, url.pathname);

  if (fs.existsSync(filePath)) {
    const file = Bun.file(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  return undefined;
}

function liveReload<TFunc extends Function>(callback: TFunc) {
  const registry = new Map([...Loader.registry.entries()]);
  function reload() {
    if (Loader.registry.size !== registry.size) {
      for (const key of Loader.registry.keys()) {
        if (!registry.has(key)) {
          Loader.registry.delete(key);
        }
      }
    }
  }

  return async (...args: unknown[]) => {
    reload();
    return callback(...args);
  };
}
