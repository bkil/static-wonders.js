// ==UserScript==
// @name        github.com raw blob noJS
// @author      bkil
// @description Minimal viewer of files on GitHub
// @namespace   bkil.hu
// @match       https://github.com/*/*
// @grant       none
// @version     2024.3.1
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

function init() {
  var res = document.querySelector('[app-name="react-code-view"], [app-name="commits"], [partial-name="repos-overview"]');
  if (!res) {
    return
  }
  var script = res.querySelector('script[data-target="react-app.embeddedData"], script[data-target="react-partial.embeddedData"]');
  if (!script) {
    return
  }

  var j;
  try {
    j = JSON.parse(script.textContent);
  } catch (err) {
    console.log(err);
    return
  }

  var payload = j ? j.payload ? j.payload : j.props ? j.props.initialPayload ? j.props.initialPayload : null : null : null;
  if (payload) {
    if (payload.blob && payload.blob.rawBlob) {
      res.appendChild(getPre(payload.blob.rawBlob));
    } else if (payload.blob && payload.blob.rawLines) {
      res.appendChild(getPre(payload.blob.rawLines.join('\n')));
    } else if (payload.blob && payload.blob.richText) {
      processRich(res, payload.blob.richText);
    } else if (payload.currentCommit || payload.commitGroups) {
      processCommits(res, payload);
    }

    if (payload.overview && payload.overview.overviewFiles) {
      var d;
      var h;
      var f;
      var i = 0;
      while (i < payload.overview.overviewFiles.length) {
        f = payload.overview.overviewFiles[i];
        if (f.richText) {
          d = document.createElement('div');
          h = document.createElement('div');
          h.textContent = f.path;
          d.appendChild(document.createElement('hr'));
          d.appendChild(h);
          processRich(d, f.richText);
          res.appendChild(d);
        }
        i = i + 1;
      }
    }

    if (payload.tree) {
      processDirectory(res, payload.tree.items);
    }

    if (payload.fileTree && payload.fileTree['']) {
      var bq = document.createElement('blockquote');
      bq.style.opacity = 0.5;
      bq.appendChild(document.createElement('hr'));
      processDirectory(bq, payload.fileTree[''].items);
      res.appendChild(bq);
    }
  }

  var details = document.createElement('details');
  var summary = document.createElement('summary');
  summary.textContent = 'Click to debug JSON';
  details.appendChild(summary);
  details.appendChild(getPre(JSON.stringify(j, null, 2)));
  res.appendChild(details);
}

