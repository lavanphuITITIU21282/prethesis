import { authentication } from '@/app/_server/auth.mjs';
import { createGoogleAuthHandler } from '@/app/_server/google-auth-http.mjs';
import { exchangeGoogleCode } from '@/modules/identity/infrastructure/google-oauth.mjs';

const handler = createGoogleAuthHandler(authentication, exchangeGoogleCode);
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ step: string }> };
export async function GET(request: Request, context: Context) {
  return handler(request, (await context.params).step);
}
export const POST = GET;
