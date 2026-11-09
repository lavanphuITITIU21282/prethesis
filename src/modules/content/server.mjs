import { createFileCourseRepository } from './infrastructure/file-course-repository.mjs';

const repository = createFileCourseRepository();
export const course = repository.getCourse();
export const sources = repository.getSources();
// Present only display metadata to the client, keeping authoring prompts out of page payloads.
export const lessonArt = Object.fromEntries(
  repository
    .getLessonArtwork()
    .map((work) => [work.id, { name: work.name, story: work.story, assetStem: work.assetStem }]),
);
