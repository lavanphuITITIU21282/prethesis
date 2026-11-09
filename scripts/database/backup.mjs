import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { resolve, relative, isAbsolute } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { localDatabaseConfig } from '../../src/shared/infrastructure/database-config.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const adminConfig = localDatabaseConfig(root, 'admin');

function postgresCommand(args) {
  return spawn(
    'docker',
    [
      'compose',
      '--project-name',
      'tram-hoc-db',
      '--env-file',
      resolve(root, '.env.database.local'),
      '--file',
      resolve(root, 'database/compose.yaml'),
      'exec',
      '-T',
      'postgres',
      ...args,
    ],
    { cwd: root, stdio: ['pipe', 'pipe', 'inherit'] },
  );
}

function completion(child) {
  return new Promise((resolveDone, reject) => {
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolveDone() : reject(new Error('BACKUP_PROCESS_FAILED')),
    );
  });
}

async function checksum(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

async function backup() {
  const directory = resolve(homedir(), 'Downloads/TramHoc-db-backups');
  const pathFromRoot = relative(root, directory);
  if (!pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot))
    throw new Error('BACKUP_MUST_BE_OUTSIDE_PROJECT');
  mkdirSync(directory, { recursive: true });
  const name = `tram-hoc-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}.dump`;
  const file = resolve(directory, name);
  const child = postgresCommand([
    'pg_dump',
    '-U',
    adminConfig.user,
    '-d',
    adminConfig.database,
    '--format=custom',
    '--no-owner',
  ]);
  child.stdin.end();
  try {
    await Promise.all([
      completion(child),
      pipeline(child.stdout, createWriteStream(file + '.partial', { flags: 'wx', mode: 0o600 })),
    ]);
    renameSync(file + '.partial', file);
    const sha256 = await checksum(file);
    writeFileSync(file + '.sha256', sha256 + '  ' + name + '\n', { flag: 'wx', mode: 0o600 });
    return { file, sha256 };
  } catch (error) {
    child.kill();
    throw error;
  }
}

async function verifyBackup(file) {
  if (!file) throw new Error('BACKUP_PATH_REQUIRED');
  file = resolve(file);
  const expected = readFileSync(file + '.sha256', 'utf8').split(/\s/)[0];
  if ((await checksum(file)) !== expected) throw new Error('BACKUP_CHECKSUM_MISMATCH');
  const name = 'tram_hoc_restore_' + randomUUID().replaceAll('-', '');
  const control = new pg.Client(adminConfig);
  await control.connect();
  let created = false;
  let restored;
  try {
    await control.query(`CREATE DATABASE ${pg.escapeIdentifier(name)}`);
    created = true;
    const child = postgresCommand([
      'pg_restore',
      '-U',
      adminConfig.user,
      '-d',
      name,
      '--exit-on-error',
      '--single-transaction',
      '--no-owner',
    ]);
    child.stdout.resume();
    try {
      await Promise.all([completion(child), pipeline(createReadStream(file), child.stdin)]);
    } catch (error) {
      child.kill();
      throw error;
    }
    const target = new pg.Client({ ...adminConfig, database: name });
    try {
      await target.connect();
      const result = await target.query(
        'SELECT (SELECT count(*)::int FROM content.questions) AS questions, (SELECT count(*)::int FROM app_meta.schema_migrations) AS migrations',
      );
      restored = result.rows[0];
    } finally {
      await target.end();
    }
  } finally {
    // Drop only the database generated and successfully created by this verification run.
    if (created && /^tram_hoc_restore_[a-f0-9]{32}$/.test(name))
      await control.query(`DROP DATABASE ${pg.escapeIdentifier(name)}`);
    await control.end();
  }
  return { restored: true, ...restored, verificationDatabaseRemoved: true };
}

try {
  const action = process.argv[2];
  if (!['backup', 'verify-backup'].includes(action)) throw new Error('UNKNOWN_BACKUP_ACTION');
  console.log(
    JSON.stringify(action === 'backup' ? await backup() : await verifyBackup(process.argv[3])),
  );
} catch (error) {
  const code = error.code || error.message;
  console.error(
    `Backup operation failed (${/^[A-Z0-9_]+$/.test(code) ? code : 'BACKUP_ERROR'}). The application database was not replaced.`,
  );
  process.exitCode = 1;
}
