import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const mode = process.argv[2] || 'dev';
if (!['dev', 'start'].includes(mode)) throw new Error('Use dev or start.');
const port = process.env.PORT || '4173';
const hostname = process.env.HOSTNAME_OVERRIDE || '0.0.0.0';
const child = spawn(
  process.execPath,
  [
    resolve(root, 'node_modules/next/dist/bin/next'),
    mode,
    '--hostname',
    hostname,
    '--port',
    port,
    ...(mode === 'dev' ? ['--webpack'] : []),
  ],
  { cwd: root, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
