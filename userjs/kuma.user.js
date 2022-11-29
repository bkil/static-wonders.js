// ==UserScript==
// @name        status.tchncs.de (Kuma) noJS basic content + JSON
// @author      bkil
// @description Development tool to analyze what is in the HTML
// @namespace   bkil.hu
// @match       https://status.*/status/*
// @grant       none
// @version     2022.11.20
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
  const result = document.createElement('div');
  result.className = 'userscript';

  const json = getJson();

  try {
    const rendered = renderContent(json);
    if (rendered) {
      result.appendChild(rendered);
    }
  } catch (e) {
    throw e;
  } finally {
    addStyle();
    addDebugInfo(result, json);
    document.body.prepend(result);
  }
}

function addStyle() {
  const style = document.createElement('style');
  style.className = 'userscript';
  style.textContent = `
    pre { white-space: pre-wrap; overflow-x: auto }
    summary { cursor: pointer }
    blockquote { border-left-style: solid; padding-left: 1em }
    table, tr, td, th { border-collapse: collapse }
    td { border-left: 1px solid; border-bottom: 1px solid; padding: 0px; white-space: pre-wrap }
    `
  ;
  document.head.appendChild(style);
}

function getJson() {
  const script = document.getElementById('preload-data');
  if (!script) {
    return "error: can't find element with ID 'preload-data'";
  }

  const line = script.text
    .replace(/^\s*window\.preloadData = (\{.*\});\s*$/, '$1')
    .replaceAll('"', '\\"')
    .replace(/([^\\])'/g, '$1"')
    .replace(/([^\\])'/g, '$1"')
    .replaceAll("\\'", "'")
    ;

  try {
    return JSON.parse(line);
  } catch (e) {
    return e + "\n" + line;
  }
}

function renderContent(json) {
  return renderJson(
      json,
      [{"config": ["title", "description"]}, {"incident": ["style", "title", "content", "createdDate", "lastUpdatedDate"]}, {"publicGroupList": ["name", {"monitorList": ["name", "url", {"tags": ["name"]}]}]}]);
}

function renderJson(json, rules) {
  if (typeof rules !== 'object') {
    console.log("error: can't parse rule");
    console.log(rules);
    return null;
  }

  if (typeof json !== 'object') {
    console.log("error: can't traverse non-object according to rules");
    console.log(json);
    console.log(rules);
    return null;
  }
  const arules = Array.isArray(rules) ? rules : [rules];

  const table = document.createElement('table');
  const body = table.createTBody();
  let foundRow = false;

  if (Array.isArray(json)) {
    const [head, ...values] = arules;
    const keys = Array.isArray(head) ? head : [head];

    for (const index in json) {
      const item = json[index];
      const row = table.insertRow();

      let keyBranch = renderJson(item, keys);
      if (!keyBranch) {
        keyBranch = document.createTextNode(index);
      }
      row.insertCell().appendChild(keyBranch);

      const valueBranch = renderJson(item, values);
      if (valueBranch) {
        row.insertCell().appendChild(valueBranch);
      }
      foundRow = true;
    }

  } else {
    for (const rule of arules) {
      let key;
      let branch = null;
      if (typeof rule === 'string') {
        key = rule;
        if (json[key] !== undefined) {
          branch = document.createTextNode(json[key]);
        }
      } else {
        const pair = Object.entries(rule)[0];
        key = pair[0];
        branch = renderJson(json[key], pair[1]);
      }

      if (branch) {
        const row = body.insertRow();
        row.insertCell().textContent = key;
        row.insertCell().appendChild(branch);
        foundRow = true;
      }
    }
  }

  if (foundRow) {
    return table;
  } else {
    return null;
  }
}

function addDebugInfo(result, json) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = '(click to see debug JSON)';
  details.appendChild(summary);

  addTitleDescription(details);
  addJson(details, json);
  result.appendChild(details);
}

function addTitleDescription(result) {
  const title = document.head.getElementsByTagName('title')[0];
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent;
    result.appendChild(h1);
  }

  const meta = document.head.querySelector('meta[name="description"]');
  if (meta) {
    const cite = document.createElement('blockquote');
    cite.textContent = meta.content;
    result.appendChild(cite);
  }
}

function addJson(result, json) {
  const code = document.createElement('pre');
  if (typeof json === 'string') {
    code.textContent = json;
  } else {
    code.textContent = JSON.stringify(json, null, 2);
  }
  result.appendChild(code);
}

})();
