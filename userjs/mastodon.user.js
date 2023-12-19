// ==UserScript==
// @name        Mastodon, Pleroma, MissKey noJS reveal
// @author      bkil
// @description Preview without extra round trips
// @namespace   bkil.hu
// @match       https://*.*/notice/*
// @match       https://*.*/notes/*
// @match       https://*.*/@*/*
// @match       https://*.*/@*
// @grant       none
// @version     2023.12.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function main() {
  const sites = /^\/(notice\/[0-9A-Za-z]{18}|@[^\/]+(\/([0-9]+)?)?|notes\/[0-9a-z]{10})$/;
  if (window.location.hash || window.location.search || !window.location.pathname.match(sites)) {
    return
  }

  const result = document.createElement('div');
  addTitleDescription(result);
  document.body.prepend(result);
  addStyle();
}

function addTitleDescription(result) {
  let el = document.createElement('h1');
  el.textContent = document.head.getElementsByTagName('title')[0]?.textContent;
  result.appendChild(el);

  const longDesc = document.createElement('div');
  const shortDesc = document.head.querySelector('meta[property="og:description"]')?.content ??
    document.head.querySelector('meta[name="description"]')?.content;
  longDesc.innerText = shortDesc;
  result.appendChild(longDesc);

  const alt = document.head.querySelector('meta[property="og:image:alt"]')?.content;

  const img = document.head.querySelector('meta[property="og:image"]')?.content;
  if (img) {
    el = document.createElement('img');
    el.src = img;
    if (alt) {
      el.alt = alt;
    }

    const width = document.head.querySelector('meta[property="og:image:width"]')?.content;
    if (width) {
      el.width = width;
    }

    const height = document.head.querySelector('meta[property="og:image:height"]')?.content;
    if (height) {
      el.height = height;
    }

    result.appendChild(el);
  }

  el = document.createElement('blockquote');
  el.textContent = alt;
  result.appendChild(el);

  const feed = document.createElement('details');
  feed.open = true;
  const sum = document.createElement('summary');
  sum.textContent = '(click to view whole user feed)';
  feed.appendChild(sum);
  if (addRssEntries(feed, longDesc, shortDesc)) {
    result.appendChild(feed);
  }
}

function addRssEntries(feed, longDesc, shortDesc) {
  const rss = (
    document.querySelector('link[rel="alternate"][type="application/atom+xml"]') ??
    document.querySelector('link[rel="alternate"][type="application/rss+xml"]')
  )?.href;
  const err = function() { result.textContent = 'RSS entry not found'; };
  if (rss) {
    fetch(rss,
      function(r) {
        const j = (new DOMParser()).parseFromString(r, 'text/xml');
        shortDesc = shortDesc.replace(/\.\.\.$/, '');
        const rich = document.createElement('div');
        foreach(j.querySelectorAll('entry, item'), function(entry) {
          const content = entry.querySelector('content, description')?.textContent;
          if (content) {
            rich.innerHTML = sanitizeHtmlDesc(content);
            if (rich.textContent.startsWith(shortDesc)) {
              render(longDesc, entry);
            } else {
              const element = document.createElement('div');
              element.classList.add('entry');
              render(element, entry);
              feed.appendChild(element);
            }
          }
        });
      },
      err
    );
  }
  return !!rss;
}

function sanitizeHtmlDesc(html) {
  return html.replace(/<br\/?>/g, ' ').replace(/<[^<>]*>/g, '');
}

function render(result, entry) {
  const url = document.createElement('a');
  url.href = entry.querySelector('id')?.textContent ??
    entry.querySelector('link')?.textContent;
  url.target = '_blank';
  url.textContent = (
    entry.querySelector('updated') ??
    entry.querySelector('published') ??
    entry.querySelector('pubDate')
  )?.textContent ?? 'link';

  const content = entry.querySelector('content, description')?.textContent;
  const body = document.createElement('div');
  body.innerHTML  =
    content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&lt;a href=&quot;([^&]+)&quot;(?:[^&]|&quot;)*&gt;(.*?)&lt;\/a&gt;/g, '<a href="$1" target="_blank" rel="noreferrer noopener">$2</a>')
    .replace(/(&)amp;(#(?:[0-9]+|$[0-9a-f]+);)/g, '$1$2')
    .replace(/&lt;(?:\/?span)\b(?:[^&]|&quot;)*&gt;/g, '')
    .replace(/&lt;(?:(br) ?\/?|(\/?p))&gt;/g, '<$1$2>');

  result.innerHTML = '';
  result.appendChild(url);
  result.appendChild(body);
}

function foreach(l, f) {
  for (var i = 0; i < l.length; i++) {
    f(l[i]);
  }
}

function fetch(url, ok, err) {
  var x = new XMLHttpRequest();
  try {
    x.open('GET', url);
  } catch (e) {
    console.log(e);
    err();
    return
  }

  x.responseType = 'text';
  x.timeout = 30000;
  x.onload = function(e) {
    if ((x.status >= 200) && (x.status <= 299)) {
      ok(x.responseText);
    } else {
      console.log('failed to fetch "' + slug + '" - HTTP status ' + x.status);
      err();
    }
  };

  x.ontimeout = x.onerror = function(e) {
    console.log(e);
    err();
  };
  x.send();
}

function addStyle() {
  const style = document.createElement('style');
  const nonce = document.head.querySelector('meta[name="style-nonce"]')?.content;
  if (nonce) {
    style.nonce = nonce;
  }

  style.textContent =
    'h1 { font: initial; font-size: 2em }' +
    '#splash { display: none }' +
    'img { max-width: 100%; font-size: xx-small }' +
    'blockquote { border-left: 1px solid; padding-left: 1em; margin-left: 1em }' +
    '.entry { border-top: 1px solid }'
    ;
  document.body.appendChild(style);
}

main();
})();
