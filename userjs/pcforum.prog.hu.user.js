// ==UserScript==
// @name        prog.hu pcforum.hu noJS load
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://prog.hu/*
// @match       https://www.prog.hu/*
// @match       https://pcforum.hu/*
// @match       https://www.pcforum.hu/*
// @grant       none
// @version     2023.01.01
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

const main = () => {
  setCookies();
  const href = readHref();
  if (!href) {
    console.log('Missing redirect URL path from HTML body');
    return;
  }

  const main = document.getElementsByTagName('main')[0];
  if (!main) {
    return
  }
  const div = document.createElement('div');
  main.prepend(div);
  div.textContent = `Retrying ${href} with cookie...`;

  fetchBody(
    href,
    showBody,
    (s, code) => div.innerText = `Fetch failed ${code}\n${s}`
  );
};

const readHref = () => {
  const r = /^(.|\n)* window.location = /;
  const s =
    Array.from(document.querySelectorAll('script'))
    .find(s => r.test(s.textContent))
    ?.textContent.replace(r, '')
    .replace(/(.")(?:.|\n)*$/g, '$1')
    ?? null;

  try {
    return JSON.parse(s);
  } catch (e) {
    console.log(`${e}\n${s}`);
    return null;
  }
};

const setCookies = () => {
  const seed = Math.trunc(new Date() / 1000 / 3600) * 3600;
  const cookies = [
    `vid=${getPseudo(seed, 30)}`,
    `lastvisit=${seed}`,
    'JSDETECTED=1',
    'darkactive=0',
    `ddbdcbcf=${getSecret(seed)}`,
    'ABRC=1',
    `ABLR=${seed}`,
  ];
  cookies.forEach(c => document.cookie =
    `${c}; max-age=3600; path=/; domain=${window.location.hostname}; samesite`);
};

const getSecret = (seed) => {
  const s = getPseudo(seed, 32);
  const vocab = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  for (const i in s) {
    sum += s.charCodeAt(i);
  }
  return btoa(`0${s}${vocab[sum % vocab.length]}`);
};

const getPseudo = (seed, len) => {
  let s = '';
  for (let i = 1; s.length < len; i++) {
    s += Math.sin(seed + i).toString(16).padEnd(16, 0).substr(3, 13);
  }
  return s.substr(0, len);
};

const fetchBody = (href, ok, err) => {
  const x = new XMLHttpRequest();
  x.open('GET', href);
  x.onload = (e) => {
    if ((x.status >= 200) && (x.status <= 299)) {
      ok(x.responseText);
    } else {
      err(x.responseText, x.status);
    }
  };
  x.onerror = (e) => {
    err(x.responseText, x.status);
    console.log(e);
  }
  x.ontimeout = x.onerror;
  x.timeout = 10000;
  x.send();
};

const showBody = (s) => {
  document.body.innerHTML = s;
  setCookies();
};

main();
})();
