'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { accounts, type Account } from '../client';
import { useRouter } from 'next/navigation';

export default function AccountPage({
  googleAvailable = false,
  googleError = '',
}: {
  googleAvailable?: boolean;
  googleError?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<Account | null | undefined>(undefined);
  const [register, setRegister] = useState(false);
  const [pending, setPending] = useState<'local' | 'google' | 'logout' | null>(null);
  const [error, setError] = useState(googleError);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    accounts
      .session(controller.signal)
      .then(setUser)
      .catch((error) => {
        if (!controller.signal.aborted) {
          setUser(null);
          setError(error.message);
        }
      });
    return () => controller.abort();
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;
    setPending('local');
    setError('');
    try {
      await accounts[register ? 'register' : 'login']({
        username: data.get('username'),
        password: data.get('password'),
        name: data.get('name'),
      });
      form.reset();
      setShowPassword(false);
      setUser(await accounts.session());
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa thực hiện được yêu cầu.');
    } finally {
      setPending(null);
    }
  }
  async function logout() {
    if (pending) return;
    setPending('logout');
    setError('');
    try {
      await accounts.logout();
      setUser(null);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa đăng xuất được.');
    } finally {
      setPending(null);
    }
  }
  async function startGoogle() {
    if (pending || !googleAvailable) return;
    setPending('google');
    setError('');
    try {
      const { authorizationUrl } = await accounts.google();
      window.location.assign(authorizationUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Chưa mở được đăng nhập Google.');
      setPending(null);
    }
  }
  return (
    <section className="auth-card" aria-labelledby="account-title">
      <div className="auth-illustration">
        <div className="auth-brand">
          <span aria-hidden="true">學</span>
          <div>
            <strong>Trạm học.</strong>
            <small>THƯ PHÒNG TRI THỨC</small>
          </div>
        </div>
        <div className="auth-illustration-copy">
          <p>Góc học của bạn.</p>
          <span>Trở lại bài đang đọc, ghi chú và lịch ôn của mình.</span>
        </div>
      </div>
      <div className="auth-content">
        <span className="auth-kicker">TÀI KHOẢN TRẠM HỌC</span>
        <h1 id="account-title">
          {user ? `Chào ${user.name}` : register ? 'Tạo tài khoản' : 'Đăng nhập'}
        </h1>
        <p className="auth-intro">
          {user
            ? 'Tiến độ và ghi chú được lưu theo tài khoản của bạn.'
            : register
              ? 'Tạo không gian riêng để lưu tiến độ, ghi chú và lịch ôn.'
              : 'Đăng nhập để tiếp tục học và đồng bộ tiến độ của bạn.'}
        </p>
        {error && (
          <p role="alert" className="auth-error">
            {error}
          </p>
        )}
        {user === undefined ? (
          <p role="status" className="auth-session-status">
            Đang kiểm tra phiên đăng nhập…
          </p>
        ) : user ? (
          <div className="auth-session-actions">
            <Link className="btn" href="/">
              Về trang học
            </Link>
            <button className="btn secondary" onClick={logout} disabled={Boolean(pending)}>
              {pending === 'logout' ? 'Đang đăng xuất…' : 'Đăng xuất'}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submit} aria-busy={pending === 'local'}>
              <fieldset disabled={Boolean(pending)} className="auth-fields">
                {register && (
                  <label>
                    Tên hiển thị
                    <input name="name" autoComplete="nickname" maxLength={100} required />
                  </label>
                )}
                <div className="auth-field">
                  <label htmlFor="account-username">Tên đăng nhập</label>
                  <input
                    id="account-username"
                    name="username"
                    autoComplete="username"
                    minLength={3}
                    maxLength={32}
                    pattern="[a-zA-Z0-9_]{3,32}"
                    aria-describedby={register ? 'username-help' : undefined}
                    required
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  {register && (
                    <small id="username-help">3–32 chữ cái không dấu, số hoặc dấu gạch dưới.</small>
                  )}
                </div>
                <div className="auth-field">
                  <label htmlFor="account-password">Mật khẩu</label>
                  <div className="auth-password">
                    <input
                      key={register ? 'register' : 'login'}
                      id="account-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={register ? 'new-password' : 'current-password'}
                      minLength={register ? 15 : 1}
                      maxLength={128}
                      required
                      aria-describedby={register ? 'password-help' : undefined}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      aria-controls="account-password"
                    >
                      {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                  </div>
                  {register && (
                    <small id="password-help">Dùng một cụm mật khẩu từ 15 đến 128 ký tự.</small>
                  )}
                </div>
                <button className="btn auth-submit" type="submit">
                  {pending === 'local'
                    ? register
                      ? 'Đang tạo tài khoản…'
                      : 'Đang đăng nhập…'
                    : register
                      ? 'Tạo tài khoản'
                      : 'Đăng nhập'}
                </button>
              </fieldset>
            </form>
            <div className="auth-divider">
              <span>hoặc</span>
            </div>
            <button
              type="button"
              className="auth-google"
              onClick={startGoogle}
              disabled={Boolean(pending) || !googleAvailable}
              aria-describedby={!googleAvailable ? 'google-unavailable' : undefined}
            >
              <span className="auth-google-mark" aria-hidden="true" />
              {pending === 'google' ? 'Đang mở Google…' : 'Đăng nhập bằng Google'}
            </button>
            {!googleAvailable && (
              <small id="google-unavailable" className="auth-google-note">
                Google chưa được cấu hình trên máy chủ này.
              </small>
            )}
            <button
              className="auth-switch"
              type="button"
              disabled={Boolean(pending)}
              onClick={() => {
                setRegister(!register);
                setShowPassword(false);
                setError('');
              }}
            >
              {register ? (
                <>
                  Đã có tài khoản? <strong>Đăng nhập</strong>
                </>
              ) : (
                <>
                  Chưa có tài khoản? <strong>Đăng ký</strong>
                </>
              )}
            </button>
            <Link className="auth-guest" href="/path">
              Tiếp tục học với tư cách khách <span aria-hidden="true">→</span>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
