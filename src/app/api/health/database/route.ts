import { database } from '@/app/_server/database.mjs';
import { createDatabaseHealth } from '@/app/_server/database-health.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = createDatabaseHealth(database);
