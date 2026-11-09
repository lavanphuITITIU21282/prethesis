import 'server-only';
import { database } from './database.mjs';
import { createAuthentication } from '../../modules/identity/server.mjs';
import { cookieToken } from './auth-http.mjs';
const key = Symbol.for('tram-hoc.authentication');
export const authentication = (globalThis[key] ??= createAuthentication(database));
export async function getPrincipal(request) {
  const session = await authentication.session(cookieToken(request));
  return session ? { userId: session.user_id } : null;
}
