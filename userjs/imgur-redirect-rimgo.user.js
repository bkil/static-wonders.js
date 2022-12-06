// ==UserScript==
// @name        Redirect Imgur to Rimgo
// @author      bkil
// @description Alternative frontend without JavaScript
// @namespace   bkil.hu
// @match       http://imgur.com/*
// @match       https://imgur.com/*
// @match       http://www.imgur.com/*
// @match       https://www.imgur.com/*
// @run-at      document-start
// @grant       none
// @version     2022.12.02
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
  'use strict';

  if (location.href.match(/^https?:\/\/(www\.)?imgur\.com\/[0-9a-zA-Z]{5,7}([sbtmlh]|_d|)\.(png|jpe?g)([?].*)?$/)) {
    return
  }

  // https://codeberg.org/video-prize-ranch/rimgo/src/branch/main/instances.json
  const domains = [
    'i.bcow.xyz',
    'rimgo.pussthecat.org',
    'rimgo.totaldarkness.net',
    'rimgo.bus-hit.me',
    'rimgo.esmailelbob.xyz',
    'i.actionsack.com',
    'rimgo.privacydev.net',
    'imgur.artemislena.eu',
    'rimgo.vern.cc',
    'rimgo.encrypted-data.xyz',
    'rimgo.mha.fi',
    'rimgo.hostux.net',
    'ri.zzls.xyz',
    'rimgo.marcopisco.com',
  ];

  const domain = domains[Math.floor(Math.random() * domains.length)];
  const target = location.href.replace(/^(https?:\/\/)(www\.)?(i\.)?imgur.com\//, `$1${domain}/`);
  location.replace(target);

})();
