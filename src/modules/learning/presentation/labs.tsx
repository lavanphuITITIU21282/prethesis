'use client';

import React from 'react';

import { useEffect, useRef, useState } from 'react';
import { caesar, gcd, inverse, isPrime, modPow } from '@/shared/domain/study-core.js';
import { PageHead } from '@/shared/ui/primitives';
import { hashService } from '@/modules/learning/client';

function rsaExample(p: number, q: number, exponent: number, message: number) {
  if (!isPrime(p) || !isPrime(q) || p === q || p > 997 || q > 997)
    return 'p,q phải là hai nguyên tố khác nhau trong 2–997.';
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  if (!Number.isInteger(exponent) || exponent < 2 || exponent >= phi || gcd(exponent, phi) !== 1)
    return `Cần 1 < e < φ(n)=${phi} và gcd(e,φ(n))=1.`;
  if (!Number.isInteger(message) || message < 0 || message >= n)
    return `m phải là số nguyên trong 0…${n - 1}.`;
  const d = inverse(exponent, phi)!;
  const cipher = modPow(message, exponent, n);
  return `n=pq=${n} · φ(n)=${phi}\nd=e⁻¹ mod φ(n)=${d}\nC=${message}^${exponent} mod ${n}=${cipher}\nGiải mã: ${cipher}^${d} mod ${n}=${modPow(cipher, d, n)}`;
}
export default function Labs() {
  const [plain, setPlain] = useState('CAT meets security');
  const [key, setKey] = useState('3');
  const [xorA, setXorA] = useState('10101010');
  const [xorB, setXorB] = useState('01100110');
  const [blocks, setBlocks] = useState('ABABAAAB');
  const [hashA, setHashA] = useState('Hello world');
  const [hashB, setHashB] = useState('Hfllo world');
  const [hashes, setHashes] = useState<string[]>([]);
  const [hashStatus, setHashStatus] = useState('Sẵn sàng so sánh 256 bit đầu ra.');
  const [rsa, setRsa] = useState({ p: '13', q: '17', e: '7', m: '42' });
  const [dh, setDh] = useState({ a: '6', b: '15' });
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const rotation = Number(key);
  const colors: Record<string, string> = { A: '#a5c8b3', B: '#e2c68e', C: '#a8c6db' };
  const a = Number(dh.a);
  const b = Number(dh.b);
  const validDH = [a, b].every((value) => Number.isInteger(value) && value >= 1 && value <= 21);
  const A = validDH ? modPow(5, a, 23) : 0n;
  const B = validDH ? modPow(5, b, 23) : 0n;
  async function compareHash() {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setHashStatus('Đang tính SHA-256…');
    setHashes([]);
    try {
      const values = await hashService.compareHashes([hashA, hashB], controller.signal);
      if (controller.signal.aborted) return;
      setHashes(values);
      const bits = values.map((value) =>
        [...value]
          .map((character) => parseInt(character, 16).toString(2).padStart(4, '0'))
          .join(''),
      );
      const count = [...bits[0]].filter((bit, index) => bit !== bits[1][index]).length;
      setHashStatus(`${count} / 256 bit khác nhau (${((count / 256) * 100).toFixed(1)}%)`);
    } catch (error) {
      if (!controller.signal.aborted)
        setHashStatus(error instanceof Error ? error.message : 'Kiểm tra máy chủ LAN.');
    }
  }
  return (
    <>
      <PageHead
        title="Chạm vào ý tưởng."
        subtitle="Đổi một đầu vào và quan sát. Các số nhỏ và sơ đồ khối dùng để học, không dùng bảo vệ dữ liệu."
      />
      <div className="lab-grid">
        <section className="card">
          <div className="section-heading">
            <h2>01 · Caesar</h2>
            <span className="tag">Dịch bảng chữ cái</span>
          </div>
          <div className="lab-inputs">
            <label>
              Bản rõ
              <input
                maxLength={500}
                value={plain}
                onChange={(event) => setPlain(event.target.value)}
              />
            </label>
            <label>
              Khóa k (0–25)
              <input
                type="number"
                min={0}
                max={25}
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
            </label>
          </div>
          <div className="lab-result" aria-live="polite">
            {Number.isInteger(rotation) && rotation >= 0 && rotation <= 25 ? (
              <>
                <small>C = (P + {rotation}) mod 26</small>
                <br />
                <strong>{caesar(plain, rotation)}</strong>
                <br />
                <small>Giải ngược: {caesar(caesar(plain, rotation), -rotation)}</small>
              </>
            ) : (
              'Khóa phải là số nguyên từ 0 đến 25.'
            )}
          </div>
        </section>
        <section className="card">
          <div className="section-heading">
            <h2>02 · XOR từng bit</h2>
            <span className="tag">8 bit</span>
          </div>
          <div className="lab-inputs">
            <label>
              M (bản rõ)
              <input
                inputMode="numeric"
                maxLength={8}
                value={xorA}
                onChange={(event) => setXorA(event.target.value)}
              />
            </label>
            <label>
              K (khóa)
              <input
                inputMode="numeric"
                maxLength={8}
                value={xorB}
                onChange={(event) => setXorB(event.target.value)}
              />
            </label>
          </div>
          <div className="lab-result" aria-live="polite">
            {/^[01]{8}$/.test(xorA) && /^[01]{8}$/.test(xorB) ? (
              <>
                M: {xorA}
                <br />
                K: {xorB}
                <br />
                <strong>
                  C: {[...xorA].map((bit, index) => (bit === xorB[index] ? '0' : '1')).join('')}
                </strong>
                <br />
                <small>C XOR K khôi phục M</small>
              </>
            ) : (
              'Nhập đúng 8 bit 0 hoặc 1 cho mỗi dòng.'
            )}
          </div>
        </section>
        <section className="card full-span">
          <div className="section-heading">
            <h2>03 · ECB lộ mẫu lặp</h2>
            <span className="tag amber">Minh họa quan hệ · không tính AES</span>
          </div>
          <p className="section-caption">
            Cùng khóa ECB, khối bản rõ giống cho bản mã giống. Hàng CBC minh họa trạng thái khác
            nhau; không là đầu ra mật mã thật.
          </p>
          <label>
            Chuỗi nhãn khối (A/B/C, tối đa 16)
            <input
              maxLength={16}
              value={blocks}
              onChange={(event) => setBlocks(event.target.value.toUpperCase())}
            />
          </label>
          <div className="lab-result" aria-live="polite">
            {/^[ABC]{1,16}$/.test(blocks) ? (
              <>
                {[
                  'BẢN RÕ',
                  'ECB · CÙNG ĐẦU VÀO → CÙNG ĐẦU RA',
                  'CBC · MINH HỌA CHUỖI ĐẦU VÀO KHÁC NHAU',
                ].map((label, row) => (
                  <div key={label}>
                    <small>{label}</small>
                    <div className="block-row">
                      {[...blocks].map((block, index) => (
                        <span
                          key={index}
                          className="cipher-block"
                          style={{
                            background:
                              row === 2 ? `hsl(${140 + index * 17} 26% 78%)` : colors[block],
                          }}
                        >
                          {row === 2
                            ? `C${index + 1}`
                            : row === 1
                              ? ({ A: '8F2C', B: '31AB', C: '7D90' } as Record<string, string>)[
                                  block
                                ]
                              : block}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              'Chỉ nhập 1–16 nhãn A, B hoặc C.'
            )}
          </div>
        </section>
        <section className="card full-span">
          <div className="section-heading">
            <h2>04 · SHA-256 & hiệu ứng thác lũ</h2>
            <span className="tag">Tính SHA-256 thật</span>
          </div>
          <div className="lab-inputs">
            <label>
              Văn bản A
              <textarea
                rows={2}
                maxLength={4000}
                value={hashA}
                onChange={(event) => setHashA(event.target.value)}
              />
            </label>
            <label>
              Văn bản B
              <textarea
                rows={2}
                maxLength={4000}
                value={hashB}
                onChange={(event) => setHashB(event.target.value)}
              />
            </label>
          </div>
          <div className="inline-actions mt">
            <button className="btn" onClick={compareHash}>
              Tính và so sánh digest
            </button>
            <span className="count-label">
              Tính trên máy chủ LAN, UTF-8, không tự thêm newline.
            </span>
          </div>
          <div className="lab-result" aria-live="polite">
            {hashes.map((hash, index) => (
              <div key={index}>
                <small>{index ? 'B' : 'A'} · 256 bit / 64 ký tự hex</small>
                <br />
                {hash}
              </div>
            ))}
            <strong>{hashStatus}</strong>
            {hashes.length > 0 && (
              <>
                <div className="bit-row">
                  {[...hashes[1]].map((character, index) => (
                    <span
                      key={index}
                      className={`bit ${hashes[0][index] !== character ? 'changed' : ''}`}
                    >
                      {character}
                    </span>
                  ))}
                </div>
                <small>
                  Ô màu đánh dấu nibble hex khác nhau. Một phép thử không chứng minh tính an toàn.
                </small>
              </>
            )}
          </div>
        </section>
        <section className="card">
          <div className="section-heading">
            <h2>05 · RSA số nhỏ</h2>
            <span className="tag amber">Chỉ minh họa</span>
          </div>
          <div className="lab-inputs">
            {(['p', 'q', 'e', 'm'] as const).map((name) => (
              <label key={name}>
                {name}
                <input
                  type="number"
                  value={rsa[name]}
                  onChange={(event) =>
                    setRsa((previous) => ({ ...previous, [name]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="lab-result source-text" aria-live="polite">
            {rsaExample(Number(rsa.p), Number(rsa.q), Number(rsa.e), Number(rsa.m))}
          </div>
          <p className="status-note">
            p,q là nguyên tố khác nhau ≤997. RSA thô chỉ dùng để nhìn phép tính.
          </p>
        </section>
        <section className="card">
          <div className="section-heading">
            <h2>06 · Diffie–Hellman</h2>
            <span className="tag amber">Nhóm nhỏ cố định</span>
          </div>
          <p className="section-caption">p=23, g=5. Đổi hai số mũ bí mật để so sánh kết quả.</p>
          <div className="lab-inputs">
            {(['a', 'b'] as const).map((name) => (
              <label key={name}>
                {name} của {name === 'a' ? 'Alice' : 'Bob'}
                <input
                  type="number"
                  min={1}
                  max={21}
                  value={dh[name]}
                  onChange={(event) =>
                    setDh((previous) => ({ ...previous, [name]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="lab-result" aria-live="polite">
            {validDH ? (
              <>
                Alice gửi A=5^{a} mod23=<strong>{String(A)}</strong>
                <br />
                Bob gửi B=5^{b} mod23=<strong>{String(B)}</strong>
                <br />
                Alice: B^a mod23=<strong>{String(modPow(B, a, 23))}</strong>
                <br />
                Bob: A^b mod23=<strong>{String(modPow(A, b, 23))}</strong>
              </>
            ) : (
              'a,b phải là số nguyên 1–21.'
            )}
          </div>
          <p className="status-note">
            Chưa xác thực danh tính. Giá trị chung cần KDF theo giao thức để dùng thành khóa.
          </p>
        </section>
      </div>
    </>
  );
}
