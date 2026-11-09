import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AccountSync } from '../src/modules/learning/application/account-sync';
import { createBrowserAccountCache } from '../src/modules/learning/infrastructure/browser-account-cache';
import { freshState } from '../src/shared/domain/study-core.js';
import type { Course } from '../src/shared/domain/models';
import type {
  AccountProgressCache,
  AccountProgressGateway,
  ProgressRecord,
} from '../src/modules/learning/domain/account-progress';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
test('HTTP LAN compatibility does not depend on randomUUID; recovery slots stay scoped and bounded per writer', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');
  Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
  const values = new Map<string, string>();
  const storage = {
    get length() {
      return values.size;
    },
    key: (index: number) => [...values.keys()][index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    clear: () => values.clear(),
  } as Storage;
  const a = createBrowserAccountCache(() => storage, 'alice'),
    b = createBrowserAccountCache(() => storage, 'bob');
  const sync = new AccountSync(course, server().port, a);
  try {
    await sync.start();
    a.preserve('first', 'writer');
    a.preserve('newest', 'writer');
    b.preserve('bob-only');
    assert.equal(a.recoveries!().length, 1);
    assert.equal(a.recoveries!()[0].raw, 'newest');
    assert.equal(b.recoveries!()[0].raw, 'bob-only');
  } finally {
    sync.stop();
    if (descriptor) Object.defineProperty(crypto, 'randomUUID', descriptor);
    else Reflect.deleteProperty(crypto, 'randomUUID');
  }
});
const problem = (code: string) => Object.assign(new Error(code), { code });
function cache(raw: string | null = null, guest: string | null = null) {
  const copies: string[] = [];
  const port: AccountProgressCache = {
    read: () => raw,
    write: (value) => {
      raw = value;
    },
    preserve: (value) => {
      copies.push(value);
    },
    readGuest: () => guest,
  };
  return { port, copies, raw: () => raw, guest: () => guest };
}
function server(record: ProgressRecord | null = null) {
  let writes = 0;
  const port: AccountProgressGateway = {
    load: async () => structuredClone(record),
    save: async (state, revision) => {
      if ((record?.revision || 0) !== revision) throw problem('PROGRESS_CONFLICT');
      writes++;
      record = { state: structuredClone(state), revision: revision + 1 };
      return structuredClone(record);
    },
  };
  return {
    port,
    record: () => record,
    writes: () => writes,
    set: (next: ProgressRecord) => {
      record = next;
    },
  };
}
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

