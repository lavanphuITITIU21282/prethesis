export function createAuthRepository(database) {
  return {
    async register(username, name, hash) {
      return (
        await database.query('SELECT identity.auth_register($1,$2,$3) AS id', [
          username,
          name,
          hash,
        ])
      ).rows[0].id;
    },
    async credentials(username) {
      return (await database.query('SELECT * FROM identity.auth_credentials($1)', [username]))
        .rows[0];
    },
    async session(hash) {
      return (
        (await database.query('SELECT * FROM identity.auth_session($1)', [hash])).rows[0] || null
      );
    },
    async start(userId, hash, previous) {
      await database.query('SELECT identity.auth_start_session($1,$2,$3)', [
        userId,
        hash,
        previous,
      ]);
    },
    async startGoogle(subject, name, hash, previous) {
      await database.query('SELECT identity.auth_google_session($1,$2,$3,$4)', [
        subject,
        name,
        hash,
        previous,
      ]);
    },
    async end(hash) {
      await database.query('SELECT identity.auth_end_session($1)', [hash]);
    },
    async allow(key, seconds, max) {
      return (
        await database.query('SELECT identity.auth_throttle($1,$2,$3) AS allowed', [
          key,
          seconds,
          max,
        ])
      ).rows[0].allowed;
    },
  };
}
