// ==UserScript==
// @name        microsoft.com translate search noJS
// @author      bkil
// @description search form & result reveal
// @namespace   bkil.hu
// @match       https://www.microsoft.com/en-us/language/Search*
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

function fixSearchFormSubmit() {
  var form =
    '<form action=Search class=c-search>' +
    '<input name=searchTerm placeholder=Search>' +
    '<input type=submit>' +
    '<input name=langID value=382 type=hidden>' +
    '<input name=Source value=true type=hidden>' +
    '<input name=productid value=undefined type=hidden> </form>';
  document.getElementById('searchbox').parentElement.parentElement.innerHTML = form;
  document.getElementById('searchForm').action = 'Search';
}

function addStyle() {
  var style = document.createElement('style');
  style.innerText = '.lnsearchgrid .m-table .c-table { display: initial }';
  document.body.appendChild(style);
}

fixSearchFormSubmit();
addStyle();
})();
