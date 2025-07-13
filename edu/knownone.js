'use strict';
// JS1
function strEqual(u, v) {
  return !(u.length - v.length) && !u.indexOf(v);
}

if (strEqual(typeof st, 'undefined')) {
var st = new Object;
var nl = String.fromCharCode(10);
var day = 3600 * 24;
}

// JS1
function parseIntPlus(s) {
  if (!strEqual(typeof parseInt, 'undefined')) {
    return parseInt(s);
  }
  var k = NaN;
  if (!strEqual(typeof s, 'string')) {
    return k;
  }
  var i = -1;
  var c;
  while (s.length > (i = i + 1)) {
    c = s.charCodeAt(i) - 48;
    if ((0 > c) || (c > 9)) {
      return k;
    }
    if (!i) {
      k = 0;
    }
    k = (k * 10) + c;
  }
  return k;
}

// JS1
function String_substring(th, from, to) {
  if (th.substring) {
    return th.substring(from, to);
  } else {
    var o = '';
    while ((from < th.length) && (from < to)) {
      o = o + th.charAt(from);
      from = from + 1;
    }
    return o;
  }
}

// JS1
function String_lastIndexOf(s, c) {
  if (s.lastIndexOf) {
    return s.lastIndexOf(c);
  }
  var i = s.length - 1;
  var n = c.charCodeAt(0);
  while ((i >= 0) && (s.charCodeAt(i) - n)) {
    i = i - 1;
  }
  return i;
}

// ES1, NS3
function String_split(th, d) {
  if (th.split) {
    return th.split(d);
  } else {
    var a = new Array;
    var j = 0;
    var from = 0;
    var i = th.indexOf(d, from);
    while (i >= 0) {
      a[j] = String_substring(th, from, i);
      j = j + 1;
      from = i + d.length;
      i = th.indexOf(d, from);
    }
    a[j] = String_substring(th, from, th.length);
    return a;
  }
}

// ES5
function String_trim(th) {
  function isWs(i) {
    var n = th.charCodeAt(i);
    return !(n - 32) || !(n - 9) || !(n - 10);
  }
  if (th.trim) {
    return th.trim();
  } else {
    var i = 0;
    while ((i < th.length) && isWs(i)) {
      i = i + 1;
    }
    var j = th.length - 1;
    while ((j >= i) && isWs(j)) {
      j = j - 1;
    }
    return String_substring(th, i, j + 1);
  }
}

// JS1
function getRandomBits(n) {
  var x = st.random;
  var i = n + 1;
  while (i = i - 1) {
    x = (((x >> 30) ^ (x >> 27)) & 1) ^ ((x & 1073741823) << 1);
  }
  st.random = x;
  if (n > 31) {
    n = 31;
  }
  return x & ((1 << n) - 1);
}

function getRandom2(m, b) {
  return getRandomBits(b) % m;
}

// JS1
function Array_toString(v) {
  var o = '';
  var i = -1;
  while (v.length > (i = i + 1)) {
    if (o) {
      o = o + ',';
    }
    o = o + v[i];
  }
  return o;
}

function swap(v, i, j) {
  var x = v[i];
  v[i] = v[j];
  v[j] = x;
}

// ES3
function Array_sort_top(v, compare, m) {
  if (v.sort && v.slice) {
    v = v.slice(0, v.length);
    v.sort(compare);
    return v.slice(0, m);
  }
  var n = v.length;
  if (!m || (m > n)) {
    m = n;
  }
  var o = new Array;
  var a;
  var b;
  var j;
  var i = -1;
  while (m > (i = i + 1)) {
    a = v[i];
    j = i;
    while (n > (j = j + 1)) {
      if (compare(a, b = v[j]) > 0) {
        swap(v, i, j);
        a = b;
      }
    }
    o[i] = a;
  }
  return o;
}

