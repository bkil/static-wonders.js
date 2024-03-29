// ==UserScript==
// @name        jofogas.hu Didomi noConsent
// @author      bkil
// @description Fix major functionality (e.g., communication) when various domains are blocked
// @namespace   bkil.hu
// @match       https://*.jofogas.hu/*
// @grant       none
// @version     2022.10.1
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

  let mockStorage = {};
  mockStorage.set = mockStorage.get = mockStorage.remove = mockStorage.register = mockStorage.getRegisteredKeys =
    mockStorage.removeRegisteredKeys = mockStorage.clearRegister = mockStorage.cleanUp = function (v) {
    return null;
  }

  /* if you disable localStorage (cookies) in the browser, window.sessionStorage will throw otherwise */
  angular.module('jofogas').factory('sessionStorageService', [function() {
    return mockStorage;
  }]);
  angular.module('jofogas').factory('localStorageService', [function() {
    return mockStorage;
  }]);

  if (typeof chrome === 'undefined') {
    chrome = new Object();
  }
  if (typeof chrome.storage === 'undefined') {
    chrome.storage = new Object();
  }
  chrome.storage.local = mockStorage;
})();
