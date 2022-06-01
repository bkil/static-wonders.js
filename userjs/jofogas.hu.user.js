// ==UserScript==
// @name        jofogas.hu Didomi noConsent
// @author      bkil
// @description Fix major functionality (e.g., communication) when various domains are blocked
// @namespace   bkil.hu
// @match       https://*.jofogas.hu/*
// @grant       none
// @version     2022.6.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

if (!(typeof window.Didomi === 'object' && window.Didomi !== null)) {
    window.Didomi = new Object();
    window.Didomi.preferences = new Object();
    window.Didomi.preferences.show = function() {};
    window.Didomi.getUserConsentStatusForVendor = function(x) { return false; };
}
