// ==UserScript==
// @name        microsoft.com translate search noJS
// @author      bkil
// @description search form & result reveal
// @namespace   bkil.hu
// @match       https://www.microsoft.com/en-us/language/Search*
// @grant       none
// @version     2022.3.9
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';
main();

function main() {
  fixSearchFormSubmit();
  addStyle();
}

function fixSearchFormSubmit() {
  var text = document.getElementById('searchbox');
  text.type = 'text';
  text.name = 'searchTerm';

  var form = text.parentElement;
  form.action = 'Search';

  var submit = document.createElement('input');
  submit.type = 'submit';
  form.appendChild(submit);

  var language = document.createElement('input');
  language.type = 'hidden';
  language.name = 'langID';
  language.setAttribute('value', '382');
  form.appendChild(language);

  var source = document.createElement('input');
  source.type = 'hidden';
  source.name = 'Source';
  source.value = 'true';
  source.setAttribute('checked', '');
  form.appendChild(source);

  var product = document.createElement('input');
  product.type = 'hidden';
  product.name = 'productid';
  product.setAttribute('value', 'undefined');
  form.appendChild(product);

  // remove button to make `enter` work
  var uselessButton = form.getElementsByTagName('button');
  if (uselessButton) {
    form.removeChild(uselessButton[0]);
  }

  var topForm = document.getElementById('searchForm');
  if (topForm) {
    topForm.action = 'Search'
  }
}

function addStyle() {
  var style = document.createElement('style');
  style.className = 'userscript';
  style.innerText = '.lnsearchgrid .m-table .c-table { display: initial }';
  document.body.appendChild(style);
}

})();
