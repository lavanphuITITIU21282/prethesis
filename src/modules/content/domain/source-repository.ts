export interface SourceDocument {
  id: string;
  file: string;
  pages: { number: number; text: string }[];
}
export interface SourceRepository {
  findById(id: string, signal?: AbortSignal): Promise<SourceDocument>;
}
