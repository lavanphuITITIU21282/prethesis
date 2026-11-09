import { freshState, validateBackup } from '@/shared/domain/study-core.js';
import type { Course, StudyState } from '@/shared/domain/models';
import type { AccountProgressCache, AccountProgressGateway } from '../domain/account-progress';
import { restoreTimer } from './progress-service';
import { createClientId } from '@/shared/application/client-id';

type Status =
  | 'loading'
  | 'saved'
  | 'pending'
  | 'saving'
  | 'offline'
  | 'conflict'
  | 'session'
  | 'blocked';
export interface SyncSnapshot {
  state: StudyState;
  revision: number;
  dirty: boolean;
  ready: boolean;
  blocked: boolean;
  status: Status;
  warning: string;
}
function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, ordered(item)]),
    );
  return value;
}
export const progressFingerprint = (state: StudyState) =>
  JSON.stringify(ordered({ ...state, timer: null }));

export class AccountSync {
  private initial: SyncSnapshot = {
    state: freshState(),
    revision: 0,
    dirty: false,
    ready: false,
    blocked: false,
    status: 'loading',
    warning: '',
  };
  private snapshot = this.initial;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private busy = false;
  private stopped = true;
  private generation = 0;
  private loadGeneration = 0;
  private lastRaw: string | null = null;
  private clientId = '';
  private cacheWarning = '';
  private hasState = false;
  constructor(
    private course: Course,
    private remote: AccountProgressGateway,
    private cache: AccountProgressCache,
  ) {}
  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => this.initial;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private set(patch: Partial<SyncSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
  }
  private emit() {
    for (const listener of this.listeners) listener();
  }
  private normalize(input: unknown) {
    const state = validateBackup(input, this.course);
    state.timer = restoreTimer((input as StudyState)?.timer);
    return state;
  }
  private payload() {
    return JSON.stringify({
      version: 1,
      clientId: this.clientId,
      revision: this.snapshot.revision,
      dirty: this.snapshot.dirty,
      state: this.snapshot.state,
    });
  }
  private persist() {
    const payload = this.payload();
    try {
      const current = this.cache.read();
      if (current && current !== this.lastRaw) {
        const other = JSON.parse(current);
        if (other.dirty && other.clientId !== this.clientId) {
          this.cache.preserve(payload, this.clientId);
          this.set({
            status: 'conflict',
            warning:
              'Một tab khác cũng đang có bản nháp. Bản nháp của tab này đã được giữ để khôi phục.',
          });
          return false;
        }
      }
      this.cache.write(payload);
      this.lastRaw = payload;
      return true;
    } catch {
      this.cacheWarning =
        'Chưa giữ được bản nháp trong trình duyệt. Hãy xuất JSON trước khi đổi tài khoản hoặc đóng trang.';
      this.set({ warning: this.cacheWarning });
      return false;
    }
  }
  private schedule() {
    clearTimeout(this.timer);
    if (!this.stopped && this.snapshot.dirty && this.snapshot.status === 'pending')
      this.timer = setTimeout(() => void this.flush(), 800);
  }
  async start() {
    this.stopped = false;
    this.generation++;
    this.clientId = createClientId();
    try {
      this.lastRaw = this.cache.read();
      if (this.lastRaw) {
        const value = JSON.parse(this.lastRaw);
        if (
          value.version !== 1 ||
          !Number.isSafeInteger(value.revision) ||
          value.revision < 0 ||
          typeof value.dirty !== 'boolean'
        )
          throw new Error('INVALID_CACHE');
        this.set({
          state: this.normalize(value.state),
          revision: value.revision,
          dirty: value.dirty,
          ready: true,
        });
        this.hasState = true;
      }
    } catch {
      try {
        if (this.lastRaw) this.cache.preserve(this.lastRaw);
      } catch {
        this.set({
          ready: true,
          blocked: true,
          status: 'blocked',
          warning: 'Bản nháp lỗi chưa được sao lưu. Chặn ghi để giữ dữ liệu gốc.',
        });
        this.emit();
        return;
      }
    }
    this.emit();
    await this.refresh();
  }
  stop() {
    this.stopped = true;
    this.generation++;
    this.loadGeneration++;
    clearTimeout(this.timer);
  }
  async refresh() {
    if (this.stopped || this.busy || this.snapshot.status === 'blocked') return;
    const generation = this.generation,
      load = ++this.loadGeneration;
    try {
      const record = await this.remote.load();
      if (this.stopped || generation !== this.generation || load !== this.loadGeneration) return;
      const server = record ? { ...record, state: this.normalize(record.state) } : null;
      this.hasState = true;
      const same =
        server && progressFingerprint(server.state) === progressFingerprint(this.snapshot.state);
      if (
        (this.snapshot.dirty && (server?.revision || 0) !== this.snapshot.revision && !same) ||
        (!server && this.snapshot.revision > 0)
      ) {
        this.set({
          status: 'conflict',
          ready: true,
          blocked: false,
          warning: 'Tiến độ trên máy chủ đã thay đổi. Bản nháp trên thiết bị chưa bị ghi đè.',
        });
      } else if (this.snapshot.dirty && !same) {
        this.set({ status: 'pending', ready: true, blocked: false, warning: '' });
        this.schedule();
      } else {
        this.set({
          state: { ...(server?.state || freshState()), timer: this.snapshot.state.timer },
          revision: server?.revision || 0,
          dirty: false,
          ready: true,
          blocked: false,
          status: 'saved',
          warning: '',
        });
        this.persist();
      }
    } catch (error) {
      this.fail(error);
    }
    this.emit();
  }
  private fail(error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === 'INVALID_STATE') {
      this.set({
        status: 'offline',
        warning:
          'Bản lưu vượt giới hạn hoặc không hợp lệ. Hãy xuất JSON để giữ nháp trước khi sửa dữ liệu.',
      });
      return;
    }
    if (code === 'ACCOUNT_CHANGED' || code === 'UNAUTHENTICATED')
      this.set({
        status: 'session',
        blocked: true,
        ready: true,
        warning:
          'Phiên hoặc tài khoản đã thay đổi. Tải lại trang; bản nháp của tài khoản cũ vẫn được giữ riêng.',
      });
    else if (code === 'PROGRESS_CONFLICT')
      this.set({
        status: 'conflict',
        warning: 'Có dữ liệu mới trên máy chủ. Chọn bản cần dùng trước khi lưu tiếp.',
      });
    else
      this.set({
        status: 'offline',
        ready: true,
        blocked: !this.hasState,
        warning:
          this.cacheWarning ||
          'Chưa kết nối được máy chủ. Bản nháp trên thiết bị được giữ; hãy thử đồng bộ lại.',
      });
  }
  update(recipe: (draft: StudyState) => void) {
    if (this.stopped || !this.snapshot.ready || this.snapshot.blocked) return;
    const state = structuredClone(this.snapshot.state);
    recipe(state);
    const changed = progressFingerprint(state) !== progressFingerprint(this.snapshot.state);
    if (changed) this.loadGeneration++;
    this.set({
      state,
      dirty: this.snapshot.dirty || changed,
      status:
        changed && !['conflict', 'session'].includes(this.snapshot.status)
          ? 'pending'
          : this.snapshot.status,
    });
    this.persist();
    this.schedule();
    this.emit();
  }
  replace(state: StudyState) {
    this.cache.preserve(this.payload());
    this.update((draft) => Object.assign(draft, this.normalize(state)));
  }
  async flush() {
    clearTimeout(this.timer);
    if (
      this.stopped ||
      this.busy ||
      !this.snapshot.dirty ||
      this.snapshot.blocked ||
      ['conflict', 'session', 'blocked'].includes(this.snapshot.status)
    )
      return;
    this.busy = true;
    const generation = this.generation;
    this.loadGeneration++;
    const state = { ...this.snapshot.state, timer: null };
    const sent = progressFingerprint(state);
    this.set({ status: 'saving' });
    this.emit();
    try {
      const record = await this.remote.save(state, this.snapshot.revision);
      if (this.stopped || generation !== this.generation) return;
      const changed = progressFingerprint(this.snapshot.state) !== sent;
      this.set({
        state: changed
          ? this.snapshot.state
          : { ...this.normalize(record.state), timer: this.snapshot.state.timer },
        revision: record.revision,
        dirty: changed,
        status: changed ? 'pending' : 'saved',
        warning: '',
      });
      this.persist();
    } catch (error) {
      if (!this.stopped && generation === this.generation) this.fail(error);
    } finally {
      this.busy = false;
      if (!this.stopped && generation === this.generation) {
        this.schedule();
        this.emit();
      }
    }
  }
  async resolve(useLocal: boolean, expectedServerRevision?: number) {
    if (this.busy || this.stopped || this.snapshot.status === 'session') return;
    this.busy = true;
    const generation = this.generation;
    this.loadGeneration++;
    const before = progressFingerprint(this.snapshot.state);
    try {
      const record = await this.remote.load();
      if (this.stopped || generation !== this.generation) return;
      if (!useLocal && before !== progressFingerprint(this.snapshot.state)) {
        this.set({
          status: 'conflict',
          warning: 'Bản nháp vừa thay đổi. Xem lại trước khi thay dữ liệu.',
        });
        this.emit();
        return;
      }
      if (
        expectedServerRevision !== undefined &&
        (record?.revision || 0) !== expectedServerRevision
      ) {
        this.set({
          status: 'conflict',
          warning: 'Bản máy chủ vừa thay đổi. Xem lại trước khi chọn bản cần dùng.',
        });
        this.emit();
        return;
      }
      // Keep both device drafts before an explicit conflict-resolution choice changes either copy.
      this.cache.preserve(this.payload());
      if (record)
        this.cache.preserve(
          JSON.stringify({
            version: 1,
            revision: record.revision,
            dirty: false,
            clientId: 'server-recovery',
            state: record.state,
          }),
        );
      const raw = this.cache.read();
      if (raw && raw !== this.lastRaw) this.cache.preserve(raw);
      this.lastRaw = raw;
      this.set({
        state: useLocal
          ? this.snapshot.state
          : {
              ...(record ? this.normalize(record.state) : freshState()),
              timer: this.snapshot.state.timer,
            },
        revision: record?.revision || 0,
        dirty: useLocal,
        ready: true,
        blocked: false,
        status: useLocal ? 'pending' : 'saved',
        warning: '',
      });
      this.hasState = true;
      this.persist();
      this.emit();
    } catch (error) {
      if (!this.stopped && generation === this.generation) {
        this.fail(error);
        this.emit();
      }
    } finally {
      this.busy = false;
    }
    if (useLocal && generation === this.generation) await this.flush();
  }
  previewGuest() {
    const raw = this.cache.readGuest();
    return raw ? { ...this.normalize(JSON.parse(raw)), timer: null } : null;
  }
  previewServer() {
    return this.remote.load();
  }
  recoveries() {
    return (this.cache.recoveries?.() || []).map((record) => {
      let state: StudyState | null = null;
      try {
        const value = JSON.parse(record.raw);
        state = this.normalize(value.state);
      } catch {
        /* Keep unreadable original bytes available for export. */
      }
      return { ...record, state };
    });
  }
  lockSession() {
    this.generation++;
    clearTimeout(this.timer);
    this.set({
      blocked: true,
      status: 'session',
      warning: 'Phiên tài khoản đã thay đổi. Bản nháp được giữ riêng; đang chờ xác minh lại.',
    });
    this.emit();
  }
  async retry() {
    await this.refresh();
    if (this.snapshot.status !== 'conflict') await this.flush();
  }
}
