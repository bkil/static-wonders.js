// ==UserScript==
// @name        chipcad.hu noJS paginated search
// @author      bkil
// @namespace   bkil.hu
// @match       https://chipcad.hu/*
// @match       https://www.chipcad.hu/*
// @grant       none
// @version     2022.3.10
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
  'use strict';
  var a = document.querySelectorAll('a.js-changePage[data-page]');
  for (var i = 0; i < a.length; i++) {
    var page = a[i].getAttribute('data-page');
    var u = new URL(a[i].href);
    u.searchParams.set('page', page);
    a[i].href = u.href;
  }
})();
