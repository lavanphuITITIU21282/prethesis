'use client';

import React from 'react';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="card">
      <h1>Chưa mở được trang học.</h1>
      <p className="mt">Tiến độ đã lưu vẫn nằm trên trình duyệt này. Hãy thử mở lại trang.</p>
      <button className="btn mt" onClick={reset}>
        Thử lại
      </button>
    </section>
  );
}
