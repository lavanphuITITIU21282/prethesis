import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, unlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import pg from 'pg';
import { createAuthentication } from '../../src/modules/identity/server.mjs';
import { tokenHash, sessionToken } from '../../src/modules/identity/infrastructure/passwords.mjs';
import { createProgressHandler } from '../../src/app/_server/progress-http';
import { cookieToken } from '../../src/app/_server/auth-http.mjs';
import { createAuthHandler } from '../../src/app/_server/auth-http.mjs';
import { localDatabaseConfig } from '../../src/shared/infrastructure/database-config.mjs';
import { createDatabase } from '../../src/shared/infrastructure/postgres.mjs';
import { migrate } from '../../scripts/database/migrations.mjs';
import { seedCatalog, COURSE_ID } from '../../scripts/database/catalog.mjs';
import {
  createPostgresProgressRepository,
  ProgressConflictError,
} from '../../src/modules/learning/infrastructure/postgres-progress-repository';
import { createUserProgressService } from '../../src/modules/learning/application/user-progress-service';
import {
  buildQuestions,
  createQuizSession,
  defaultQuizFilters,
  freshState,
} from '../../src/shared/domain/study-core.js';
import type { Course } from '../../src/shared/domain/models';

const root = process.cwd();
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));

test('PostgreSQL foundation: migrations, ownership, constraints, concurrency and v1 compatibility', async (context) => {
  const adminConfig = localDatabaseConfig(root, 'admin');
  const databaseName = 'tram_hoc_test_' + randomUUID().replaceAll('-', '');
  const appConfig = { ...localDatabaseConfig(root, 'app'), database: databaseName };
  const control = new pg.Client(adminConfig);
  const owner = new pg.Client({ ...adminConfig, database: databaseName });
  const db = createDatabase(() => ({ ...appConfig, max: 1 }));
  const migrations = resolve(root, 'database/migrations');
  let created = false;
  try {
    await control.connect();
    // Only this freshly generated test database may be dropped by the test cleanup.
    await control.query(`CREATE DATABASE ${pg.escapeIdentifier(databaseName)}`);
    created = true;
    await owner.connect();
    await context.test('migrations and seed are repeatable without duplicate rows', async () => {
      const first = await migrate(owner, migrations);
      assert.equal(first.applied, first.total);
      assert.ok(first.total >= 2);
      assert.equal((await migrate(owner, migrations)).applied, 0);
      assert.equal((await seedCatalog(owner, course)).created, true);
      assert.equal((await seedCatalog(owner, course)).created, false);
      const counts = await owner.query(`SELECT
        (SELECT count(*)::int FROM content.chapters) AS chapters,
        (SELECT count(*)::int FROM content.lessons) AS lessons,
        (SELECT count(*)::int FROM content.sections) AS sections,
        (SELECT count(*)::int FROM content.concepts) AS concepts,
        (SELECT count(*)::int FROM content.questions) AS questions`);
      assert.deepEqual(counts.rows[0], {
        chapters: 5,
        lessons: 25,
        sections: 75,
        concepts: 254,
        questions: 899,
      });
      await assert.rejects(
        seedCatalog(owner, { ...course, title: 'Changed release' }),
        /IMMUTABLE/,
      );
    });
    await context.test('failed migrations roll back and applied SQL cannot be edited', async () => {
      const directory = mkdtempSync(resolve(tmpdir(), 'tram-hoc-migration-'));
      assert.ok(directory.startsWith(resolve(tmpdir(), 'tram-hoc-migration-')));
      try {
        for (const file of readdirSync(migrations).filter((name) => name.endsWith('.sql')))
          writeFileSync(resolve(directory, file), readFileSync(resolve(migrations, file)));
        writeFileSync(
          resolve(directory, '999_failure.sql'),
          'CREATE TABLE content.rollback_probe(id int); SELECT no_such_function();',
        );
        await assert.rejects(migrate(owner, directory));
        assert.equal(
          (await owner.query("SELECT to_regclass('content.rollback_probe') AS probe")).rows[0]
            .probe,
          null,
        );
        const late = resolve(directory, '000_late.sql');
        writeFileSync(late, 'SELECT 1');
        await assert.rejects(migrate(owner, directory), /MIGRATION_OUT_OF_ORDER/);
        unlinkSync(late);
        const duplicate = resolve(directory, '001_duplicate.sql');
        writeFileSync(duplicate, 'SELECT 1');
        await assert.rejects(migrate(owner, directory), /DUPLICATE_MIGRATION_VERSION/);
        unlinkSync(duplicate);
        writeFileSync(resolve(directory, '001_foundation.sql'), '-- modified');
        await assert.rejects(migrate(owner, directory), /APPLIED_MIGRATION_CHANGED/);
      } finally {
        assert.ok(directory.startsWith(resolve(tmpdir(), 'tram-hoc-migration-')));
        rmSync(directory, { recursive: true });
      }
    });
    await context.test(
      'Google subjects create one account and use normal revocable sessions',
      async () => {
        const auth = createAuthentication(db);
        const secondDb = createDatabase(() => ({ ...appConfig, max: 1 }));
        try {
          const identity = { subject: 'fixture-google-' + randomUUID(), name: 'Bạn học Google' };
          const [first, second] = await Promise.all([
            auth.google(identity),
            createAuthentication(secondDb).google(identity),
          ]);
          const firstSession = await auth.session(first);
          assert.ok(firstSession);
          assert.equal(firstSession.user_id, (await auth.session(second)).user_id);
          const count = await owner.query(
            'SELECT count(*)::int AS total FROM identity.users WHERE display_name=$1',
            [identity.name],
          );
          assert.equal(count.rows[0].total, 1);
          const other = await auth.google({ ...identity, subject: identity.subject + '-other' });
          assert.notEqual((await auth.session(other)).user_id, firstSession.user_id);
          const rotated = await auth.google(identity, first);
          assert.equal(await auth.session(first), null);
          assert.equal((await auth.session(rotated)).user_id, firstSession.user_id);
          await auth.logout(rotated);
          assert.equal(await auth.session(rotated), null);
          await owner.query('UPDATE identity.users SET disabled_at=now() WHERE id=$1', [
            firstSession.user_id,
          ]);
          await assert.rejects(auth.google(identity), { code: '28000' });
          await assert.rejects(db.query('SELECT * FROM identity.external_identities'), {
            code: '42501',
          });
        } finally {
          await secondDb.close();
        }
      },
    );
    await context.test(
      'password authentication, cookie security, session revocation and expiry',
      async () => {
        const auth = createAuthentication(db);
        const handler = createAuthHandler(auth, {});
        const username = 'user_' + randomUUID().replaceAll('-', '').slice(0, 16);
        const input = { username, name: 'Người học', password: 'A long private passphrase 2026' };
        const request = (action: string, body: unknown, origin = 'http://localhost') =>
          new Request('http://localhost/api/auth/' + action, {
            method: 'POST',
            headers: { Origin: origin, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        assert.equal(
          (await handler(request('register', input, 'https://other.invalid'), 'register')).status,
          403,
        );
        const registered = await handler(request('register', input), 'register');
        assert.equal(registered.status, 200);
        const cookie = registered.headers.get('set-cookie')!;
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /SameSite=Lax/);
        const token = cookie.split(';')[0].split('=')[1];
        const session = await auth.session(token);
        assert.ok(session);
        const credentials = (
          await owner.query(
            'SELECT password_hash FROM identity.password_credentials WHERE username=$1',
            [username],
          )
        ).rows[0];
        assert.match(credentials.password_hash, /^scrypt1\$/);
        assert.ok(!credentials.password_hash.includes(input.password));
        assert.equal(
          (
            await owner.query('SELECT token_hash FROM identity.sessions WHERE user_id=$1', [
              session.user_id,
            ])
          ).rows[0].token_hash,
          tokenHash(token),
        );
        await assert.rejects(
          auth.login({ ...input, password: 'incorrect password' }),
          /INVALID_CREDENTIALS/,
        );
        const rotated = await auth.login(input, token);
        assert.equal(await auth.session(token), null);
        await auth.logout(rotated);
        assert.equal(await auth.session(rotated), null);
        assert.equal(
          (await handler(new Request('http://localhost/api/auth/me'), 'me')).status,
          401,
        );
        const expiring = await auth.login(input);
        await owner.query(
          "UPDATE identity.sessions SET created_at=now()-interval '2 days',expires_at=now()-interval '1 day' WHERE token_hash=$1",
          [tokenHash(expiring)],
        );
        assert.equal(await auth.session(expiring), null);
        await owner.query('UPDATE identity.users SET disabled_at=now() WHERE id=$1', [
          session.user_id,
        ]);
        await assert.rejects(auth.login(input), /INVALID_CREDENTIALS/);
        await assert.rejects(db.query('SELECT * FROM identity.password_credentials'));
        await assert.rejects(db.query('SELECT * FROM identity.sessions'));
        const key = 'test:' + randomUUID();
        const limits = await Promise.all(
          [1, 2, 3].map(() => db.query('SELECT identity.auth_throttle($1,60,2) AS allowed', [key])),
        );
        assert.equal(limits.filter((result) => result.rows[0].allowed).length, 2);
      },
    );
    const alice = randomUUID(),
      bob = randomUUID();
    await owner.query('INSERT INTO identity.users(id,display_name) VALUES ($1,$2),($3,$4)', [
      alice,
      'Alice',
      bob,
      'Bob',
    ]);
    const repository = createPostgresProgressRepository(db, COURSE_ID);
    const service = createUserProgressService(repository, course);
    await context.test(
      'v1 notes, quiz order, drafts, history and reviews survive a database round trip',
      async () => {
        const state = freshState();
        state.notes.cia = 'Ghi chú tiếng Việt, Confidentiality';
        state.drafts.cia = 'A sufficiently detailed saved draft.';
        state.read.cia = [0, 1];
        state.quiz = createQuizSession(buildQuestions(course).slice(0, 3), defaultQuizFilters());
        state.quizSessions = state.quiz ? [structuredClone(state.quiz)] : [];
        state.history = [{ date: Date.now(), total: 3, correct: 2 }];
        state.reviews['cia-t1'] = {
          level: 1,
          seen: 1,
          correct: 1,
          due: Date.now() + 60000,
          updated: Date.now(),
        };
        const saved = await service.save({ userId: alice }, state, 0);
        assert.equal(saved.revision, 1);
        const restored = await service.find({ userId: alice });
        assert.equal(restored?.state.notes.cia, state.notes.cia);
        assert.equal(restored?.state.drafts.cia, state.drafts.cia);
        assert.deepEqual(restored?.state.quiz?.ids, state.quiz?.ids);
        assert.deepEqual(restored?.state.quiz?.orders, state.quiz?.orders);
        assert.deepEqual(restored?.state.history, state.history);
        assert.deepEqual(restored?.state.reviews, state.reviews);
        assert.equal(await service.find({ userId: bob }), null);
        assert.throws(() => service.find(null), /Authentication/);
        assert.throws(() => service.save({ userId: bob }, { version: 999 }, 0));
      },
    );
    await context.test(
      'concurrent writes with the same revision have exactly one winner',
      async () => {
        const state = (await repository.findForUser(alice))!.state;
        const parallel = createDatabase(() => ({ ...appConfig, max: 2 }));
        const concurrent = createPostgresProgressRepository(parallel, COURSE_ID);
        let results;
        try {
          results = await Promise.allSettled([
            concurrent.saveForUser(alice, state, 1),
            concurrent.saveForUser(alice, state, 1),
          ]);
        } finally {
          await parallel.close();
        }
        assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
        const failed = results.find((result) => result.status === 'rejected');
        assert.ok(failed?.status === 'rejected' && failed.reason instanceof ProgressConflictError);
        assert.equal((await repository.findForUser(alice))!.revision, 2);
      },
    );
    await context.test(
      'RLS blocks missing context, cross-user reads/writes and pool context leaks',
      async () => {
        assert.equal((await db.query('SELECT * FROM learning.user_progress')).rowCount, 0);
        await assert.rejects(
          db.query('CREATE TABLE content.forbidden_probe(id int)'),
          (error) => (error as { code: string }).code === '42501',
        );
        await assert.rejects(
          db.query("UPDATE content.lessons SET payload='{}' WHERE false"),
          (error) => (error as { code: string }).code === '42501',
        );
        await db.withUser(bob, async (client) => {
          assert.equal(
            (await client.query('SELECT * FROM learning.user_progress WHERE user_id=$1', [alice]))
              .rowCount,
            0,
          );
        });
        await assert.rejects(
          db.withUser(bob, (client) =>
            client.query(
              'INSERT INTO learning.user_progress(user_id,course_id,content_version,revision,state) VALUES ($1,$2,1,1,$3)',
              [alice, COURSE_ID, JSON.stringify(freshState())],
            ),
          ),
          (error) => (error as { code: string }).code === '42501',
        );
        await assert.rejects(
          db.withUser(alice, async (client) => {
            await client.query('UPDATE identity.users SET display_name=$1', ['Forbidden']);
          }),
        );
        assert.equal((await db.query('SELECT * FROM learning.user_progress')).rowCount, 0);
        assert.equal((await repository.findForUser(alice))!.revision, 2);
      },
    );
    await context.test(
      'progress HTTP uses real sessions, rejects stale account headers and preserves other owners',
      async () => {
        const tokenA = sessionToken(),
          tokenB = sessionToken();
        await db.query('SELECT identity.auth_start_session($1,$2,$3)', [
          alice,
          tokenHash(tokenA),
          '',
        ]);
        await db.query('SELECT identity.auth_start_session($1,$2,$3)', [
          bob,
          tokenHash(tokenB),
          '',
        ]);
        const auth = createAuthentication(db);
        const handler = createProgressHandler(service, async (request) => {
          const session = await auth.session(cookieToken(request));
          return session ? { userId: session.user_id } : null;
        });
        const req = (token: string, account: string, body?: unknown) =>
          new Request('http://localhost/api/progress', {
            method: body === undefined ? 'GET' : 'PUT',
            headers: {
              Cookie: 'tram_hoc_session=' + token,
              'X-Study-Account': account,
              Origin: 'http://localhost',
              'Content-Type': 'application/json',
            },
            body: body === undefined ? undefined : JSON.stringify(body),
          });
        assert.equal((await handler(req('', alice))).status, 401);
        const original = (await repository.findForUser(alice))!;
        const state = structuredClone(original.state);
        state.notes.cia = 'Session A owns this note';
        const saved = await handler(
          req(tokenA, alice, { state, revision: original.revision, userId: bob }),
        );
        assert.equal(saved.status, 200);
        assert.equal((await repository.findForUser(alice))!.state.notes.cia, state.notes.cia);
        assert.equal(await repository.findForUser(bob), null);
        assert.equal((await handler(req(tokenB, alice, { state, revision: 0 }))).status, 409);
        const other = await handler(req(tokenB, bob));
        assert.equal((await other.json()).progress, null);
        assert.equal(
          (await handler(req(tokenA, alice, { state, revision: original.revision }))).status,
          409,
        );
        await auth.logout(tokenA);
        assert.equal((await handler(req(tokenA, alice))).status, 401);
      },
    );
    await context.test(
      'foreign keys, scores and JSON constraints reject inconsistent records',
      async () => {
        const attempt = randomUUID();
        await owner.query(
          'INSERT INTO assessment.attempts(user_id,id,course_id,content_version,session) VALUES ($1,$2,$3,1,$4)',
          [alice, attempt, COURSE_ID, '{}'],
        );
        const question = buildQuestions(course)[0].id;
        await assert.rejects(
          owner.query(
            "INSERT INTO assessment.grades(user_id,attempt_id,course_id,content_version,question_id,method,score) VALUES ($1,$2,$3,1,$4,'self',5)",
            [bob, attempt, COURSE_ID, question],
          ),
          (error) => (error as { code: string }).code === '23503',
        );
        await assert.rejects(
          owner.query(
            "INSERT INTO assessment.grades(user_id,attempt_id,course_id,content_version,question_id,method,score) VALUES ($1,$2,$3,1,$4,'self',11)",
            [alice, attempt, COURSE_ID, question],
          ),
          (error) => (error as { code: string }).code === '23514',
        );
        await assert.rejects(
          owner.query('UPDATE learning.user_progress SET state=$1 WHERE user_id=$2', [
            '{"version":1}',
            alice,
          ]),
          (error) => (error as { code: string }).code === '23514',
        );
        await assert.rejects(
          owner.query("UPDATE content.lessons SET payload='{}' WHERE id='cia'"),
          (error) => (error as { code: string }).code === '23514',
        );
        const unsafe = createDatabase(() => ({ ...adminConfig, database: databaseName }));
        try {
          await assert.rejects(unsafe.query('SELECT 1'), /UNSAFE_DATABASE_ROLE/);
        } finally {
          await unsafe.close();
        }
      },
    );
  } finally {
    await db.close();
    await owner.end();
    if (!/^tram_hoc_test_[a-f0-9]{32}$/.test(databaseName))
      throw new Error('Unsafe test cleanup target.');
    try {
      if (created) await control.query(`DROP DATABASE ${pg.escapeIdentifier(databaseName)}`);
    } finally {
      await control.end();
    }
  }
});
