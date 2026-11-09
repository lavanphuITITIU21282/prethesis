import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export async function transaction(client, work) {
  await client.query('BEGIN');
  try {
    const result = await work();
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

export async function migrate(client, directory) {
  return transaction(client, async () => {
    await client.query('SELECT pg_advisory_xact_lock(106798, 1)');
    await client.query(`CREATE SCHEMA IF NOT EXISTS app_meta;
      CREATE TABLE IF NOT EXISTS app_meta.schema_migrations (
        version text PRIMARY KEY, checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
    const applied = new Map(
      (await client.query('SELECT version, checksum FROM app_meta.schema_migrations')).rows.map(
        (row) => [row.version, row.checksum],
      ),
    );
    const files = readdirSync(directory)
      .filter((name) => name.endsWith('.sql'))
      .sort();
    const versions = files.map((file) => file.slice(0, 3));
    if (new Set(versions).size !== versions.length) throw new Error('DUPLICATE_MIGRATION_VERSION');
    const latest = [...applied.keys()].sort().at(-1);
    for (const file of applied.keys())
      if (!files.includes(file)) throw new Error('APPLIED_MIGRATION_MISSING');
    if (latest && files.some((file) => !applied.has(file) && file < latest))
      throw new Error('MIGRATION_OUT_OF_ORDER');
    let count = 0;
    for (const file of files) {
      if (!/^\d{3}_[a-z_]+\.sql$/.test(file)) throw new Error('INVALID_MIGRATION_FILENAME');
      const sql = readFileSync(resolve(directory, file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      if (applied.has(file)) {
        if (applied.get(file) !== checksum) throw new Error('APPLIED_MIGRATION_CHANGED');
        continue;
      }
      await client.query(sql);
      await client.query(
        'INSERT INTO app_meta.schema_migrations(version, checksum) VALUES ($1,$2)',
        [file, checksum],
      );
      count++;
    }
    return { applied: count, total: files.length };
  });
}
