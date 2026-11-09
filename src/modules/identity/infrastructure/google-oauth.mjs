import { OAuth2Client } from 'google-auth-library';

const verifier = new OAuth2Client({ transporterOptions: { timeout: 10_000 } });

export async function exchangeGoogleCode(config, code, codeVerifier) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
    }),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('GOOGLE_EXCHANGE_FAILED');
  const { id_token: idToken } = await response.json();
  const ticket = await verifier.verifyIdToken({ idToken, audience: config.clientId });
  return ticket.getPayload();
}
