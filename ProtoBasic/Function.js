/* 
 * Extended Function functions
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
Object.extend(Function, {
	empty: function() { },
	K: function(x) {
		return x;
	}
});

Object.extend(Function.prototype, (function() {
	var slice = Array.prototype.slice;
	
	function update(array, args) {
		var arrayLength = array.length;
		var length = args.length;
		
		while (length--) {
			array[arrayLength + length] = args[length];
		}
		
		return array;
	}
	
	function merge(array, args) {
		array = slice.call(array, 0);
		
		return update(array, args);
	}
	
	// --- exported functions ---
	function argumentNames() {
		var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '').replace(/\s+/g, '').split(',');
		
		return (((names.length == 1) && !names[0]) ? [] : names);
	}
	
	function bind(context) {
		if (arguments.length < 2 && (typeof arguments[0] === 'undefined')) return this;
		
		var __method = this;
		var args = slice.call(arguments, 1);
		
		return function() {
		  var a = merge(args, arguments);
		  
		  return __method.apply(context, a);
		}
	}
	
	function bindAsEventListener(context) {
		var __method = this;
		var args = slice.call(arguments, 1);
		
		return function(event) {
			var a = update([event || window.event], args);
			
			return __method.apply(context, a);
		}
	}
	
	function wrap(wrapper) {
		var __method = this;
		
		return function() {
			var a = update([__method.bind(this)], arguments);
			
			return wrapper.apply(this, a);
		}
	}
	
	function methodize() {
		if (this._methodized) return this._methodized;
		
		var __method = this;
		
		return this._methodized = function() {
			var a = update([this], arguments);
			
			return __method.apply(null, a);
		};
	}
	
	
	return {
		argumentNames:		argumentNames,
		bind:			Function.prototype.bind || bind,
		bindAsEventListener:	bindAsEventListener,
		wrap:			wrap,
		methodize:		methodize
	};
})());
