/* 
 * Extended RegExp functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
Object.extend(RegExp, {
	escape: function(str) {
		return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}
});
