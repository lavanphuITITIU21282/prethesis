// getRandomValues also works on HTTP LAN origins; randomUUID requires a secure context.
// These IDs distinguish cache writers, never authenticate a user or authorize a request.
export function createClientId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