// ES3, NS5?
function encodeURIComponent_(s) {
  if (!strEqual(typeof encodeURIComponent, 'undefined')) {
    return encodeURIComponent(s);
  }
  var zero = String.fromCharCode(0);
  var i = 0;
  var safeList = "!'()*-._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var safe = zero;
  var hex = '0123456789abcdef';
  while (127 > (i = i + 1)) {
    if (0 > safeList.indexOf(String.fromCharCode(i))) {
      safe = safe + zero;
    } else {
      safe = safe + '1';
    }
  }

  var o = '';
  i = -1;
  var n;
  var c;
  while (1) {
    c = s.charAt(i = i + 1);
    while (safe.charCodeAt(n = c.charCodeAt(0))) {
      o = o + c;
      c = s.charAt(i = i + 1);
    }
    if (isNaN(n)) {
      return o;
    }
    if (128 > n) {
      c = hex[n >> 4] + hex[n & 15];
      o = o + '%';
    }
    o = o + c;
  }
}

function shuffle(v) {
  var n = v.length;
  var m = n - 1;
  var i = -1;
  while (m > (i = i + 1)) {
    swap(v, i, i + getRandom2(n - i, 8));
  }
}

function Array_copy(a, v, m) {
  var n = v.length;
  if ((m>-1) && (n > m)) {
    n = m;
  }
  var j = a.length - 1;
  var i = -1;
  while (n > (i = i + 1)) {
    a[j = j + 1] = v[i];
  }
}

function removeStarting(s, t) {
  var i = s.indexOf(t);
  if (i >= 0) {
    s = String_substring(s, 0, i);
  }
  return s;
}

function removeAfter(s, t) {
  var i = s.indexOf(t);
  if (i >= 0) {
    s = String_substring(s, 0, i + t.length);
  }
  return s;
}

function fillSafeHtm() {
  if (st.safeHtm) {
    return undefined;
  }
  var zero = String.fromCharCode(0);
  var enc = new Array;
  enc[0] = zero;
  enc[34] = '&' + 'quot;';
  enc[38] = '&' + 'amp;';
  enc[39] = '&' + 'apos;';
  enc[60] = '&' + 'lt;';
  enc[62] = '&' + 'gt;';
  st.encHtm = enc;

  var safe = '';
  var i = -1;
  while (128 > (i = i + 1)) {
    if (enc[i]) {
      safe = safe + zero;
    } else {
      safe = safe + '1';
    }
  }
  st.safeHtm = safe;
}

function escapeHtm(h) {
  fillSafeHtm();
  var s = st.safeHtm;
  var enc = st.encHtm;
  var o = '';
  var i = -1;
  var n;
  var c;
  while (1) {
    c = h.charAt(i = i + 1);
    while (s.charCodeAt(n = c.charCodeAt(0))) {
      o = o + c;
      c = h.charAt(i = i + 1);
    }
    if (isNaN(n)) {
      return o;
    }
    if (128 > n) {
      c = enc[n];
    }
    o = o + c;
  }
}

function onBeforeUnload(e) {
  if (st.unsaved) {
    e.preventDefault();
    return e.returnValue = 'Close without saving progress or changes?';
  }
}

function refreshUnsaved() {
  if (st.unsaved) {
    if (window.addEventListener) {
      window.onbeforeunload = onBeforeUnload;
    }
  }
}

function setUnsaved() {
  if (!st.unsaved) {
    st.unsaved = 1;
    refreshUnsaved();
  }
}

function clearUnsaved() {
  st.unsaved = 0;
  window.onbeforeunload = undefined;
}

function writeHtmBody(body, cls) {
  if (st.docClosed) {
    var h = '<head>';
    if (document.documentElement && document.documentElement.innerHTML) {
      h = removeAfter(document.documentElement.innerHTML, '<' + '!-- --' + '>');
      h = removeAfter(h, '</head>');
    }
    if (cls) {
      cls = ' class=' + cls;
    }
    h = '<!DOCTYPE html><html lang=en>' + h + '</head><body' + cls + '>' + body + '<' + '/body><' + '/html>';
    document.write(h);
    document.close();
  } else {
    document.write(body);
  }
  if (window.f && window.f.t && window.f.t.focus) {
    window.f.t.focus();
  }
  refreshUnsaved();
}

