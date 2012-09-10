/* 
 * Hash class
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
function $H(object) {
	return new Hash(object);
};

var Hash = new ClassSystem.Class(Enumerable, (function() {
	function initialize(object) {
		this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
	}
	
	function _each(iterator) {
		for (var key in this._object) {
			var value = this._object[key];
			var pair = [key, value];
			
			pair.key = key;
			pair.value = value;
			
			iterator(pair);
		}
	}
	
	function set(key, value) {
		return this._object[key] = value;
	}
	
	function get(key) {
		if (this._object.hasOwnProperty(key)) return this._object[key];
	}
	
	function unset(key) {
		var value = this._object[key];
		
		delete this._object[key];
		
		return value;
	}
	
	function index(value) {
		var match = this.detect(function(pair) {
			return (pair.value === value);
		});
		
		return (match && match.key);
	}
	
	function keys() {
		return this.pluck('key');
	}
	
	function values() {
		return this.pluck('value');
	}
	
	function merge(object) {
		return this.clone().update(object);
	}
	
	function update(object) {
		return new Hash(object).inject(this, function(result, pair) {
			result.set(pair.key, pair.value);
			
			return result;
		});
	}
	
	function toObject() {
		return Object.clone(this._object);
	}
	
	function clone() {
		return new Hash(this);
	}
	
	function inspect() {
		return '#<Hash:{' + this.map(function(pair) {
			return pair.map(Object.inspect).join(': ');
		}).join(', ') + '}>';
	}
	
	return {
		initialize:	initialize,
		_each:		_each,
		set:		set,
		get:		get,
		unset:		unset,
		index:		index,
		keys:		keys,
		values:		values,
		merge:		merge,
		update:		update,
		toObject:	toObject,
		clone:		clone,
		inspect:	inspect
	};
})());
