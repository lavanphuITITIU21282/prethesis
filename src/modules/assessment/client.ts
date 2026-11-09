import { createStudyApiService } from './application/study-api-service';
import { createHttpStudyApi } from './infrastructure/http-study-api';

export const studyApiService = createStudyApiService(createHttpStudyApi());