function writeHtm(body) {
  writeHtmBody(body, '');
}

function savedCardStats(c) {
  var a = new Array;
  a[0] = c.grade;
  a[1] = c.next_rep;
  a[2] = c.last_rep;
  a[3] = c.easiness;
  a[4] = c.acq_reps;
  a[5] = c.ret_reps;
  a[6] = c.lapses;
  a[7] = c.acq_reps_since_lapse;
  a[8] = c.ret_reps_since_lapse;
  return Array_toString(a);
}

function getSaveHtm() {
  var s = st.beg;
  var c;
  var t;
  var i = -1;
  var n = st.card.length;
  while (n > (i = i +1)) {
    c = st.card[i];
    if (!c.del) {
      s = s + '<' + 'h2>' + c.q + '</h2>' + c.a;
      if (!strEqual(typeof c.grade, 'undefined')) {
        t = savedCardStats(c);
        s = s + '<br>' + t;
      }
      s = s + nl;
    }
  }
  s = s + st.tail;
  clearUnsaved();
  return s;
}

function getReturnToMenu() {
  return '<a href=javascript:screenMenu() class=a accesskey=m>return to Menu</a>';
}

function screenOverview(cards) {
  var card;
  var s = getReturnToMenu();
  var n = cards.length;
  var t = s + '<p class=p>' + n + ' facts';
  var i = -1;
  while (n > (i = i + 1)) {
    card = cards[i];
    t = t + '<' + 'h2>';
    if (card.q) {
      t = t + card.q;
    } else {
      t = t + '(' + card.id + ')';
    }
    t = t + '</h2><a href=javascript:screenEdit(' + card.id + ',"screenOrderedOverview()") class=a>';
    if (card.a) {
      t = t + card.a;
    } else {
      t = t + '(answer)';
    }
    t = t + '</a>';
    if (card.del) {
      t = t + '<br>(deleted)';
    }
    t = t + nl;
  }
  t = t + '<p class=p>' + s;
  writeHtm(t);
}

function screenOrderedOverview() {
  screenOverview(st.card);
}

function screenShuffledOverview() {
  var cards = new Array;
  Array_copy(cards, st.card, -1);
  shuffle(cards);
  screenOverview(cards);
}

function screenSaveBody() {
  var s = escapeHtm(getSaveHtm());
  var t = getReturnToMenu();
  s = t + '<p class=p>' + s;
  writeHtmBody(s, 'savebody');
}

function screenSavePre() {
  var s = escapeHtm(getSaveHtm());
  var t = getReturnToMenu();
  s = t + '<pre>' + s + '</pre>';
  writeHtm(s);
}

function screenSaveTextarea() {
  var s = escapeHtm(getSaveHtm());
  var t = getReturnToMenu();
  s = t + '<p class=p><form action=javascript:screenMenu()>' +
    '<textarea class=savetext rows=8 cols=32>' + s + '</textarea><p class=p>' +
    '<input type=submit value="return to Menu" accesskey=m></form>';
  writeHtm(s);
}

function screenSaveUri() {
  var s = encodeURIComponent_(getSaveHtm());
  s = 'data:application/octet-stream;charset=binary,' + s;
  s = escapeHtm(s);
  var name = removeStarting(window.location.href, '#');
  var i = String_lastIndexOf(name, '/');
  if (i >= 0) {
    name = String_substring(name, i + 1, name.length);
  }
  name = escapeHtm(name);
  s = '<a download="' + name + '" target=_blank href="' + s + '#/' + name + '" class=a accesskey=k>' + name + '</a> [K]';
  var t = getReturnToMenu();
  s = s + '<p class=p>' + t;
  writeHtm(s);
}

function screenSave() {
  writeHtm(
    '<h2>save Progress</h2>' +
    '<a href=javascript:screenSaveUri() class=a accesskey=w>doWnload as data URI</a><p class=p>' +
    '<a href=javascript:screenSaveBody() class=a accesskey=b>copy from Body</a><p class=p>' +
    '<a href=javascript:screenSavePre() class=a accesskey=y>copY from preformatted block</a><p class=p>' +
    '<a href=javascript:screenSaveTextarea() class=a accesskey=x>copy from teXtarea</a><p class=p>' +
    getReturnToMenu());
}

