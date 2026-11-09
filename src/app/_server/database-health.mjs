export function createDatabaseHealth(database) {
  return async function GET() {
    try {
      await database.query('SELECT 1');
      return Response.json(
        { ok: true, database: 'postgresql' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    } catch {
      // Health responses never contain SQL, hostnames, role names or driver error messages.
      return Response.json(
        { ok: false, code: 'DATABASE_UNAVAILABLE' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
  };
}
