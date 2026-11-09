import { createHashService } from './application/hash-service';
import { createHttpHashGateway } from './infrastructure/http-hash-gateway';
import { AccountSync } from './application/account-sync';
import { createHttpProgressGateway } from './infrastructure/http-progress-gateway';
import { createBrowserAccountCache } from './infrastructure/browser-account-cache';
import type { Course } from '@/shared/domain/models';

export const hashService = createHashService(createHttpHashGateway());
export const createAccountSync = (course: Course, accountId: string) =>
  new AccountSync(
    course,
    createHttpProgressGateway(accountId),
    createBrowserAccountCache(() => window.localStorage, accountId),
  );