function cmpInterval(x,y) {
  return (x.next_rep-x.last_rep) - (y.next_rep-y.last_rep);
}

function cmpIntervalNeg(x,y) {
  return (y.next_rep-y.last_rep) - (x.next_rep-x.last_rep);
}

function cmpNextRep(x,y) {
  return x.next_rep - y.next_rep;
}

function makeQueue() {
  st.queueAhead = 0;
  st.queueI = 0;
  var t = st.now = ((new Date)/1000)|0;
  var q1=new Array;
  var q2a=new Array;
  var q2b=new Array;
  var q3a=new Array;
  var q3b=new Array;
  var q4=new Array;
  var q5=new Array;
  var i1=-1;
  var i2a=-1;
  var i2b=-1;
  var i3a=-1;
  var i3b=-1;
  var i4=-1;
  var i5=-1;
  var c;
  var i = -1;
  var n = st.card.length;
  while (n>(i=i+1)) {
    c=st.card[i];
    if (c.del) {
    } else if (strEqual(typeof c.grade, 'undefined')) {
      q4[i4=i4+1]=c;
    } else if (!c.grade) {
      if (c.lapses) {
        q2b[i2b=i2b+1]=c;
      } else {
        q3b[i3b=i3b+1]=c;
      }
    } else if (!(c.grade-1)) {
      if (c.lapses) {
        q2a[i2a=i2a+1]=c;
      } else {
        q3a[i3a=i3a+1]=c;
      }
    } else {
      if (c.next_rep>t) {
        q5[i5=i5+1]=c;
      } else {
        q1[i1=i1+1]=c;
      }
    }
  }

  if (q1.length) {
    return st.queue = Array_sort_top(q1, cmpInterval, 50);
  }
  var q = Array_sort_top(q2a, cmpIntervalNeg, 10);
  Array_copy(q, Array_sort_top(q2b, cmpIntervalNeg, 10 - q.length), -1);
  Array_copy(q, q3a, 10 - q.length);
  Array_copy(q, q3b, 10 - q.length);
  shuffle(q);
  Array_copy(q, q4, 10 - q.length);
  if (q.length) {
    return st.queue = q;
  }
  st.queueAhead = 1;
  return st.queue = Array_sort_top(q5, cmpNextRep, 50);
}

function screenAhead() {
  writeHtm('You are finished for today<p class=p>' +
    '<a href=javascript:screenQuestion(screenQuestion) class=a accesskey=h>learn aHead of schedule</a><p class=p>' +
    getReturnToMenu());
}

function screenQuestion(y) {
  var q = st.queue[st.queueI];
  if (q) {
    writeHtm('<h2>' + q.q + '</h2><p class=p>' +
      '<a href=javascript:screenAnswer() class=a accesskey=r>Reveal answer</a>');
  } else {
    makeQueue();
    if (st.queueAhead) {
      screenAhead();
    } else {
      y(y);
    }
  }
}

function screenLearn() {
  if (st.queueAhead) {
    screenAhead();
  } else {
    screenQuestion(screenQuestion);
  }
}

function screenAnswer() {
  var q = st.queue[st.queueI];
  if (!q) {
    return screenMenu();
  }
  writeHtm('<h2>' + q.q + '</h2><h3>' + q.a + '</h3>' +
    '<a href=javascript:screenGrade(0) class=a accesskey=u>grade 0 [U]</a><p class=p>' +
    '<a href=javascript:screenGrade(1) class=a accesskey=v>grade 1 [V]</a><p class=p>' +
    '<a href=javascript:screenGrade(2) class=a accesskey=w>grade 2 [W]</a><p class=p>' +
    '<a href=javascript:screenGrade(3) class=a accesskey=x>grade 3 [X]</a><p class=p>' +
    '<a href=javascript:screenGrade(4) class=a accesskey=y>grade 4 [Y]</a><p class=p>' +
    '<a href=javascript:screenGrade(5) class=a accesskey=z>grade 5 [Z]</a><p class=p>' +
    '<a href=javascript:screenEdit(' + q.id +',"screenQuestion(screenQuestion)") class=a accesskey=i>edIt</a><p class=p>' +
    getReturnToMenu());
}

