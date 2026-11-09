import { STORAGE_KEY } from '../../../shared/domain/study-core.js';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

import type { ProgressRepository } from '../domain/progress-repository';

export function createBrowserProgressRepository(storage: () => StorageLike): ProgressRepository {
  // Resolve browser storage lazily so SSR and revoked storage access are handled safely.
  return {
    readRaw: () => storage().getItem(STORAGE_KEY),
    writeRaw: (value) => storage().setItem(STORAGE_KEY, value),
    preserveRecovery: (value) => storage().setItem(`${STORAGE_KEY}-recovery`, value),
  };
}
