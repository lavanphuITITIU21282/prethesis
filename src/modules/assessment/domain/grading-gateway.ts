export interface GradingGateway {
  gradingStatus(signal?: AbortSignal): Promise<{ configured: boolean }>;
  grade(lessonId: string, answer: string, signal?: AbortSignal): Promise<unknown>;
}