function perturbedInterval(interval) {
  var d = 0;
  if (!interval) {
  } else if ((10*day) >= interval) {
    d = getRandom2(day, 31);
  } else if ((60*day) >= interval) {
    d = getRandom2(6*day, 31) - (3*day);
  } else {
    var i = (day / 10) | 0;
    d = getRandom2(i, 31) - (i >> 1);
  }
  return interval + d;
}

function screenGrade(g) {
  var q = st.queue[st.queueI];
  if (!q) {
    return screenMenu();
  }
  var late = 0;
  var scheduledInterval = 0;
  var actualInterval = 0;
  var newInterval = 0;
  if (q.next_rep) {
    if ((st.now - day) >= q.next_rep) {
      late = 1;
    } else if (q.next_rep > st.now) {
      late = -1;
    }
    scheduledInterval = q.next_rep - q.last_rep;
    actualInterval = st.now - q.last_rep;
    if (2 > q.grade) {
      q.acq_reps = q.acq_reps + 1;
      q.acq_reps_since_lapse = q.acq_reps_since_lapse + 1;
      if (!(g - 2)) {
        newInterval = day;
      } else if (!(g - 3)) {
        newInterval = getRandom2(3, 4) * day;
        if (!newInterval) {
          newInterval = day;
        }
      } else if (!(g - 4)) {
        newInterval = getRandom2(3, 4) * day;
        if (!newInterval) {
          newInterval = 2 * day;
        }
      } else if (!(g - 5)) {
        newInterval = 2 * day;
      }
    } else {
      q.ret_reps = q.ret_reps + 1;
      if (2 > g) {
        q.lapses = q.lapses + 1;
        q.acq_reps_since_lapse = 0;
        q.ret_reps_since_lapse = 0;
      } else {
        if (late >= 0) {
          if (!(g-2)) {
            q.easiness = q.easiness - 16;
          } else if (!(g-3)) {
            q.easiness = q.easiness - 14;
          } else if (!(g-5)) {
            q.easiness = q.easiness + 10;
          }
          if (13 > q.easiness) {
            q.easiness = 13;
          }
        }
        if (q.ret_reps_since_lapse) {
          if (!(g-4)) {
            newInterval = ((actualInterval / 100) | 0) * q.easiness;
          } else if (!(g-5)) {
            if (0 > late) {
              newInterval = scheduledInterval;
            } else {
              newInterval = ((actualInterval / 100) | 0) * q.easiness;
            }
          } else if (0>=late) {
            newInterval = ((actualInterval / 100) | 0) * q.easiness;
          } else {
            newInterval = scheduledInterval;
          }
          if (day > newInterval) {
            newInterval = day;
          }
        } else {
          newInterval = 6 * day;
        }
        q.ret_reps_since_lapse = q.ret_reps_since_lapse + 1;
      }
    }
  } else {
    q.easiness = 250;
    q.acq_reps = 1;
    q.acq_reps_since_lapse = 1;
    q.ret_reps = 0;
    q.lapses = 0;
    q.ret_reps_since_lapse = 0;
    newInterval = st.initialInterval[g];
  }
  newInterval = perturbedInterval(newInterval);
  q.grade = g;
  q.last_rep = ((new Date) / 1000) | 0;
  if (g > 1) {
    q.next_rep = (((q.last_rep + newInterval) / day) | 0) * day;
  } else {
    q.next_rep = q.last_rep;
  }
  setUnsaved();
  st.queueI = st.queueI + 1;
  screenQuestion(screenQuestion);
}

