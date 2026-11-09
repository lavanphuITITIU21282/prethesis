import type { Review } from '../../shared/domain/models';
export function nextReview(previous: Review | undefined, quality: number, now?: number): Review;
