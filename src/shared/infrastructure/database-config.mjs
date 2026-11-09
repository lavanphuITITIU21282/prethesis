import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

export function localDatabaseConfig(root, kind = 'app') {
  const file = kind === 'admin' ? '.env.database.local' : '.env.database.app.local';
  const env = parseEnv(readFileSync(resolve(root, file), 'utf8'));
  const port = Number(env.POSTGRES_PORT || 5432);
  if (
    !env.POSTGRES_USER ||
    !env.POSTGRES_DB ||
    !env.POSTGRES_PASSWORD ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('INVALID_DATABASE_CONFIG');
  }
  return {
    host: '127.0.0.1',
    port,
    user: env.POSTGRES_USER,
    database: env.POSTGRES_DB,
    password: env.POSTGRES_PASSWORD,
    ssl: false,
  };
}

export function serverDatabaseConfig(root, env = process.env) {
  // Production uses an explicit server-only URL; an invalid URL never falls back to local admin credentials.
  if (env.DATABASE_URL) {
    const url = new URL(env.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(url.protocol))
      throw new Error('INVALID_DATABASE_URL');
    return { connectionString: env.DATABASE_URL };
  }
  return localDatabaseConfig(root, 'app');
}
