import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const tests = readdirSync(resolve(root, 'tests'))
  .filter((name) => /\.test\.(mjs|tsx)$/.test(name))
  .map((name) => `tests/${name}`);
const formatTargets = [
  'src',
  'tests',
  'scripts/**/*.mjs',
  '.vscode/*.json',
  'eslint.config.mjs',
  'database/compose.yaml',
  'next.config.ts',
  'package.json',
  'tsconfig.json',
];
const commands = {
  test: ['node_modules/tsx/dist/cli.mjs', '--test', ...tests],
  build: ['node_modules/next/dist/bin/next', 'build', '--webpack'],
  typecheck: ['node_modules/typescript/bin/tsc', '--noEmit'],
  lint: ['node_modules/eslint/bin/eslint.js', '.', '--max-warnings=0'],
  'lint:fix': ['node_modules/eslint/bin/eslint.js', '.', '--fix', '--max-warnings=0'],
  format: ['node_modules/prettier/bin/prettier.cjs', '--write', ...formatTargets],
  'format:check': ['node_modules/prettier/bin/prettier.cjs', '--check', ...formatTargets],
};
for (const action of ['setup', 'start', 'stop', 'status', 'check', 'shell']) {
  commands[`db:${action}`] = ['scripts/database/manage.mjs', action];
}
for (const action of ['migrate', 'seed', 'provision']) {
  commands[`db:${action}`] = ['scripts/database/foundation.mjs', action];
}
commands['test:db'] = [
  'node_modules/tsx/dist/cli.mjs',
  '--test',
  'tests/integration/database.test.tsx',
];
for (const action of ['backup', 'verify-backup']) {
  commands[`db:${action}`] = ['scripts/database/backup.mjs', action];
}
const args = commands[process.argv[2]];
if (!args) throw new Error(`Choose one of: ${Object.keys(commands).join(', ')}.`);
// Resolve local tools directly so Windows and bundled Node runtimes behave identically.
const child = spawn(
  process.execPath,
  [resolve(root, args[0]), ...args.slice(1), ...process.argv.slice(3)],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  },
);
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
