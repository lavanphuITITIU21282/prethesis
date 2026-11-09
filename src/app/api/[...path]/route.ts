import { handleApi } from '@/app/_server/http-controller.mjs';

// Keep provider credentials and cryptographic operations on the Node.js runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = handleApi;
export const POST = handleApi;
export const HEAD = handleApi;
