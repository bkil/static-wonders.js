// Copyright (c) 2022 bkil.hu

const v = new Uint32Array(32);
const m = new Uint32Array(v);
const chunk = new Uint8Array(128);
let h, t;

// limited to at most 4GB of input
const blake2b = (input) => {
  h = new Uint32Array(IV);
  h[0] ^= 16842784;
  t = 0;

  let c = 0;
  input.map(read => {
    chunk[c++] = read;
    t++;

    if (!(c &= 127))
      compress();
  });

  while (c < 128) {
    chunk[c++] = 0
  }
  compress(~0);

  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = h[i >> 2] >> (8 * (i & 3));
  }
  return out;
};

const compress = (last) => {
  let i = 0;
  for (let j = 0; j < 32;) {
    v[j] = j < 16 ? h[j] : IV[j - 16];
    m[j++] = chunk[i++] | (chunk[i++] << 8) | (chunk[i++] << 16) | (chunk[i++] << 24);
  }

  v[24] ^= t;
  v[28] ^= last;
  v[29] ^= last;

  for (let i = 0; i < 12;) {
    mix(0, 8, 16, 24, i, 0);
    mix(2, 10, 18, 26, i, 2);
    mix(4, 12, 20, 28, i, 4);
    mix(6, 14, 22, 30, i, 6);
    mix(0, 10, 20, 30, i, 8);
    mix(2, 12, 22, 24, i, 10);
    mix(4, 14, 16, 26, i, 12);
    mix(6, 8, 18, 28, i++, 14);
  }

  for (let i = 16; i--;) {
    h[i] ^= v[i] ^ v[i + 16];
  }
};

const mix = (a, b, c, d, i, r) => {
  const x = i % 10 * 16 + r;

  add(a, v, b);
  add(a, m, 2 * SIGMA[x]);
  xor(d, a);
  rotr(d, 32);

  add(c, v, d);
  xor(b, c);
  rotr(b, 24);

  add(a, v, b);
  add(a, m, 2 * SIGMA[x + 1]);
  xor(d, a);
  rotr(d, 16);

  add(c, v, d);
  xor(b, c);
  rotr(b, 63);
};

const IV = [
  0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85,
  0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a,
  0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c,
  0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19,
];

const SIGMA = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
];

const add = (a, r, b) => {
  const t = v[a] + r[b];
  v[a + 1] += r[b + 1] + (t >= 0x100000000 ? 1 : 0);
  v[a] = t;
};

const xor = (a, b) => {
  v[a] ^= v[b];
  v[a + 1] ^= v[b + 1];
};

const rotr = (i, n) => {
  const [k, w] = n < 32 ? [n, 0] : [n - 32, 1];
  const rot = r => v[i + r] >>> k | (k ? v[i - r + 1] << -k : 0);
  const t = rot(w);
  v[i + 1] = rot(1 - w);
  v[i] = t;
};
