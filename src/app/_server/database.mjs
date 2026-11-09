import 'server-only';
import { createDatabase } from '../../shared/infrastructure/postgres.mjs';
import { serverDatabaseConfig } from '../../shared/infrastructure/database-config.mjs';

// Reuse one bounded pool across development hot reloads; do not connect during build/import.
const key = Symbol.for('tram-hoc.database');
export const database = (globalThis[key] ??= createDatabase(() =>
  serverDatabaseConfig(process.cwd()),
));
