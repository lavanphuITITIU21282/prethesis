import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: [
      'src/modules/assessment/presentation/quiz-{run,setup}.tsx',
      'src/modules/content/presentation/reader.tsx',
      'src/modules/learning/presentation/home.tsx',
      'src/shared/ui/primitives.tsx',
    ],
    // These local artworks already have authored responsive variants; preserve their picture/srcset markup.
    rules: { '@next/next/no-img-element': 'off' },
  },
  // Let Prettier own formatting while ESLint checks code and framework rules.
  prettier,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'next-env.d.ts',
    'public/**',
    'resources/**',
    'logs/**',
    'coverage/**',
    'tmp/**',
  ]),
]);
