sha1 = str => {
  rotateBitsLeft = (x, n = 8) => x << n | x >>> -n;
  showHexadecimal = x => (x >>> 0).toString(16).padStart(8, 0);
  getChar = _ => str.charCodeAt(i++);
  addChunk = x => chunks.push(x);

  len = str.length;
  chunks = [];
  for (i = 0; len - 3 > i;)
    addChunk(rotateBitsLeft(rotateBitsLeft(rotateBitsLeft(getChar()) | getChar()) | getChar()) | getChar());

  x = 0;
  for (j = 4; j--;) {
    x = rotateBitsLeft(x) | (len > i ? getChar() : i++ - len ? 0 : 128);
  }
  addChunk(x);

  while (chunks.length % 15 - 14)
    addChunk(0);

  addChunk(len >>> 29);
  addChunk(len << 3);

  A = 0x67452301;
  B = 0xEFCDAB89;
  C = 0x98BADCFE;
  D = 0x10325476;
  E = 0xC3D2E1F0;

  w = [];
  for (chunk = 0; chunks.length > chunk;) {
    a = A;
    b = B;
    c = C;
    d = D;
    e = E;

    for (i = 80; i--;) {
      x = (
        w[i] =
          i > 63 ?
            chunks[chunk++]
          : rotateBitsLeft(w[i+3] ^ w[i+8] ^ w[i+14] ^ w[i+16], 1)
        ) +
        rotateBitsLeft(a, 5) + e + (
        (i > 59) ?
          (b & c | ~b & d) + 0x5A827999
        : (i > 39) ?
          (b ^ c ^ d) + 0x6ED9EBA1
        : (i > 19) ?
          (b&c | b&d | c&d) + 0x8F1BBCDC
        : (b ^ c ^ d) + 0xCA62C1D6
      );

      e = d;
      d = c;
      c = rotateBitsLeft(b, 30);
      b = a;
      a = x;
    }

    A += a;
    B += b;
    C += c;
    D += d;
    E += e;
  }

  return showHexadecimal(A) + showHexadecimal(B) + showHexadecimal(C) + showHexadecimal(D) + showHexadecimal(E);
};