function screenEdit(i, b) {
  var q = st.card[i];
  var qs = q.q;
  if (!qs) {
    qs = '(question)';
  }
  var a = q.a;
  if (!a) {
    a = '(answer)';
  }
  var h = '<h2>edIt card</h2>' +
    '<a href=javascript:screenEditQuestion(' + i + ',"' + b + '") class=a accesskey=q>edit Question: ' + qs + '</a><p class=p>' +
    '<a href=javascript:screenEditAnswer(' + i + ',"' + b + '") class=a accesskey=a>edit Answer: ' + a + '</a><p class=p>';
  if (q.del) {
    h = h + '<a href=javascript:screenUndeleteCard(' + i + ',"' + b + '") class=a accesskey=u>Undelete</a><p class=p>';
  } else {
    h = h + '<a href=javascript:screenDeleteCard(' + i + ',"' + b + '") class=a accesskey=t>deleTe</a><p class=p>';
  }
  h = h +
    '<a href=javascript:screenCloneCard(' + i + ',"' + b + '") class=a accesskey=c>Clone</a><p class=p>' +
    '<a href=javascript:screenNewCard("' + b + '") class=a accesskey=n>New</a><p class=p>' +
    '<a href=javascript:' + b + ' class=a accesskey=o>dOne</a>';
  writeHtm(h);
}

function screenDeleteCard(i, b) {
  var q = st.card[i];
  q.del = 1;
  setUnsaved();
  screenEdit(i, b);
}

function screenUndeleteCard(i, b) {
  var q = st.card[i];
  q.del = 0;
  setUnsaved();
  screenEdit(i, b);
}

function screenCloneCard(i, b) {
  var p = st.card[i];
  var q = new Object;
  var j = st.card.length;
  q.id = j;
  q.q = p.q + ' ' + j;
  q.a = p.a;
  st.card[j] = q;
  setUnsaved();
  screenEdit(j, b);
}

function screenNewCard(b) {
  var q = new Object;
  var j = st.card.length;
  q.id = j;
  q.q = '';
  q.a = '';
  st.card[j] = q;
  setUnsaved();
  screenEdit(j, b);
}

function screenEditedQuestion(i, b) {
  var q = st.card[i];
  q.q = escapeHtm(String_trim(window.f.t.value));
  setUnsaved();
  screenEdit(i, b);
}

function screenEditQuestion(i, b) {
  var q = st.card[i];
  writeHtm('<form action=javascript:screenEditedQuestion(' + i + ',"' + b + '") name=f>edit Question' +
    '<textarea name=t>' + q.q + '</textarea>' +
    '<input type=submit value=Submit accesskey=s></form>');
}

function screenEditedAnswer(i, b) {
  var q = st.card[i];
  q.a = escapeHtm(String_trim(window.f.t.value));
  setUnsaved();
  screenEdit(i, b);
}

function screenEditAnswer(i, b) {
  var q = st.card[i];
  writeHtm('<form action=javascript:screenEditedAnswer(' + i + ',"' + b + '") name=f>edit Answer' +
    '<textarea name=t>' + q.a + '</textarea>' +
    '<input type=submit value=Submit accesskey=s></form>');
}

function screenMenu() {
  writeHtm(
    '<' + 'h2 id=menu>Menu</h2>' +
    '<a href=javascript:screenLearn() class=a accesskey=l>Learn</a><p class=p>' +
    '<a href=javascript:screenOrderedOverview() class=a accesskey=v>ordered data overView</a><p class=p>' +
    '<a href=javascript:screenShuffledOverview() class=a accesskey=j>Jittered data overview</a><p class=p>' +
    '<a href=javascript:screenNewCard("screenMenu()") class=a accesskey=n>New card</a><p class=p>' +
    '<a href=javascript:screenPurge() class=a accesskey=g>purGe all cards</a><p class=p>' +
    '<a href=javascript:screenSave() class=a accesskey=p>save Progress</a><p class=p>');
}

function screenPurgeConfirmed() {
  st.card = new Array;
  clearUnsaved();
  makeQueue();
  screenMenu();
}

function screenPurge() {
  if (st.unsaved) {
    writeHtm('<h2>purGe all cards</h2>' +
      'You have unsaved changes. Please confirm that you really want to delete your progress and all cards.<p class=p>' +
      '<a href=javascript:screenPurgeConfirmed() class=a accesskey=z>Zap all cards</a><p class=p>' +
      getReturnToMenu());
  } else {
    screenPurgeConfirmed();
  }
}

