import { createGradingService } from './application/grading-service.mjs';
import { createGeminiGateway } from './infrastructure/gemini-gateway.mjs';

export { GradingError, gradeSchema, gradingPayload } from './application/grading-service.mjs';

export function createGrader(options = {}) {
  return createGradingService({
    ...options,
    gateway: options.gateway ?? createGeminiGateway({ fetchImpl: options.fetchImpl }),
  });
}

export { loadLocalEnv } from './infrastructure/local-env.mjs';
