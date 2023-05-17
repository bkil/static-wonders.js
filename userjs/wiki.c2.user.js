// ==UserScript==
// @name        wiki.c2.com noJS
// @author      bkil
// @description Minimal viewer for WikiBase
// @namespace   bkil.hu
// @match       http://wiki.c2.com/
// @match       http://wiki.c2.com/?*
// @match       https://wiki.c2.com/
// @match       https://wiki.c2.com/?*
// @grant       none
// @version     2023.5.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

const cache = {};
let status;

function init() {
  const banner = document.getElementsByTagName('center')[0];
  status = document.getElementById('tab');
  if (!document.body || !banner || !status) {
    window.addEventListener('load', init);
    return;
  }

  window.addEventListener('popstate', navigateToUrl);
  banner.style.display = 'none';
  navigateToUrl();
}

function navigateToUrl() {
  const slug = window.location.search.substr(1).replace('=', '');
  navigateTo(
    slug.length ? slug : 'WelcomeVisitors',
    function() {},
    function() {
      renderPage("'''404 - Page not found''': " + slug + '.\n----\nSee: WelcomeVisitors');
    }
  );
}

function renderPage(source) {
  const div = document.createElement('div');
  div.className = 'parsed';
  div.innerHTML = source
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/\r(\n)?/g, '\n')
    .replace(/\n----+/g, '<p><hr>')
    .replace(/(?:^|\n)  ([^\n]+)/g, '<pre>$1</pre>')
    .replace(/((?:^|\n)(?:[^*\n][^\n]*)?\n)((?:\t*[*][^\n]*(?:\n|$)+)*\t*[*][^\n]*)/g, '$1<ul>$2</ul>')
    .replace(/(?:^|\n|(<ul>))\t*[*] *([^ \n][^\n]*)/g, '$1<li>$2')
    .replace(/(^|\s|>)'''([^\n]*?)'''/g, '$1<strong>$2</strong>')
    .replace(/(^|\s|>)''([^\n]*?)''/g, '$1<em>$2</em>')
    .replace(/\b((?:https?|ftps?|gophers?|gemini|mailto|news):(?:[^\]\[\s&<>()"']|&amp;)*(?:[^\]\[\s&<>()"'.,!?]|&amp;))/g, '<a href="$1" rel=noreferrer target=_blank>$1</a>')
    .replace(/(^|\s|>)((?:[A-Z][a-z]+){2,})\b/g, '$1<a href="?$2">$2</a>')
    .replace(/\n/g, '<p>')
    ;

  foreach(div.getElementsByTagName('a'), function(l) {
    if (!l.target) {
      const slug = l.textContent;
      l.onclick = function() {
        l.style.outline = 'auto';
        navigateTo(slug,
          function() {
            window.history.pushState({}, '', '?' + slug);
          },
          function() {
            l.style.color = 'red';
            l.style.textDecoration = 'none';
            l.style.outline = 'initial';
          });
        return false;
      };
      if (cache[slug] && !cache[slug].body) {
        console.log(cache[slug]);
        l.style.color = 'red';
        l.style.textDecoration = 'none';
      }
    }
  });

  foreach(div.getElementsByTagName('em'), function(em) {
    em.style.textDecoration = 'underline';
  });

  foreach(document.getElementsByClassName('parsed'), function(r) {
    r.remove();
  });
  document.body.appendChild(div);
}

function foreach(l, f) {
  for (let i = 0; i < l.length; i++) {
    f(l[i]);
  }
}

function navigateTo(slug, ok, err0) {
  status.innerHTML = 'Loading ' + slug + '...';
  status.style.padding = '1em';
  status.style.backgroundColor = 'white';
  status.style.position = 'fixed';
  status.hidden = false;
  const err = function() {
    status.hidden = true;
    err0();
  };

  fetch(
    slug,
    function (body) {
      let j;
      try {
        j = JSON.parse(body);
      } catch (e) {
        console.log(e);
        err();
        return;
      }
      ok();
      status.hidden = true;
      renderPage(j.text + (j.date ? '\n' + j.date : ''));
    },
    err
  );
}

function fetch(slug, ok, err0) {
  if (cache[slug] && cache[slug].body) {
    ok(cache[slug].body);
    return;
  }
  const x = new XMLHttpRequest();
  const err = function() {
    cache[slug] = {};
    err0();
  };
  try {
    x.open('GET', 'https://c2.com/wiki/remodel/pages/' + slug);
  } catch (e) {
    console.log(e);
    err();
    return
  }

  x.timeout = 30000;
  x.onload = function(e) {
    if ((x.status >= 200) && (x.status <= 299)) {
      cache[slug] = {body: x.responseText};
      ok(x.responseText);
    } else {
      err();
    }
  };

  x.ontimeout = x.onerror = function(e) {
    console.log(e);
    err();
  };
  x.send();
}

init();
})();
