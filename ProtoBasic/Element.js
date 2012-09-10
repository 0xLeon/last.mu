/* 
 * Extended Element functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
(function() {
	var Offset = new ClassSystem.Class({
		initialize: function(left, top) {
			this.left = Math.round(left);
			this.top = Math.round(top);

			this[0] = this.left;
			this[1] = this.top;
		},

		relativeTo: function(offset) {
			return new Element.Offset(this.left - offset.left, this.top - offset.top);
		},

		inspect: function() {
			return '<Element.Offset left: ' + this.left.toString() + ' top: ' + this.top.toString() + '>';
		},

		toString: function() {
			return '[' + this.left.toString() + ', ' + this.top.toString() + ']';
		},

		toArray: function() {
			return [this.left, this.top];
		}
	});
	
	/**
	 * Selector Engine
	 * Provides methods for selecting elements with DOM tree
	 * 
	 * @type	{Object}
	 */
	var Selector = (function() {
		/**
		 * Gets element nodes via ID
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * @param	{Object|String}		element		Node or ID string
		 * @returns	{Object|Array}				Single element node or array of nodes
		 */
		function getElementsByIDs(element) {
			if (arguments.length > 1) {
				for (var i = 0, elements = [], length = arguments.length; i < length; i++) {
					elements.push(getElementsByIDs(arguments[i]));
				}
				
				return $A(elements);
			}

			if (Object.isString(element)) {
				element = document.getElementById(element);
			}
			
			return element;
		}
		
		/**
		 * Gets element nodes via CSS expression
		 * Accepts as many parameters as you want
		 * Returns an array of all found nodes
		 * 
		 * @param	{String}	cssExpression		CSS expression
		 * @returns	{Array}					Array of nodes
		 */
		function getElementsByCSSExpression() {
			var expression = $A(arguments).join(', ');
			
			return $A(document.querySelectorAll(expression));
		}
		
		return {
			getElementsByIDs:		getElementsByIDs,
			getElementsByCSSExpression:	getElementsByCSSExpression
		};
	})();
	
	function Element(tagName, attributes) {
		attributes = attributes || {};
		tagName = tagName.toLowerCase();
		
		if (!ELEMENT_CACHE[tagName]) ELEMENT_CACHE[tagName] = document.createElement(tagName);
		
		var node = ELEMENT_CACHE[tagName].cloneNode(false);
		
		return Element.writeAttribute(node, attributes);
	}
	
	function writeAttribute(element, name, value) {
		element = Selector.getElementsByIDs(element);
		var attributes = {};
		var table = ATTRIBUTE_TRANSLATIONS.write;
		
		if (typeof name === 'object') {
			attributes = name;
		}
		else {
			attributes[name] = Object.isUndefined(value) ? true : value;
		}
		
		for (var attr in attributes) {
			name = table.names[attr] || attr;
			value = attributes[attr];
			
			if (table.values[attr]) {
				name = table.values[attr](element, value);
			}
			else if ((value === false) || (value === null)) {
				element.removeAttribute(name);
			}
			else if (value === true) {
				element.setAttribute(name, name);
			}
			else {
				element.setAttribute(name, value);
			}
		}
		
		return element;
	}
	
	function descendantOf(element, ancestor) {
		element = Selector.getElementsByIDs(element);
		ancestor = Selector.getElementsByIDs(ancestor);
		
		return ((element.compareDocumentPosition(ancestor) & 8) === 8);
	}
	
	function hasClassName(element, className) {
		element = Selector.getElementsByIDs(element);
		
		return element.className.includes(className);
	}
	
	function addClassName(element, className) {
		element = Selector.getElementsByIDs(element);
		
		if (!hasClassName(element, className)) {
			 element.className += ((element.className) ? (' ') : ('')) + className;
		}
		
		return element;
	}
	
	function removeClassName(element, className) {
		element = Selector.getElementsByIDs(element);
		
		element.className = element.className.replace(className, '').strip();
		
		return element;
	}
	
	function getStyle(element, style) {
		element = Selector.getElementsByIDs(element);
		style = normalizeStyleName(style);
		var value = element.style[style];
		
		if (!value || (value === 'auto')) {
			var css = document.defaultView.getComputedStyle(element, null);
			
			value = ((css) ? (css[style]) : (null));
		}

		if (style === 'opacity') {
			return ((value) ? (parseFloat(value)) : (1.0));
		}
		
		return ((value === 'auto') ? (null) : (value));

	}
	
	function cumulativeOffset(element) {
		element = Selector.getElementsByIDs(element);
		var valueT = 0;
		var valueL = 0;
		
		if (element.parentNode) {
			do {
				valueT += element.offsetTop || 0;
				valueL += element.offsetLeft || 0;
				element = element.offsetParent;
			} while (element);
		}
		
		return new Element.Offset(valueL, valueT);
	}
	
	function cumulativeScrollOffset(element) {
		element = Selector.getElementsByIDs(element);
		var valueT = 0;
		var valueL = 0;
		
		do {
			valueT += element.scrollTop || 0;
			valueL += element.scrollLeft || 0;
			element = element.parentNode;
		} while (element);
		
		return new Element.Offset(valueL, valueT);
	}
	
	function viewportOffset(forElement) {
		var valueT = 0;
		var valueL = 0;
		var docBody = document.body;
		var element = Selector.getElementsByIDs(forElement);
		
		do {
			valueT += element.offsetTop || 0;
			valueL += element.offsetLeft || 0;
			
			if ((element.offsetParent == docBody) && (Element.getStyle(element, 'position') == 'absolute')) {
				break;
			}
		} while (element = element.offsetParent);
		
		element = forElement;
		do {
			if (element != docBody) {
				valueT -= element.scrollTop || 0;
				valueL -= element.scrollLeft || 0;
			}
		} while (element = element.parentNode);
		
		return new Element.Offset(valueL, valueT);
	}
	
	function normalizeStyleName(style) {
		if ((style === 'float') || (style === 'styleFloat')) {
			return 'cssFloat';
		}
		
		return style.camelize();
	}
	
	var ELEMENT_CACHE = {};
	var ATTRIBUTE_TRANSLATIONS = {
		write: {
			names: {
				'class':	'class',
				className:	'class',
				'for':		'for',
				htmlFor:	'for',
				cellpadding:	'cellPadding',
				cellspacing:	'cellSpacing',
				colspan:	'colSpan',
				rowspan:	'rowSpan',
				valign:		'vAlign',
				datetime:	'dateTime',
				accesskey:	'accessKey',
				tabindex:	'tabIndex',
				enctype:	'encType',
				maxlength:	'maxLength',
				readonly:	'readOnly',
				longdesc:	'longDesc',
				frameborder:	'frameBorder'
			},
			
			values: {
				checked: function(element, value) {
					element.checked = !!value;
				},
				
				style: function(element, value) {
					element.style.cssText = value ? value : '';
				}
			}
		}
	};
	
	Object.extend(Element, {
		Offset:			Offset,
		Selector:		Selector,
		
		writeAttribute:		writeAttribute,
		hasClassName:		hasClassName,
		addClassName:		addClassName,
		removeClassName:	removeClassName,
		getStyle:		getStyle,
		cumulativeOffset:	cumulativeOffset,
		cumulativeScrollOffset:	cumulativeScrollOffset,
		viewportOffset:		viewportOffset
	});
	
	var oldElement = window.Element;
	window.Element = Element;
	
	Object.extend(window.Element, oldElement || {});
	if (oldElement) window.Element.prototype = oldElement.prototype;
	
	// wrappers for selector functions
	window.$ = Element.Selector.getElementsByIDs;
	window.$$ = Element.Selector.getElementsByCSSExpression;
})();
