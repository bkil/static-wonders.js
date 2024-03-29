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
// @version     2023.01.11
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(() => {
'use strict';

const main = () => {
  setStaticCookies();
  const url = readRedirectUrl();
  if (!url) {
    console.log('Missing redirect URL path from HTML body');
    return;
  }

  const main = document.querySelector('main');
  if (!main) {
    return;
  }
  const status = document.createElement('h2');
  main.prepend(status);
  status.textContent = `Retrying ${url} with cookie...`;

  const js = document.querySelector('#script_pagejs')?.src;
  if (!js) {
    status.innerText = 'Failed to find #script_pagejs';
    return;
  }

  fetch(
    js,
    (s) => {
      const [, secretName] = s.match(/'([^']+)',this\.base64encode/) ?? [];
      if (!secretName) {
        status.innerText = 'Failed to extract cookie name';
        return;
      }

      setSecretCookie(secretName);
      fetch(
        url,
        (s) => showBody(s, url),
        (s, code) => status.innerText = `Fetch failed for content ${url} ${code}\n${s}`
      );
    },
    (s, code) => status.innerText = `Fetch failed for JS ${url} ${code}\n${s}`
  );
};

const showBody = (s, url) => {
  document.body.innerHTML = s;
  document.body.classList.remove('loading');
  const newTitle = document.body.querySelector('title')?.textContent;
  if (newTitle) {
    let title = document.head.querySelector('title');
    if (!title) {
      title = document.createElement('title');
      document.head.appendChild(title);
    }
    title.textContent = newTitle;
  }
  history.replaceState(null, '', url);
  setStaticCookies();
};

const readRedirectUrl = () => {
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

const setStaticCookies = () => {
  const seed = getSeed();
  const cookies = [
    `vid=${getPseudo(seed, 30)}`,
    `lastvisit=${seed}`,
    'JSDETECTED=1',
    'darkactive=0',
    'ABRC=1',
    `ABLR=${seed}`,
  ];
  cookies.forEach(setCookie);
};

const setSecretCookie = (secretName) => {
  setCookie(`${secretName}=${getSecret(getSeed())}`);
};

const getSeed = () => Math.trunc(new Date() / 1000 / 3600) * 3600;

const setCookie = (c) => {
  document.cookie = `${c}; max-age=3600; path=/; domain=${window.location.hostname}; samesite`;
};

const getSecret = (seed) => {
  const s = getPseudo(seed, 32);
  const tab = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sum = 0;
  for (const i in s) {
    sum += s.charCodeAt(i);
  }
  return btoa(`0${s}${tab[sum % tab.length]}`);
};

const getPseudo = (seed, len) => {
  let s = '';
  for (let i = 1; s.length < len; i++) {
    s += Math.sin(seed + i).toString(16).padEnd(16, 0).substr(3, 13);
  }
  return s.substr(0, len);
};

const fetch = (url, ok, err) => {
  const x = new XMLHttpRequest();
  x.open('GET', url);
  x.onload = (e) => {
    if ((x.status >= 200) && (x.status <= 299)) {
      ok(x.responseText);
    } else {
      err(x.responseText, x.status);
    }
  };
  x.onerror = (e) => {
    console.log(e);
    err(x.responseText, x.status);
  }
  x.ontimeout = x.onerror;
  x.timeout = 20000;
  x.send();
};

main();
})();
