import { normalize } from '../../../shared/domain/study-core.js';
import type { Source } from '../../../shared/domain/models';
import type { SourceRepository } from '../domain/source-repository';

export interface SearchHit {
  id: string;
  file: string;
  page: number;
  text: string;
}
export function createSourceService(repository: SourceRepository) {
  return {
    getPageDocument: (id: string, signal?: AbortSignal) => repository.findById(id, signal),
    async search(sources: Source[], query: string, signal?: AbortSignal): Promise<SearchHit[]> {
      const needle = normalize(query.trim());
      if (!needle) return [];
      const docs = await Promise.all(
        sources.map((source) => repository.findById(source.id, signal)),
      );
      const hits: SearchHit[] = [];
      for (const doc of docs)
        for (const page of doc.pages) {
          const index = normalize(page.text).indexOf(needle);
          if (index >= 0)
            hits.push({
              id: doc.id,
              file: doc.file,
              page: page.number,
              text: page.text.slice(Math.max(0, index - 55), index + 180).replace(/\s+/g, ' '),
            });
        }
      return hits;
    },
  };
}
