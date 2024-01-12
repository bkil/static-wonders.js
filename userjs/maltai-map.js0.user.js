// ==UserScript==
// @name        maltai map GeoJSON parser
// @author      bkil
// @description JavaScript0
// @namespace   bkil.hu
// @match       https://maltai.hu/tevekenysegkereso
// @grant       none
// @version     2024.1.2
// @license     MIT
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

var baseUrl = 'https://maltai.hu';
var dataUrl = baseUrl + '/tevekenysegkereso';

String.prototype.substring = String.prototype.substring || function(from, to) {
  var o = '';
  while ((from < this.length) && (from < to)) {
    o = o + this.charAt(from);
    from = from + 1;
  }
  return o;
};

String.prototype.split = String.prototype.split || function(s) {
  var a = new Array;
  var j = 0;
  var from = 0;
  var i = this.indexOf(s, from);
  while (i >= 0) {
    a[j] = this.substring(from, i);
    j = j + 1;
    from = i + s.length;
    i = this.indexOf(s, from);
  }
  a[j] = this.substring(from, this.length);
  return a;
};

var nl = String.fromCharCode(10);

function escapeJson(s) {
  var hex = '0123456789abcdef';
  var bu00 = String.fromCharCode(92) + 'u00';
  var o = '"';
  var i = 0;
  var c;
  var n;
  while (i < s.length) {
    n = s.charCodeAt(i);
    if (((n === 34) || (n === 92)) || (n < 32)) {
      o = ((o + bu00) + hex[n >> 4]) + hex[n & 15];
    } else {
      o = o + s.charAt(i);
    }
    i = i + 1;
  }
  return o + '"';
}

var w = new Object;

function parseEntryWithRegex(str, id) {
  var cs = '[ ' + String.fromCharCode(9) + nl + ']*';
  var g = str.match(
    'data-latitude="' + cs + '([0-9.]*)' + cs + '" ' +
    'data-longitude="' + cs + '([0-9.]*)' + cs + '">' + cs +
    '<p class="[^" ]+ csop0([^"]*)">' + cs +
    '<span class="title" data-type="title">([^<>]*)</span><br>' + cs +
    '<span data-type="country" style="display:none;">[^<>]*</span>' + cs +
    '<span data-type="zipcode">([^<>]*)</span>' + cs +
    '<span class="keywords" data-type="city">([^<>]*)</span>,' + cs +
    '<span data-type="address">([^<>]*)</span><br>' + cs +
    '<a class="map-more" href="([^"]*)"'
    );
  if (!g) {
    return '';
  }

  var tasks = g[3].split(' ');
  var i = 0;
  var desc = '';
  var tags = '"amenity":"social_facility"';
  var pri = -1;
  var task;
  while (i < tasks.length) {
    task = w[tasks[i]];
    if (task) {
      if (desc.length) {
        desc = desc + ';' + task.desc;
      } else {
        desc = task.desc;
      }
      if (task.pri > pri) {
        pri = task.pri;
        tags = task.tags;
      }
    }
    i = i + 1;
  }
  tags = tags + ',';
  if (desc.length) {
    desc = '"description":' + escapeJson(desc) + ',';
  }

  return '{"type":"Feature",' +
    '"geometry":{"type":"Point","coordinates":[' + g[2] + ',' + g[1] + ']},' +
    '"properties":{' +
    '"id":' + escapeJson(id) + ',' +
    '"name":' + escapeJson(g[4]) + ',' +
    desc +
    tags +
    '"addr:postcode":' + escapeJson(g[5]) + ',' +
    '"addr:city":' + escapeJson(g[6]) + ',' +
    '"addr:full":' + escapeJson(g[7]) + ',' +
    '"contact:website":' + escapeJson(baseUrl + g[8]) +
    '}}';
}

function parseMaltaiHuMap(h) {
  var ds = h.split('"store"');
  var d;
  var i = 1;
  var ok = '';
  var err = '';
  var r;
  var o = new Object;

  while (i < ds.length) {
    d = ds[i];
    r = parseEntryWithRegex(d, '' + i);
    if (r.length) {
      if (ok.length) {
        ok = ok + ',' + nl;
      }
      ok = ok + r;
    } else {
      err = err + d;
    }
    i = i + 1;
  }
  o.ok = '[' + ok + ']';
  o.err = err;
  return o;
}

function escapeHtmlChar(c) {
  if (c === '&') {
    c = '&amp;';
  } else if (c === '<') {
    c = '&lt;';
  } else if (c === '>') {
    c = '&gt;';
  } else if (c === '"') {
    c = '&quot;';
  } else if (c === "'") {
    c = '&apos;';
  }
  return c;
}

