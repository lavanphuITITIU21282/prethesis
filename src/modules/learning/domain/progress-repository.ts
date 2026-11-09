/** Persistence port; validation and recovery policy belong to the application layer. */
export interface ProgressRepository {
  readRaw(): string | null;
  writeRaw(value: string): void;
  preserveRecovery(value: string): void;
}
