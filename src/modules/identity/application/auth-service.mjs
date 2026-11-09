export class AuthError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
export function createAuthService(repository, crypto) {
  let active = 0;
  async function authenticate(kind, input, previous = '') {
    const username = typeof input?.username === 'string' ? input.username.trim().toLowerCase() : '';
    const password = input?.password;
    const name = typeof input?.name === 'string' ? input.name.trim() : '';
    if (
      !/^[a-z0-9_]{3,32}$/.test(username) ||
      typeof password !== 'string' ||
      password.length < 1 ||
      password.length > 128 ||
      (kind === 'register' && (password.length < 15 || !name || name.length > 100))
    )
      throw new AuthError('INVALID_INPUT', 400);
    if (active >= 2) throw new AuthError('TRY_LATER', 429);
    active++;
    try {
      if (
        !(await repository.allow('auth:global', 60, 60)) ||
        !(await repository.allow('auth:' + crypto.tokenHash(username), 900, 10)) ||
        (kind === 'register' && !(await repository.allow('auth:registration', 3600, 15)))
      )
        throw new AuthError('TRY_LATER', 429);
      let id;
      if (kind === 'register') {
        try {
          id = await repository.register(username, name, await crypto.hashPassword(password));
        } catch (error) {
          if (error.code === '23505') throw new AuthError('REGISTRATION_FAILED', 400);
          throw error;
        }
      } else {
        const credentials = await repository.credentials(username);
        const valid = await crypto.verifyPassword(password, credentials?.password_hash);
        if (!valid || !credentials) throw new AuthError('INVALID_CREDENTIALS', 401);
        id = credentials.user_id;
      }
      const token = crypto.sessionToken();
      await repository.start(id, crypto.tokenHash(token), crypto.tokenHash(previous));
      return token;
    } finally {
      active--;
    }
  }
  return {
    register: (input, previous) => authenticate('register', input, previous),
    login: (input, previous) => authenticate('login', input, previous),
    allowGoogle: () => repository.allow('auth:google', 60, 60),
    async google({ subject, name }, previous = '') {
      const token = crypto.sessionToken();
      await repository.startGoogle(
        subject,
        name,
        crypto.tokenHash(token),
        crypto.tokenHash(previous),
      );
      return token;
    },
    session: (token) =>
      /^[a-f0-9]{64}$/.test(token || '')
        ? repository.session(crypto.tokenHash(token))
        : Promise.resolve(null),
    logout: (token) => repository.end(crypto.tokenHash(token || '')),
  };
}
