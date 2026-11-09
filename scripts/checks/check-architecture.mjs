import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = resolve(root, 'src');
const files = readdirSync(source, { recursive: true }).filter((file) =>
  /\.(?:tsx?|mjs|js)$/.test(file),
);
const modules = ['identity', 'content', 'learning', 'assessment', 'personalization'];
for (const name of modules)
  assert.ok(existsSync(resolve(source, 'modules', name)), `Missing module: ${name}`);

for (const name of files) {
  const file = resolve(source, name);
  const normalized = name.replaceAll(sep, '/');
  const text = readFileSync(file, 'utf8');
  const imports = [...text.matchAll(/(?:from\s*|import\s*\()(['"])([^'"]+)\1/g)].map(
    (match) => match[2],
  );
  for (const specifier of imports) {
    if (specifier.startsWith('.') || specifier.startsWith('@/')) {
      const target = specifier.startsWith('@/')
        ? resolve(source, specifier.slice(2))
        : resolve(dirname(file), specifier);
      assert.ok(
        [target, ...['.ts', '.tsx', '.js', '.mjs'].map((ext) => target + ext)].some(existsSync),
        `Unresolved import in ${normalized}: ${specifier}`,
      );
      const targetName = relative(source, target).replaceAll(sep, '/');
      if (normalized.includes('/domain/'))
        assert.ok(
          !/\/(presentation|application|infrastructure)\//.test(targetName),
          `Domain depends on an outer layer: ${normalized}`,
        );
      if (/^modules\/[^/]+\/application\//.test(normalized))
        assert.ok(
          !/\/(infrastructure|presentation)\//.test(targetName),
          `Application imports implementation: ${normalized}`,
        );
    }
    if (normalized.includes('/domain/'))
      assert.ok(
        !/^(react|next|node:fs|pg|prisma)(\/|$)/.test(specifier),
        `Domain imports runtime technology: ${normalized}`,
      );
  }
  if (normalized.includes('/presentation/') && !normalized.endsWith('/study-provider.tsx')) {
    assert.ok(
      !/\bfetch\s*\(|\blocalStorage\b|node:fs/.test(text),
      `Presentation bypasses application services: ${normalized}`,
    );
  }
}
console.log(`Architecture check passed: ${modules.length} modules, ${files.length} source files.`);
