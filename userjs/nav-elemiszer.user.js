// ==UserScript==
// @name        NAV vending checker
// @author      https://codeberg.org/urbalazs
// @description Improve ergonomics of input field
// @namespace   bkil.hu
// @match       https://nav.gov.hu/adatbazisok/elemiszer_ertekesites
// @grant       none
// @version     2024.4.1
// @license     SPDX-License-Identifier: CC-BY-SA-4.0
// @homepageURL https://gitlab.com/bkil/static-wonders.js
// @homepageURL https://github.com/bkil/static-wonders.js
// @supportURL  https://gitlab.com/bkil/static-wonders.js/issues
// @noframes
// ==/UserScript==

(function() {
'use strict';

var url = 'https://nav.gov.hu/adatbazisok/elemiszer_ertekesites';
if (window.location.href.indexOf(url)) {
  window.location.href = url + '#please-press-bookmarklet-again';
  return 1;
}

var vendingRegs;
var vendingNum;
var vendingTimer;

$('input[aria-label="Automata regisztrációs száma*"]').after('<div id="nav-response"></div>').after('<button id="mybutton">Tömeges lekérdezés</button>').after('<textarea id="mytextarea" style="height:200px"></textarea>');
$('#mybutton').on("click", function() {
	vendingNum   = 0;
	vendingRegs  = $('#mytextarea').val().trim().split('\n');
	vendingTimer = setInterval(function() {
		if (vendingNum == vendingRegs.length) {
			clearInterval(vendingTimer);
		}
		else {
			$.get( "https://backend-www05.nav.gov.hu/api/automata", { azonosito: vendingRegs[vendingNum++], t: grecaptcha.getResponse() } )
			.done(function( data ) {
				$("#nav-response").append( '<p>' + data.content[0].regszam + "\t" + data.content[0].uzemeltetesiHely + '</p>' );
			}, "json");
		}
	}, 300);
});

})();