function sliceBegTail(h) {
  var j = h.indexOf('<' + '/body>');
  if (j >= 0) {
    h = String_substring(h, 0, j)
  }
  j = h.indexOf('<body');
  if (0 > j) {
    j = h.indexOf('<h2');
  }
  st.tail = st.addScript + '<' + '/body>';
  h = h + st.tail;
  var i = h.indexOf('<script');
  if (i >= 0) {
    if ((0 > j) || (j > i))  {
      var k = h.indexOf('<' + '/script>', i);
      if ((k >= 0) && (j > k)) {
        h = String_substring(h, 0, i) + String_substring(h, k + 9, h.length);
        j = j - k - i - 9;
      }
    }
    if (j >= 0) {
      i = h.indexOf('<script', j);
    }
    if (i >= 0) {
      st.tail = String_substring(h, i, h.length);
      h = String_substring(h, 0, i);
    }
  }
  st.tail = st.tail + '<' + '/html>' + nl;
  i = h.indexOf('<' + 'h2>');
  if (0 > i) {
    st.beg = h;
  } else {
    st.beg = String_substring(h, 0, i);
  }
  st.beg = String_trim(st.beg) + nl;
  st.beg = '<' + '!DOCTYPE html><' + 'html lang=en>' +  st.beg;
  return h;
}

function loadHtm(h) {
  h = sliceBegTail(h);
  var j = -1;
  var card;
  var a;
  var n;
  var cards = new Array;
  var cs = String_split(h, '<' + 'h2>');
  var i = 0;
  while (cs.length > (i = i + 1)) {
    card = new Object;
    card.id = i - 1;
    a = String_trim(cs[i]);
    a = String_split(a, '</' + 'h2>');
    card.q = String_trim(a[0]);
    a = String_split(String_trim(a[1]), '<br>');
    card.a = String_trim(a[0]);
    if (a[1] && (a = String_trim(a[1]))) {
      a = String_split(a, ',');
      n = a.length;
      card.grade = parseIntPlus(a[0]);
      card.next_rep = parseIntPlus(a[1]);
      card.last_rep = parseIntPlus(a[2]);
      card.easiness = parseIntPlus(a[3]);
      card.acq_reps = parseIntPlus(a[4]);
      card.ret_reps = parseIntPlus(a[5]);
      card.lapses = parseIntPlus(a[6]);
      card.acq_reps_since_lapse = parseIntPlus(a[7]);
      card.ret_reps_since_lapse = parseIntPlus(a[8]);
    }
    cards[j = j + 1] = card;
  }
  st.card = cards;
}

function loaded() {
  if (!st.doc) {
    st.doc = document.documentElement.innerHTML;
  }
  loadHtm(st.doc);
  if (st.inHead) {
    screenOrderedOverview();
  }
}

function screenInitialMenu() {
  var h = document.documentElement.innerHTML;
  var i = h.indexOf('<body');
  var j = h.indexOf('<' + 'script');
  if ((j >= 0) && ((0 > i) || (i > j))) {
    h = String_substring(h, j, h.length);
    j = h.indexOf('<' + '/script>');
    if (j >= 0) {
      h = String_substring(h, 0, j + 9);
    }
    st.addScript = h;
    st.inHead = 1;
  } else {
    st.addScript = '';
    st.doc = h;
    screenMenu();
  }
}

function init() {
  if (st.random) {
    return undefined;
  }
  st.random = (new Date) % 2147483648;
  if (!st.random) {
    st.random = 1;
  }
  getRandomBits(128);

  var a = new Array;
  a[0] = 0;
  a[1] = 0;
  a[2] = day;
  a[3] = 3 * day;
  a[4] = 4 * day;
  a[5] = 7 * day;
  st.initialInterval = a;
  st.queue = new Array;
  st.queueI = 0;
  screenInitialMenu();
  setTimeout(loaded, 0);
  st.docClosed = 1;
}

init();
