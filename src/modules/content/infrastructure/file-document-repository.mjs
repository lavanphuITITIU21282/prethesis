import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

export function createFileDocumentRepository(sources, root = process.cwd()) {
  const directory = resolve(root, 'resources', 'documents');
  return {
    async findById(id) {
      const source = sources.find((item) => item.id === id);
      if (!source) return null;
      const file = resolve(directory, source.file);
      // A manifest entry must still stay inside the dedicated document directory.
      if (!file.startsWith(directory + sep)) return null;
      let info;
      try {
        info = await stat(file);
      } catch {
        return null;
      }
      if (!info.isFile()) return null;
      return {
        source,
        size: info.size,
        openRange: (start, end) => createReadStream(file, { start, end }),
      };
    },
  };
}