function escapeHtml(h) {
  var t = '';
  var i = 0;
  while (i < h.length) {
    t = t + escapeHtmlChar(h.charAt(i));
    i = i + 1;
  }
  return t;
}

function loaded() {
  if ((typeof document !== 'undefined') && document.documentElement && document.documentElement.innerHTML) {
    var o = parseMaltaiHuMap(document.documentElement.innerHTML);
    document.write('<style>pre{white-space:pre-wrap}html{overflow-wrap:anywhere;line-break:anywhere}</style><pre>' + escapeHtml(o.ok) + '</pre>' + escapeHtml(o.err));
  } else if (typeof fetch !== 'undefined') {
    var f = fetch(dataUrl);
    f = f.then(function(r){ return r.text() });
    f = f.then(function(h) {
      var o = parseMaltaiHuMap(h);
      console.log(o.ok + o.err);
    });
  } else if (typeof require !== 'undefined') {
    var fs = require('fs');
    fs.readFile('maltai.hu__tevekenysegkereso.html', function(e, h) {
      if (!e) {
        var o = parseMaltaiHuMap(h);
        console.log(o.ok + o.err);
      }
    });
  }
}

function entry(desc, pri, tags) {
  var o = new Object;
  o.desc = desc;
  o.pri = pri;
  o.tags = tags;
  return o;
}

function init() {
  if ((typeof window !== 'undefined') && window.location && window.location.href && (window.location.href.indexOf(baseUrl + '/') !== 0)) {
    window.location.href = dataUrl;
    return 0;
  }

  w['feladat23'] = entry('adomány', 2, '"amenity":"social_facility","social_facility":"food_bank"');
  w['feladat3'] = entry('Egészségügyi szolgáltatások', 5, '"amenity":"social_facility","social_facility":"ambulatory_care"');
  w['feladat24'] = entry('élelmiszermentés', 4, '"amenity":"social_facility","social_facility":"food_bank"');
  w['feladat13'] = entry('Foglalkoztatás', 3, '"amenity":"social_facility","social_facility":"workshop"');
  w['feladat4'] = entry('Fogyatékkal élő emberek ellátása', 5, '"amenity":"social_facility","social_facility:for":"disabled","social_facility":"assisted_living"');
  w['feladat5'] = entry('Gyermekek és családok ellátása', 5, '"amenity":"social_facility","social_facility:for":"juvenile","social_facility":"group_home"');
  w['feladat6'] = entry('Hajléktalan emberek ellátása', 5, '"amenity":"social_facility","social_facility:for":"homeless","social_facility":"shelter"');
  w['feladat7'] = entry('Idős emberek ellátása', 4, '"amenity":"social_facility","social_facility:for":"senior","social_facility":"group_home"');
  w['feladat19'] = entry('Jelenlét Program', 2, '"amenity":"social_facility","social_facility:for":"underprivileged","social_facility":"outreach"');
  w['feladat21'] = entry('KORONAVÍRUS', 0, '"amenity":"social_facility"');
  w['feladat17'] = entry('Külföldi misszió', 0, '"amenity":"social_facility"');
  w['feladat8'] = entry('Lakossági szolgáltatások', 1, '"amenity":"social_facility","social_facility":"outreach"');
  w['feladat9'] = entry('Módszertani intézmények', 1, '"amenity":"social_facility","social_facility":"outreach"');
  w['feladat10'] = entry('Oktatás', 1, '"amenity":"school"');
  w['feladat25'] = entry('Raktár', 1, '"amenity":"social_facility","social_facility":"food_bank"');
  w['feladat16'] = entry('Regionális Központ', 1, '"amenity":"social_facility","social_facility":"outreach"');
  w['feladat22'] = entry('szállás', 1, '"tourism":"guest_house"');
  w['feladat11'] = entry('Szenvedélybeteg emberek ellátása', 4, '"amenity":"social_facility","social_facility:for":"drug_addicted","social_facility":"group_home"');
  w['feladat14'] = entry('Szociális Szövetkezet', 0, '"amenity":"social_facility"');
  w['feladat18'] = entry('Támogatott program', 0, '"amenity":"social_facility"');
  w['feladat12'] = entry('Vegyes profilú intézmények', 1, '"amenity":"social_facility","social_facility":"outreach"');
  w['feladat15'] = entry('Vészhelyzet-kezelés', 3, '"amenity":"social_facility","social_facility:for":"victim","social_facility":"outreach"');

  setTimeout(loaded, 0);
}

init();
})();
