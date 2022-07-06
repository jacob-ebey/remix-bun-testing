import * as RemixServer from "@remix-run/server-runtime";
import * as RemixReact from "@remix-run/react";
import { db } from "~/db.server";

type LoaderData = {
  count: number;
};

export const loader: RemixServer.LoaderFunction = () => {
  const row = db
    .query<any, { count: number }>(`SELECT count FROM counter WHERE id = 1`)
    .get();
  const count = row?.count || 0;

  return { count };
};

export default function Counter() {
  const { count } = RemixReact.useLoaderData<LoaderData>();

  return (
    <main>
      <h1>Counter</h1>
      <p>
        This is a counter stored in SQLite. Click the button to increment it.
      </p>
      <p>Count: {count}</p>
      <RemixReact.Form method="post">
        <button type="submit">Increment</button>
      </RemixReact.Form>
    </main>
  );
}

export const action: RemixServer.ActionFunction = () => {
  db.transaction(() => {
    db.run(`UPDATE counter SET count = count + 1 WHERE id = 1`);
  })();
  return null;
};