test('guest data is never imported automatically; confirmed import retains the guest and excludes timers', async () => {
  const guest = freshState();
  guest.notes.cia = 'Guest note';
  guest.timer = { running: true, remaining: 60, duration: 5, endsAt: Date.now() + 60000 };
  const local = cache(null, JSON.stringify(guest)),
    remote = server(),
    sync = new AccountSync(course, remote.port, local.port);
  try {
    await sync.start();
    assert.equal(sync.getSnapshot().state.notes.cia, undefined);
    assert.equal(remote.writes(), 0);
    const preview = sync.previewGuest()!;
    assert.equal(preview.timer, null);
    sync.replace(preview);
    await sync.flush();
    assert.equal(remote.record()!.state.notes.cia, 'Guest note');
    assert.equal(remote.record()!.state.timer, null);
    assert.equal(local.guest(), JSON.stringify(guest));
    sync.update((draft) => {
      draft.timer = { running: true, remaining: 60, duration: 5, endsAt: Date.now() + 60000 };
    });
    await sync.flush();
    assert.equal(remote.writes(), 1);
  } finally {
    sync.stop();
  }
});
test('a second device loads saved account state without sharing its local cache', async () => {
  const remote = server(),
    first = new AccountSync(course, remote.port, cache().port),
    second = new AccountSync(course, remote.port, cache().port);
  try {
    await first.start();
    first.update((draft) => {
      draft.notes.cia = 'Account note';
    });
    await first.flush();
    await second.start();
    assert.equal(second.getSnapshot().state.notes.cia, 'Account note');
    assert.equal(second.getSnapshot().revision, 1);
  } finally {
    first.stop();
    second.stop();
  }
});
test('offline pending drafts survive remount and resume only against a matching revision', async () => {
  const state = freshState();
  state.notes.cia = 'Offline draft';
  const local = cache(JSON.stringify({ version: 1, revision: 1, dirty: true, state }));
  const remote = server({ revision: 1, state: freshState() });
  const sync = new AccountSync(
    course,
    {
      ...remote.port,
      save: async () => {
        throw problem('UNAVAILABLE');
      },
    },
    local.port,
  );
  try {
    await sync.start();
    await sync.flush();
    assert.equal(sync.getSnapshot().status, 'offline');
    assert.equal(JSON.parse(local.raw()!).state.notes.cia, 'Offline draft');
  } finally {
    sync.stop();
  }
  const resumed = new AccountSync(course, remote.port, local.port);
  try {
    await resumed.start();
    await resumed.flush();
    assert.equal(remote.record()!.state.notes.cia, 'Offline draft');
    assert.equal(resumed.getSnapshot().dirty, false);
  } finally {
    resumed.stop();
  }
});
test('revision conflicts keep drafts and explicit resolution refuses a changed preview', async () => {
  const state = freshState();
  state.notes.cia = 'My draft';
  const other = freshState();
  other.notes.cia = 'Other device';
  const local = cache(JSON.stringify({ version: 1, revision: 1, dirty: true, state })),
    remote = server({ revision: 2, state: other }),
    sync = new AccountSync(course, remote.port, local.port);
  try {
    await sync.start();
    assert.equal(sync.getSnapshot().status, 'conflict');
    await sync.flush();
    assert.equal(remote.writes(), 0);
    remote.set({ revision: 3, state: other });
    await sync.resolve(false, 2);
    assert.equal(sync.getSnapshot().state.notes.cia, 'My draft');
    await sync.resolve(true, 3);
    assert.equal(remote.record()!.revision, 4);
    assert.equal(remote.record()!.state.notes.cia, 'My draft');
    assert.ok(local.copies.some((raw) => JSON.parse(raw).state.notes.cia === 'Other device'));
  } finally {
    sync.stop();
  }
});
test('a lost acknowledgement reconciles an identical server snapshot without a second write', async () => {
  const remote = server(),
    local = cache();
  let lose = true;
  const sync = new AccountSync(
    course,
    {
      ...remote.port,
      save: async (state, rev) => {
        const record = await remote.port.save(state, rev);
        if (lose) {
          lose = false;
          throw problem('UNAVAILABLE');
        }
        return record;
      },
    },
    local.port,
  );
  try {
    await sync.start();
    sync.update((draft) => {
      draft.notes.cia = 'Already committed';
    });
    await sync.flush();
    assert.equal(sync.getSnapshot().status, 'offline');
    await sync.retry();
    assert.equal(sync.getSnapshot().dirty, false);
    assert.equal(sync.getSnapshot().revision, 1);
    assert.equal(remote.writes(), 1);
  } finally {
    sync.stop();
  }
});
test('unrecoverable corrupt cache blocks writes and disposed controllers ignore late edits', async () => {
  const local = cache('original corrupt bytes');
  let reads = 0;
  const blocked = new AccountSync(
    course,
    {
      load: async () => {
        reads++;
        return null;
      },
      save: async () => {
        throw new Error('must not save');
      },
    },
    {
      ...local.port,
      preserve: () => {
        throw new Error('quota');
      },
    },
  );
  try {
    await blocked.start();
    blocked.update((draft) => {
      draft.notes.cia = 'Rejected';
    });
    assert.equal(blocked.getSnapshot().status, 'blocked');
    assert.equal(reads, 0);
    assert.equal(local.raw(), 'original corrupt bytes');
  } finally {
    blocked.stop();
  }
  const ordinary = cache(),
    sync = new AccountSync(course, server().port, ordinary.port);
  await sync.start();
  sync.stop();
  const before = ordinary.raw();
  sync.update((draft) => {
    draft.notes.cia = 'Late callback';
  });
  assert.equal(ordinary.raw(), before);
});
test('edits made during an in-flight save survive its acknowledgement and are saved next', async () => {
  const remote = server(),
    waiting = deferred<ProgressRecord>();
  let first = true;
  const sync = new AccountSync(
    course,
    {
      ...remote.port,
      save: async (state, rev) => {
        const record = await remote.port.save(state, rev);
        if (first) {
          first = false;
          return waiting.promise;
        }
        return record;
      },
    },
    cache().port,
  );
  try {
    await sync.start();
    sync.update((draft) => {
      draft.notes.cia = 'First';
    });
    const saving = sync.flush();
    await Promise.resolve();
    sync.update((draft) => {
      draft.notes.cia = 'Second';
    });
    waiting.resolve({ revision: 1, state: { ...freshState(), notes: { cia: 'First' } } });
    await saving;
    assert.equal(sync.getSnapshot().state.notes.cia, 'Second');
    assert.equal(sync.getSnapshot().dirty, true);
    await sync.flush();
    assert.equal(remote.record()!.state.notes.cia, 'Second');
    assert.equal(remote.record()!.revision, 2);
  } finally {
    sync.stop();
  }
});
test('a late server read cannot replace edits acknowledged by a newer save', async () => {
  const initial = { revision: 1, state: freshState() },
    remote = server(initial),
    waiting = deferred<ProgressRecord | null>();
  const local = cache(
    JSON.stringify({ version: 1, revision: 1, dirty: false, state: initial.state }),
  );
  const sync = new AccountSync(course, { ...remote.port, load: () => waiting.promise }, local.port);
  try {
    const started = sync.start();
    sync.update((draft) => {
      draft.notes.cia = 'New';
    });
    await sync.flush();
    waiting.resolve(initial);
    await started;
    assert.equal(sync.getSnapshot().state.notes.cia, 'New');
    assert.equal(sync.getSnapshot().revision, 2);
  } finally {
    sync.stop();
  }
});
test('session changes suspend writes and keep the old account draft', async () => {
  const local = cache(),
    remote = server(),
    sync = new AccountSync(course, remote.port, local.port);
  try {
    await sync.start();
    sync.update((draft) => {
      draft.notes.cia = 'Private A';
    });
    sync.lockSession();
    await sync.flush();
    assert.equal(remote.writes(), 0);
    assert.equal(sync.getSnapshot().blocked, true);
    assert.equal(JSON.parse(local.raw()!).state.notes.cia, 'Private A');
  } finally {
    sync.stop();
  }
});
test('two tabs preserve competing drafts instead of silently replacing the other tab cache', async () => {
  const local = cache(),
    remote = server({ revision: 1, state: freshState() }),
    a = new AccountSync(course, remote.port, local.port),
    b = new AccountSync(course, remote.port, local.port);
  try {
    await a.start();
    await b.start();
    a.update((draft) => {
      draft.notes.cia = 'Tab A';
    });
    b.update((draft) => {
      draft.notes.cia = 'Tab B';
    });
    assert.equal(b.getSnapshot().status, 'conflict');
    assert.equal(JSON.parse(local.raw()!).state.notes.cia, 'Tab A');
    assert.ok(local.copies.some((raw) => JSON.parse(raw).state.notes.cia === 'Tab B'));
    await a.flush();
    await b.resolve(true, 2);
    assert.equal(remote.record()!.state.notes.cia, 'Tab B');
  } finally {
    a.stop();
    b.stop();
  }
});
test('a missing offline cache stays blocked through retries; corrupt bytes survive recovery', async () => {
  const local = cache(),
    offline = new AccountSync(
      course,
      {
        load: async () => {
          throw problem('UNAVAILABLE');
        },
        save: async () => {
          throw new Error('must not save');
        },
      },
      local.port,
    );
  try {
    await offline.start();
    await offline.retry();
    offline.update((draft) => {
      draft.notes.cia = 'Not allowed';
    });
    assert.equal(offline.getSnapshot().blocked, true);
    assert.equal(local.raw(), null);
  } finally {
    offline.stop();
  }
  const broken = cache('not-json'),
    remote = server(),
    sync = new AccountSync(course, remote.port, broken.port);
  try {
    await sync.start();
    assert.equal(broken.copies[0], 'not-json');
    assert.equal(JSON.parse(broken.raw()!).version, 1);
  } finally {
    sync.stop();
  }
});
