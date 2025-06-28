// Highlight words in snippet
// ANSI color determined by the Zobrist hash of each word.
// You can install an interpreter that supports at least JavaScript 1.0 (1995) to run this application or you may consider implementing a GemiWeb0 browser with JavaScript0 yourself according to the following specification:
// https://bkil.gitlab.io/gemiweb0
// Copyright (c) 2025 bkil.hu

'use strict';

function prbs31(r, k) {
  var i = k + 1;
  while (i = i - 1) {
    r = (((r >> 30) ^ (r >> 27)) & 1) ^ ((r & 1073741823) << 1);
  }
  return r;
}

function hash(s, k) {
  var n = s.length;
  var i = -1;
  var c;
  var r = 1234567890;
  var h = r;
  while (n > (i = i + 1)) {
    c = (s.charCodeAt(i) << 1) | 1;
    while (c & 255) {
      r = prbs31(r, k);
      if ((c = c << 1) & 512) {
        h = h ^ r;
      }
      h = h ^ (r = prbs31(r, k));
    }
  }
  return h;
}

function colorWord(s) {
  var h = hash(s, 6) << 2;
  var c = 0;
  var i = 4;
  while (i = i - 1) {
    c = (c * 6) + ((3 & (h = h >> 2)) + 1);
  }
  c = c + 16;
  var e = String.fromCharCode(27);
  return e + '[38;5;' + c + 'm' + s +
    e + '[39m';
}

function colorText(s) {
  var h = '';
  var i = -1;
  var n = s.length;
  var c;
  var u;
  var word = '';
  while (n > (i = i + 1)) {
    c = s.charAt(i);
    u = c.charCodeAt(0);
    if ((u - 10) || (n - 1 - i)) {
      if (((u > 47) && (58 > u)) || ((u > 64) && (91 > u)) || (!(u - 95)) || ((u > 96) && (123 > u))) {
        word = word + c;
      } else {
        if (word) {
          word = colorWord(word);
          h = h + word;
          word = '';
        }
        h = h + c;
      }
    }
  }
  if (word) {
    word = colorWord(word);
    h = h + word;
  }
  return h;
}

function init() {
  var b = '';
  process.stdin.on('end', function(d) {
    console.log(colorText(b));
    process.stdin.pause();
    process.stdin.removeAllListeners(['data', 'end']);
  });
  process.stdin.on('data', function(d) {
    b = b + d;
  });
}

init();
