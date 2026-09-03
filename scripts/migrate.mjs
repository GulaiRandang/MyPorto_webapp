/**
 * Minimal forward-only migration runner.
 *
 *   node --env-file=.env.local scripts/migrate.mjs
 *   (wired as `npm run db:migrate`)
 *
 * Applies every *.sql file in supabase/migrations in filename order, once each,
 * tracked in a `public._migrations` table. Each file runs in its own transaction.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "migrations",
);

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error(
    "SUPABASE_DB_URL is not set. Add it to .env.local (see .env.example).",
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const applied = new Set(
    (await client.query("select name from public._migrations")).rows.map(
      (r) => r.name,
    ),
  );

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`= skip   ${file}`);
      continue;
    }
    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    process.stdout.write(`+ apply  ${file} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into public._migrations (name) values ($1)", [
        file,
      ]);
      await client.query("commit");
      console.log("ok");
      ran++;
    } catch (err) {
      await client.query("rollback");
      console.log("FAILED");
      throw err;
    }
  }

  console.log(
    ran === 0 ? "\nNothing to apply — database is up to date." : `\nApplied ${ran} migration(s).`,
  );
}

main()
  .catch((err) => {
    console.error("\nMigration error:\n", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
