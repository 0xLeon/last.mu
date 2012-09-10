// ==UserScript==
// @name           last.mu
// @description    Get back the comfort to /mu/
// @version        {version}
// @author         Stefan Hahn
// @copyright      2012, Stefan Hahn
// @license        GNU General Public License, version 2
// @namespace      com.leon.userscripts.4chan.lastMu
// @include        http*://boards.4chan.org/mu/*
// ==/UserScript==
/*
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

const GECKO = (function() {
	return ((navigator.userAgent.indexOf('Gecko') > -1) && (navigator.userAgent.indexOf('KHTML') === -1));
})();
const WEBKIT = (function() {
	return (navigator.userAgent.indexOf('AppleWebKit/') > -1);
})();
const OPERA = (function() {
	return (Object.prototype.toString.call(window.opera) == '[object Opera]');
})();

var Window = (unsafeWindow || window);
