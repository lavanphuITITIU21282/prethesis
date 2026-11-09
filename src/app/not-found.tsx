import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="card">
      <h1>Chưa tìm thấy trang này.</h1>
      <p>Chọn một bài trong lộ trình để tiếp tục.</p>
      <Link className="btn mt" href="/path">
        Mở lộ trình
      </Link>
    </section>
  );
}
