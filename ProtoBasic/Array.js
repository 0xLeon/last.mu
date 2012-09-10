/* 
 * Extended Array functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
function $A(iterable) {
	if (!iterable) return [];
	if ('toArray' in Object(iterable)) return iterable.toArray();
	
	var length = (iterable.length || 0);
	var results = new Array(length);
	
	while (length--) results[length] = iterable[length];
	
	return results;
}

Object.extend(Array, {
	from: $A
});

Object.extend(Array.prototype, Enumerable);
Object.extend(Array.prototype, (function() {
	var arrayProto = Array.prototype;
	var slice = arrayProto.slice;
	
	function clear() {
		this.length = 0;
		
		return this;
	}
	
	function first() {
		return this[0];
	}
	
	function last() {
		return this[this.length - 1];
	}
	
	function compact() {
		return this.select(function(value) {
			return value != null;
		});
	}
	
	function without() {
		var values = slice.call(arguments, 0);
		
		return this.select(function(value) {
			return !values.include(value);
		});
	}
	
	function reverse(inline) {
		return ((inline === false) ? this.toArray() : this)._reverse();
	}
	
	function clone() {
		return slice.call(this, 0);
	}
	
	function size() {
		return this.length;
	}
	
	function inspect() {
		return '[' + this.map(Object.inspect).join(', ') + ']';
	}
	
	return {
		_each:		arrayProto.forEach,
		_reverse:	arrayProto.reverse,
		clear:		clear,
		first:		first,
		last:		last,
		compact:	compact,
		without:	without,
		reverse:	reverse,
		clone:		clone,
		size:		size,
		inspect:	inspect,
	};
})());
