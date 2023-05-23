// ==UserScript==
// @name        wiki.c2.com noJS
// @author      bkil
// @description Minimal viewer for Wiki-WikiBase for Opera Mini ES5
// @namespace   bkil.hu
// @match       http://wiki.c2.com/
// @match       http://wiki.c2.com/?*
// @match       https://wiki.c2.com/
// @match       https://wiki.c2.com/?*
// @grant       none
// @version     2023.5.8
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

var cache = {};
var status;
var currentSlug;
var host = 'wiki.c2.com';

function init() {
  if (window.location.hostname === host) {
    status = document.getElementById('tab');
    if (!document.body || !status) {
      window.addEventListener('load', init);
      return;
    }
  } else {
    document.body.innerHTML = '';
    status = document.createElement('div');
    document.body.appendChild(status);
  }

  var s = document.createElement('style');
  s.textContent = 'center { display: none }';
  document.head.appendChild(s);

  document.body.style.wordWrap = 'anywhere';
  document.body.style.overflowWrap = 'anywhere';
  window.addEventListener('popstate', navigateToUrl);
  window.addEventListener('load', function() {
    var banner = document.getElementsByTagName('center')[0];
    if (banner) {
      banner.style.display = 'none';
    }
  });
  navigateToUrl();
}

function navigateToUrl() {
  var slug = window.location.hash.substr(1);
  if (!slug.length) {
    slug = window.location.search.substr(1).replace('=', '');
  }
  navigateTo(
    ((window.location.hostname === host) && slug.length) ? slug : 'WelcomeVisitors',
    function() {},
    function() {
      renderPage("'''404 - Page not found''': " + slug + '.\n----\nSee: WelcomeVisitors');
    },
    false
  );
}

function renderPage(source) {
  var div = document.createElement('div');
  div.className = 'parsed';
  div.innerHTML = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r(\n)?/g, '\n')
    .replace(/(?:^|\n|(>))(?:\t| {8}) :(?:\t| {3})([^\n]*)/g, '$1<p><blockquote>$2</blockquote>')
    .replace(/(?:^|\n|(>))(?:\t| {8})([^\n:]+):(?:\t| {3})([^\n]*)/g, '$1<p><dl><dt>$2</dt><dd>$3</dd></dl>')
    .replace(/((?:^|\n)(?:[^*\n][^\n]*)?\n)((?:\t*[*][^\n]*(?:\n|$)+)*\t*[*][^\n]*)/g, '$1<ul>$2</ul>')
    .replace(/(?:^|\n|(<ul>))\t*[*] *([^ \n][^\n]*)/g, '$1<li>$2')
    .replace(/(?:^|\n|(>))----+/g, '$1<p><hr>')
    .replace(/(?:^|\n)((?:(?: |\t)[^\n]*\n+)*(?: |\t)[^\n]*)/g, '<pre>$1</pre>')
    .replace(/'''([^\n]*?)'''/g, '<strong>$1</strong>')
    .replace(/''([^\n]*?)''/g, '<em>$1</em>')
    .replace(/\b((?:(?:https?|ftps?|gophers?|gemini|nntp|snews):\/\/|(?:mailto|news):)(?:[^\]\[\s&<>()"']|&amp;)*(?:[^\]\[\s&<>()"'.,!?]|&amp;))/g, '<a href="$1" rel=noreferrer target=_blank>$1</a>')
    .replace(/(^|[\[\s>("'])((?:[A-Z][a-z]+){2,})\b/g, '$1<a href="https://' + host + '/?$2=">$2</a>')
    .replace(/\n/g, '<p>')
    .replace(/(?:^|<p>|(<pre>))(?: |\t|(<\/pre>)|(?=<p>))/g, '$1\n$2')
    ;

  foreach(div.getElementsByTagName('a'), function(l) {
    var slug = l.textContent;
    if (slug === currentSlug) {
      l.removeAttribute('href');
    } else if (!l.target) {
      l.onclick = function(e) {
        e.preventDefault();
        l.style.outline = 'auto';
        navigateTo(slug,
          function() {
            try {
              window.history.pushState({}, '', '?' + slug + '=');
            } catch (e) {
              console.log(e);
              window.location.hash = slug;
            }
          },
          function() {
            l.style.color = 'red';
            l.style.textDecoration = 'none';
            l.style.outline = 'initial';
          },
          true
        );
      };
      if (cache[slug] && !cache[slug].body) {
        l.style.color = 'red';
        l.style.textDecoration = 'none';
      }
    }
  });

  foreach(div.getElementsByTagName('em'), function(n) {
    n.style.textDecoration = 'underline';
  });

  foreach(div.getElementsByTagName('pre'), function(n) {
    n.style.whiteSpace = 'pre-wrap';
  });

  foreach(div.getElementsByTagName('blockquote'), function(n) {
    n.style.paddingInlineStart = '1em';
    n.style.borderInlineStart = '1px solid';
  });

  foreach(document.getElementsByClassName('parsed'), function(n) {
    n.remove();
  });
  document.body.appendChild(div);
}

function foreach(l, f) {
  for (var i = 0; i < l.length; i++) {
    f(l[i]);
  }
}

function navigateTo(slug, ok0, err0, doScroll) {
  var err = function() {
    cache[slug] = {};
    err0();
  };

  var ok = function(body) {
    var j;
    try {
      j = JSON.parse(body);
    } catch (e) {
      console.log(e);
      err();
      return;
    }
    if (currentSlug) {
      cache[currentSlug].scroll = document.body.scrollTop;
    }
    currentSlug = slug;
    ok0();
    renderPage((j.text ? j.text : body) + (j.date ? '\n' + j.date : ''));
    if (doScroll) {
      if (cache[slug] && cache[slug].scroll) {
        document.body.scrollTop = cache[slug].scroll;
      } else {
        document.documentElement.scrollIntoView();
      }
    }
  };

  if (cache[slug] && cache[slug].body) {
    ok(cache[slug].body);
  } else {
    status.innerHTML = 'Loading ' + slug + '...';
    status.style.padding = '1em';
    status.style.backgroundColor = 'white';
    status.style.position = 'fixed';
    status.hidden = false;

    fetch(
      slug,
      function(body) {
        status.hidden = true;
        cache[slug] = {body: body};
        ok(body);
      },
      function() {
        status.hidden = true;
        err();
      }
    );
  }
}

function fetch(slug, ok, err) {
  var x = new XMLHttpRequest();
  try {
    x.open('GET', 'https://c2.com/wiki/remodel/pages/' + slug);
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

init();
})();
