export interface HashGateway {
  hash(text: string, signal?: AbortSignal): Promise<{ hex: string }>;
}
