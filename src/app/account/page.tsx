import React from 'react';
import AccountPage from '@/modules/identity/presentation/account';
import { googleConfig } from '@/app/_server/google-auth-http.mjs';
export const metadata = { title: 'Tài khoản · Trạm học' };
// Request-time rendering lets Next attach the proxy's CSP nonce to bootstrap scripts.
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ google?: string | string[] }>;
}) {
  const { google } = await searchParams;
  const message =
    google === 'cancelled'
      ? 'Bạn đã hủy đăng nhập Google. Bạn có thể thử lại.'
      : google === 'expired'
        ? 'Phiên đăng nhập Google đã hết hạn hoặc thay đổi. Hãy bắt đầu lại.'
        : google === 'busy'
          ? 'Có quá nhiều lượt đăng nhập Google. Vui lòng thử lại sau.'
          : google === 'failed'
            ? 'Chưa đăng nhập được bằng Google. Vui lòng thử lại.'
            : '';
  return <AccountPage googleAvailable={Boolean(googleConfig())} googleError={message} />;
}
