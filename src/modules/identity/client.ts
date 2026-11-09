export interface Account {
  id: string;
  name: string;
}
async function call(action: string, input?: unknown, signal?: AbortSignal) {
  const response = await fetch(`/api/auth/${action}`, {
    method: input === undefined ? 'GET' : 'POST',
    headers: input === undefined ? {} : { 'Content-Type': 'application/json' },
    body: input === undefined ? undefined : JSON.stringify(input),
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Chưa thực hiện được yêu cầu.');
  return result;
}
export const accounts = {
  session: async (signal?: AbortSignal): Promise<Account | null> =>
    (await call('session', undefined, signal)).user,
  login: (input: unknown) => change('login', input),
  register: (input: unknown) => change('register', input),
  logout: () => change('logout', {}),
  async google(): Promise<{ authorizationUrl: string }> {
    return call('google/start', {});
  },
};
async function change(action: string, input: unknown) {
  const result = await call(action, input);
  window.dispatchEvent(new Event('tram-hoc:account-change'));
  return result;
}
