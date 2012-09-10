/*
 * Style related functions
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Style = {
	addNode: function(CSSRules) {
		var styleNode = new Element('style', { 'type': 'text/css' });
		
		styleNode.appendChild(document.createTextNode(CSSRules));
		$$('head')[0].appendChild(styleNode);
	}
};
