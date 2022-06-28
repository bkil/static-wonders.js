// ==UserScript==
// @name        jofogas.hu Didomi noConsent
// @author      bkil
// @description Fix major functionality (e.g., communication) when various domains are blocked
// @namespace   bkil.hu
// @match       https://*.jofogas.hu/*
// @grant       none
// @version     2022.6.26
// @license     MIT
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

  if (!(typeof window.Didomi === 'object' && window.Didomi !== null)) {
    window.Didomi = new Object();
    window.Didomi.preferences = new Object();
    window.Didomi.preferences.show = function() {};
    window.Didomi.getUserConsentStatusForVendor = function(x) { return false; };
  }

  /* if you disable localStorage (cookies) in the browser, window.sessionStorage will throw otherwise */
  angular.module('jofogas').factory('sessionStorageService', [function() {
    let e = {};
    e.set = e.get = e.remove = e.register = e.getRegisteredKeys = e.removeRegisteredKeys = e.clearRegister = e.cleanUp = function (v) {
      return null;
    }
    return e;
  }]);

})();
