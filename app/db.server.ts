import * as Sqlite from "bun:sqlite";

declare global {
  var db: Sqlite.Database;
}

export const db: Sqlite.Database =
  globalThis.db ||
  (globalThis.db = new Sqlite.Database(process.env.DB_FILE || "db.sqlite"));
db.run(`
  CREATE TABLE IF NOT EXISTS counter (
    id INTEGER PRIMARY KEY,
    count INTEGER
  );
`);
db.run(`
  INSERT OR IGNORE INTO counter (id, count) VALUES (1, 0)
`);
