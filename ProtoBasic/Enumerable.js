/* 
 * Abstract Enumerable class
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
var $break = {};

var Enumerable = (function() {
	function internalArrayCasting(iterable) {
		if (!iterable) return [];
		if ('toArray' in Object(iterable)) return iterable.toArray();
		
		var length = iterable.length || 0
		var results = new Array(length);
		
		while (length--) results[length] = iterable[length];
		
		return results;
	}
	
	function each(iterator, context) {
		var index = 0;
		
		try {
			this._each(function(value) {
				iterator.call(context, value, index++);
			});
		}
		catch (e) {
			if (e != $break) throw e;
		}
		
		return this;
	}
	
	function all(iterator, context) {
		iterator = iterator || Function.K;
		var result = true;
		
		this.each(function(value, index) {
			result = result && !!iterator.call(context, value, index);
			
			if (!result) throw $break;
		});
		
		return result;
	}
	
	function any(iterator, context) {
		iterator = iterator || Function.K;
		var result = false;
		
		this.each(function(value, index) {
			if (result = !!iterator.call(context, value, index)) throw $break;
		});
		
		return result;
	}
	
	function collect(iterator, context) {
		iterator = iterator || Function.K;
		var results = [];
		
		this.each(function(value, index) {
			results.push(iterator.call(context, value, index));
		});
		
		return results;
	}
	
	function detect(iterator, context) {
		var result;
		
		this.each(function(value, index) {
			if (iterator.call(context, value, index)) {
				result = value;
				
				throw $break;
			}
		});
		
		return result;
	}
	
	function findAll(iterator, context) {
		var results = [];
		
		this.each(function(value, index) {
			if (iterator.call(context, value, index)) results.push(value);
		});
		
		return results;
	}

	function reject(iterator, context) {
		var results = [];
		
		this.each(function(value, index) {
			if (!iterator.call(context, value, index)) {
				results.push(value);
			}
		});
		
		return results;
	}

	function include(object) {
		if (Object.isFunction(this.indexOf)) {
			return (this.indexOf(object) !== -1);
		}
		
		var found = false;
		
		this.each(function(value) {
			if (value == object) {
				found = true;
				
				throw $break;
			}
		});
		
		return found;
	}
	
	function invoke(method) {
		var args = internalArrayCasting(arguments).slice(1);
		
		return this.collect(function(value) {
			return value[method].apply(value, args);
		});
	}
	
	function pluck(property) {
		var results = [];
		
		this.each(function(value) {
			results.push(value[property]);
		});
		
		return results;
	}
	
	function toArray() {
		return this.map();
	}
	
	function size() {
		return this.toArray().length;
	}
	
	function inspect() {
		return '#<Enumerable:' + this.toArray().inspect() + '>';
	}
	
	return {
		each:		each,
		all:		all,
		every:		all,
		any:		any,
		some:		any,
		collect:	collect,
		map:		collect,
		detect:		detect,
		find:		detect,
		findAll:	findAll,
		select:		findAll,
		filter:		findAll,
		reject:		reject,
		include:	include,
		member:		include,
		invoke:		invoke,
		pluck:		pluck,
		toArray:	toArray,
		entries:	toArray,
		size:		size,
		inspect:	inspect
	};
})();