function processRich(out, text) {
  var div = document.createElement('div');
  div.style.wordWrap = 'anywhere';
  div.style.overflowWrap = 'anywhere';
  div.innerHTML = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/&lt;span class=&quot;[0-9a-z-]+&quot;&gt;/g, '')
    .replace(/&lt;\/span&gt;/g, '')
    .replace(/&lt;svg(?: (?:[^&]|&amp;|&quot;)*?)?&gt;.*?&lt;\/svg&gt;/g, ' svg ')
    .replace(/&lt;g-emoji class=&quot;g-emoji&quot; alias=&quot;\w+&quot; fallback-src=&quot;[^&]+&quot;&gt;([^&]+?)&lt;\/g-emoji&gt;/g, '$1')
    .replace(/&lt;(\/?(?:h[1-6]|strong|em|b|i|details|summary|pre|code|blockquote|ul|ol|li|br|hr|p|table|thead|tbody|th|tr|td|sub|sup))(?: align=&quot;center&quot;| tabindex=&quot;-1&quot;| dir=&quot;auto&quot;| start=&quot;[0-9]+&quot;|( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)*&gt;/g, '<$1$2$3>')
    .replace(/&lt;a( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="#$2"> link </a> $3')
    .replace(/&lt;a(?:( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)?(?: (?:[^&]|&amp;|&quot;)*?)? href=&quot;#((?:[^&]|&amp;)*)&quot;(?:[^&]|&amp;|&quot;)*?&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="#$3">$4</a>')
    .replace(/&lt;a(?:( id=)&quot;user-content-([0-9A-Za-z_-]+)&quot;)?(?: (?:[^&]|&amp;|&quot;)*?)? href=&quot;((?:[^&]|&amp;)*)&quot;(?:[^&]|&amp;|&quot;)*?&gt;(.+?)&lt;\/a&gt;/g, '<a$1$2 href="$3" target=_blank rel=noreferrer>$4</a>')
    .replace(/&amp;lt;/g, '&lt;')
    .replace(/&amp;gt;/g, '&gt;')
    .replace(/&amp;quot;/g, '&quot;')
    .replace(/&amp;amp;/g, '&amp;')
    ;
  out.appendChild(div);
}

function processCommits(out, j) {
  (j.commitGroups ? j.commitGroups : []).forEach(function(cg) {
    var h2 = document.createElement('h2');
    h2.textContent = cg.title;
    out.appendChild(h2);

    (cg.commits ? cg.commits : []).forEach(function(c) {
      var h3 = document.createElement('h3');
      h3.textContent = c.committedDate;
      out.appendChild(h3);
      var a = document.createElement('a');
      a.href = 'commit/' + c.oid;
      a.textContent = c.shortMessage;
      out.appendChild(a);

      processRich(out, c.bodyMessageHtml.replaceAll('\n', '<br>'));
      var as = document.createElement('div');
      as.innerText = c.oid + ' ' + c.authors.map(function(as){ return as.login; }).join(', ');
      out.appendChild(as);
    });
  });

  if (j.filters && j.filters.pagination) {
    var p = j.filters.pagination;
    var commit;
    var cur;
    var prev;
    var next;
    var field;

    if (p.startCursor) {
      field = p.startCursor.split(' ');
      if (field.length === 2) {
        commit = field[0];
        cur = parseInt(field[1]);
        prev = cur >= 36 ? cur - 36 : 0;
      }
    }
    if (p.endCursor) {
      field = p.endCursor.split(' ');
      if (field.length === 2) {
        commit = field[0];
        next = parseInt(field[1]);
      }
    }

    function link(page) {
      if (!commit) {
        return;
      }
      var a = new URL(window.location.href);
      if (commit && page) {
        a.search = 'after=' + encodeURIComponent(commit) + '+' + encodeURIComponent(page);
      } else {
        a.search = '';
      }
      var ae = document.createElement('a');
      ae.textContent = 'Commit ' + page;
      ae.href = a.href;
      var div = document.createElement('div');
      div.appendChild(ae);
      out.appendChild(div);
    }

    if (cur) {
      link(0);
    }
    if (prev && p.hasPreviousPage) {
      link(prev);
    }
    if (next && p.hasNextPage) {
      link(next);
    }
  }
}

function encodePath(path) {
  return encodeURIComponent(path).replaceAll('%2F', '/');
}

function processDirectory(out, dir) {
  if (!Array.isArray(dir)) {
    return
  }
  var r = window.location.href.match('^(https://github\.com/[^/]+/[^/]+)(/?|/(tree|blob)/([^/]+)/.*)$');
  if (!r) {
    return
  }
  var pre = r[1];
  var ref = r[4] ? r[4] : 'master';
  var list = document.createElement('ul');
  dir.forEach(function(item) {
    var a = document.createElement('a');
    if (item.contentType === 'directory') {
      a.href = pre + '/tree/' + encodeURIComponent(ref) + '/' + encodePath(item.path);
      a.textContent = item.path + '/';
    } else {
      a.href = pre + '/blob/' + encodeURIComponent(ref) + '/' + encodePath(item.path);
      a.textContent = item.path;
    }
    var li = document.createElement('li');
    li.appendChild(a);
    list.appendChild(li);
  });
  out.appendChild(list);
}

function getPre(text) {
  var pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordWrap = 'anywhere';
  pre.style.overflowWrap = 'anywhere';
  pre.textContent = text;
  return pre;
}

init();
})();
