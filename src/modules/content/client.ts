import { createSourceService } from './application/source-service';
import { createHttpSourceRepository } from './infrastructure/http-source-repository';

// The module entry point composes application policy with its HTTP implementation.
export const sourceService = createSourceService(createHttpSourceRepository());
export type { SearchHit } from './application/source-service';
