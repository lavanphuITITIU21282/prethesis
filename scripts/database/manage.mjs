import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import pg from 'pg';

const root = fileURLToPath(new URL('../../', import.meta.url));
const privateConfig = resolve(root, '.env.database.local');
const actions = ['setup', 'start', 'stop', 'status', 'check', 'shell'];
const action = process.argv[2];

function runDocker(args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn('docker', args, { cwd: root, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolveRun() : reject(new Error('DOCKER_COMMAND_FAILED')),
    );
  });
}

function compose(args) {
  return runDocker([
    'compose',
    '--progress',
    'plain',
    '--project-name',
    'tram-hoc-db',
    '--env-file',
    privateConfig,
    '--file',
    resolve(root, 'database/compose.yaml'),
    ...args,
  ]);
}

function config() {
  if (!existsSync(privateConfig)) throw new Error('RUN_DB_SETUP_FIRST');
  const env = parseEnv(readFileSync(privateConfig, 'utf8'));
  for (const key of ['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD']) {
    if (!env[key]) throw new Error('INCOMPLETE_DATABASE_CONFIG');
  }
  const port = Number(env.POSTGRES_PORT || 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('INVALID_DATABASE_PORT');
  }
  return { ...env, port };
}

async function checkConnection() {
  const env = config();
  // This local development connection is not wired into application requests.
  const client = new pg.Client({
    host: '127.0.0.1',
    port: env.port,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    ssl: false,
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
    application_name: 'tram-hoc-database-check',
  });
  try {
    await client.connect();
    const result = await client.query(
      "SELECT current_database() AS database, current_setting('server_version') AS version",
    );
    console.log(
      JSON.stringify({ connected: true, ...result.rows[0], host: '127.0.0.1', port: env.port }),
    );
  } finally {
    await client.end();
  }
}

try {
  if (!actions.includes(action)) throw new Error('CHOOSE_SETUP_START_STOP_STATUS_CHECK_OR_SHELL');
  if (action === 'setup') {
    await runDocker(['version', '--format', '{{.Server.Version}}']);
    // Exclusive creation never replaces credentials for an existing volume.
    if (!existsSync(privateConfig)) {
      writeFileSync(
        privateConfig,
        [
          '# Local development credentials. Never commit or print this file.',
          'POSTGRES_DB=tram_hoc',
          'POSTGRES_USER=tram_hoc_dev',
          `POSTGRES_PASSWORD=${randomBytes(32).toString('hex')}`,
          'POSTGRES_PORT=5432',
          '',
        ].join('\n'),
        { flag: 'wx', mode: 0o600 },
      );
      console.log('Created private database configuration without displaying credentials.');
    }
  }
  const env = config();
  if (action === 'setup' || action === 'start') {
    await compose(['up', '--detach', '--wait', '--wait-timeout', '90']);
    await checkConnection();
  } else if (action === 'stop') {
    // Stop preserves both the container and the named data volume; no reset command is provided.
    await compose(['stop', 'postgres']);
  } else if (action === 'status') {
    await compose(['ps']);
  } else if (action === 'check') {
    await checkConnection();
  } else if (action === 'shell') {
    await compose(['exec', 'postgres', 'psql', '-U', env.POSTGRES_USER, '-d', env.POSTGRES_DB]);
  }
} catch (error) {
  // Driver errors may contain connection metadata; expose only a bounded diagnostic code.
  const code = error?.code || error?.message || 'UNKNOWN_ERROR';
  const safeCode = /^[A-Z0-9_]+$/.test(code) ? code : 'DATABASE_COMMAND_FAILED';
  console.error(
    `Database command failed (${safeCode}). Check Docker Desktop and database/README.md.`,
  );
  process.exitCode = 1;
}
