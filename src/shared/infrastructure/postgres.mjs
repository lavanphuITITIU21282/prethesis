import pg from 'pg';

export function createDatabase(getConfig) {
  let pool;
  const verified = new WeakSet();
  function getPool() {
    if (!pool) {
      pool = new pg.Pool({
        max: 5,
        connectionTimeoutMillis: 3000,
        idleTimeoutMillis: 10000,
        statement_timeout: 5000,
        idle_in_transaction_session_timeout: 10000,
        application_name: 'tram-hoc-server',
        ...getConfig(),
      });
      // Idle socket failures must not crash the server or leak connection metadata.
      pool.on('error', () => console.warn('Database idle connection closed.'));
    }
    return pool;
  }
  async function borrow() {
    const client = await getPool().connect();
    try {
      if (!verified.has(client)) {
        const result = await client.query(
          `SELECT rolsuper OR rolbypassrls OR rolcreatedb OR rolcreaterole AS unsafe
           FROM pg_roles WHERE rolname = current_user`,
        );
        if (result.rows[0]?.unsafe !== false) throw new Error('UNSAFE_DATABASE_ROLE');
        verified.add(client);
      }
      return client;
    } catch (error) {
      client.release(true);
      throw error;
    }
  }
  return {
    async query(text, values) {
      const client = await borrow();
      try {
        return await client.query(text, values);
      } finally {
        client.release();
      }
    },
    async withUser(userId, work) {
      if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(userId || '')) {
        throw new Error('AUTHENTICATED_USER_REQUIRED');
      }
      const client = await borrow();
      let discard = false;
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
        const result = await work(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        try {
          await client.query('ROLLBACK');
        } catch {
          discard = true;
        }
        throw error;
      } finally {
        client.release(discard);
      }
    },
    async close() {
      const previous = pool;
      pool = undefined;
      await previous?.end();
    },
  };
}
