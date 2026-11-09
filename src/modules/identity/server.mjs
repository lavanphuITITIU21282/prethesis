import { createAuthRepository } from './infrastructure/postgres-auth-repository.mjs';
import { createAuthService } from './application/auth-service.mjs';
import * as passwords from './infrastructure/passwords.mjs';
export const createAuthentication = (database) =>
  createAuthService(createAuthRepository(database), passwords);
