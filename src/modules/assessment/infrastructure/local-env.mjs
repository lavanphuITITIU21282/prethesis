import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadLocalEnv(root, env = process.env) {
  const file = resolve(root, '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*(GEMINI_API_KEY|GEMINI_MODEL)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || env[m[1]]) continue;
    let value = m[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    env[m[1]] = value;
  }
}
