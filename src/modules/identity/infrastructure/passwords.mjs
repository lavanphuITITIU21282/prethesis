import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const dummy = 'scrypt1$' + '0'.repeat(32) + '$' + '0'.repeat(128);
const options = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
export const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
export const sessionToken = () => randomBytes(32).toString('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, options);
  return `scrypt1$${salt}$${key.toString('hex')}`;
}
export async function verifyPassword(password, encoded = dummy) {
  if (!/^scrypt1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(encoded)) encoded = dummy;
  const [, salt, expected] = encoded.split('$');
  const actual = await derive(password, salt, 64, options);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
