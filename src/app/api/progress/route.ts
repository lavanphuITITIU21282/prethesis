import { database } from '@/app/_server/database.mjs';
import { getPrincipal } from '@/app/_server/auth.mjs';
import { createLearningServer } from '@/modules/learning/server';
import { course } from '@/modules/content/server.mjs';
import { createProgressHandler } from '@/app/_server/progress-http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = createProgressHandler(createLearningServer(database, course), getPrincipal);
export const PUT = GET;
