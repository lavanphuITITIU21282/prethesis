import pg from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localDatabaseConfig } from '../../src/shared/infrastructure/database-config.mjs';
import { migrate } from './migrations.mjs';
import { seedCatalog } from './catalog.mjs';
import { provisionApp } from './provision.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const action = process.argv[2];
const client = new pg.Client({
  ...localDatabaseConfig(root, 'admin'),
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
});
try {
  await client.connect();
  let result;
  if (action === 'migrate') result = await migrate(client, resolve(root, 'database/migrations'));
  else if (action === 'seed')
    result = await seedCatalog(
      client,
      JSON.parse(readFileSync(resolve(root, 'public/data/course.json'), 'utf8')),
      Number(process.env.CONTENT_VERSION || 1),
    );
  else if (action === 'provision') result = await provisionApp(client, root);
  else throw new Error('UNKNOWN_DATABASE_ACTION');
  console.log(JSON.stringify({ action, ...result }));
} catch (error) {
  const code = error.code || error.message;
  console.error(
    `Database operation failed (${/^[A-Z0-9_]+$/.test(code) ? code : 'DATABASE_ERROR'}). No credentials were logged.`,
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
