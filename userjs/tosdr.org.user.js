// ==UserScript==
// @name        tosdr.org noJS search
// @author      bkil
// @description
// @namespace   bkil.hu
// @match       https://tosdr.org/*
// @grant       none
// @version     2023.01.02
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function main() {
  const search = document.querySelector('#ratingsearch');
  if (search) {
    search.onkeypress = (e) => {
      if (e.key === "Enter") {
        onSearch(search.value);
      }
    };
  }
}

function onSearch(text) {
  const services = document.querySelector('#services');
  services.innerHTML = `Searching for ${text}...`;

  fetch(
    `https://api.tosdr.org/search/v4/?query=${encodeURI(text)}`,

    (result) => {
      const div = document.createElement('div');
      const pre = document.createElement('pre');
      pre.style = 'white-space: pre-wrap; overflow-x: auto';

      services.innerHTML = '';
      services.appendChild(div);
      services.appendChild(pre);

      let json;
      try {
        json = JSON.parse(result);
      } catch (e) {
        pre.textContent = e + "\n" + result;
      }
      if (json) {
        pre.textContent = JSON.stringify(json, null, 2);
        addResults(div, json);
      }
    },

    (e) => {
      console.log(e);
      services.innerHTML = `Search failed for ${text}`;
    }
  );
}

function addResults(services, json) {
  if (!json?.parameters?.services?.length > 0) {
    return;
  }

  const list = document.createElement('ul');
  for (const [i, service] of json.parameters.services.entries()) {
    const href = service?.links?.crisp?.service;
    if (!href) {
      continue;
    }
    const el = document.createElement('li');
    const a = document.createElement('a');
    a.href= href;
    a.innerText = (service?.name ?? i) + ' - ' + (service?.rating?.human ?? '');
    el.appendChild(a);
    list.appendChild(el);
  }
  services.appendChild(list);
}

function fetch(url, ok, err) {
  const x = new XMLHttpRequest();
  x.open('GET', url);
  x.onload = (e) => ok(x.responseText);
  x.onerror = err;
  x.ontimeout = err;
  x.timeout = 10000;
  x.send();
}

main();
})();
