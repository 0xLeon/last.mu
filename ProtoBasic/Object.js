/* 
 * Extended Object functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
(function() {
	var _toString = Object.prototype.toString;
	const NULL_TYPE = 'Null';
	const UNDEFINED_TYPE = 'Undefined';
	const BOOLEAN_TYPE = 'Boolean';
	const NUMBER_TYPE = 'Number';
	const STRING_TYPE = 'String';
	const OBJECT_TYPE = 'Object';
	const FUNCTION_CLASS = '[object Function]';
	const BOOLEAN_CLASS = '[object Boolean]';
	const NUMBER_CLASS = '[object Number]';
	const STRING_CLASS = '[object String]';
	const ARRAY_CLASS = '[object Array]';
	const DATE_CLASS = '[object Date]';
	
	// --- exported functions ---
	function extend(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		
		return destination;
	}
	
	function inspect(object) {
		try {
			if (isUndefined(object)) return 'undefined';
			if (object === null) return 'null';
			
			return object.inspect ? object.inspect() : String(object);
		}
		catch (e) {
			if (e instanceof RangeError) return '...';
			
			throw e;
		}
	}
	
	function stringify(object) {
		return JSON.stringify(object);
	}
	
	function clone(object) {
		return extend({}, object);
	}
	
	function isHash(object) {
		return (object instanceof Hash);
	}
	
	function isFunction(object) {
		return (_toString.call(object) === FUNCTION_CLASS);
	}
	
	function isString(object) {
		return (_toString.call(object) === STRING_CLASS);
	}
	
	function isNumber(object) {
		return (_toString.call(object) === NUMBER_CLASS);
	}
	
	function isDate(object) {
		return (_toString.call(object) === DATE_CLASS);
	}
	
	function isUndefined(object) {
		return (typeof object === 'undefined');
	}
	
	extend(Object, {
		extend:		extend,
		inspect:	inspect,
		toJSON:		JSON.stringify,
		clone:		clone,
		isArray:	Array.isArray,
		isHash:		isHash,
		isFunction:	isFunction,
		isString:	isString,
		isNumber:	isNumber,
		isDate:		isDate,
		isUndefined:	isUndefined
	});
})();
