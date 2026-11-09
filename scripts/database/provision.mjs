import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { localDatabaseConfig } from '../../src/shared/infrastructure/database-config.mjs';
import { transaction } from './migrations.mjs';

export async function provisionApp(client, root) {
  const name = 'tram_hoc_app';
  const file = resolve(root, '.env.database.app.local');
  const existing = await client.query(
    'SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=$1',
    [name],
  );
  if (existing.rowCount && !existsSync(file))
    throw new Error('APP_CREDENTIALS_MISSING_FOR_EXISTING_ROLE');
  if (existing.rowCount && Object.values(existing.rows[0]).some(Boolean))
    throw new Error('UNSAFE_EXISTING_APP_ROLE');
  if (!existsSync(file)) {
    const admin = localDatabaseConfig(root, 'admin');
    writeFileSync(
      file,
      [
        '# Private runtime credentials; never commit or print.',
        `POSTGRES_DB=${admin.database}`,
        `POSTGRES_USER=${name}`,
        `POSTGRES_PASSWORD=${randomBytes(32).toString('hex')}`,
        `POSTGRES_PORT=${admin.port}`,
        '',
      ].join('\n'),
      { flag: 'wx', mode: 0o600 },
    );
  }
  const config = localDatabaseConfig(root, 'app');
  if (config.user !== name) throw new Error('APP_ROLE_MISMATCH');
  await transaction(client, async () => {
    if (!existing.rowCount) {
      // PostgreSQL role DDL cannot bind a password parameter; escape it with the driver's literal encoder.
      await client.query(
        `CREATE ROLE ${name} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD ${pg.escapeLiteral(config.password)}`,
      );
    }
    await client.query(`GRANT tram_hoc_runtime TO ${name}`);
  });
  const runtime = new pg.Client({ ...config, connectionTimeoutMillis: 3000 });
  try {
    await runtime.connect();
    await runtime.query('SELECT 1');
  } finally {
    await runtime.end();
  }
  return { role: name, verified: true };
}
