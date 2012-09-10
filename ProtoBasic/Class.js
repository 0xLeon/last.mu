/* 
 * Basic Class implementation
 * Copyright (C) 2011-2012 Stefan Hahn
 * 
 * Based on Prototype
 * Copyright (c) 2005-2010 Sam Stephenson
 */
var ClassSystem = (function() {
	function internalArrayCasting(iterable) {
		if (!iterable) return [];
		if ('toArray' in Object(iterable)) return iterable.toArray();
		
		var length = iterable.length || 0;
		var results = new Array(length);
		
		while (length--) results[length] = iterable[length];
		
		return results;
	}
	
	function getKlass(isAbstract) {
		if (isAbstract) {
			return function() {
				throw new Error('Trying to create instance of an abstract class');
			}
		}
		else {
			return function() {
				this.initialize.apply(this, arguments);
			}
		}
	}
	
	function createInternalStructure(klass, properties) {
		var parent = null;
		
		if (Object.isFunction(properties[0])) parent = properties.shift();
		
		Object.extend(klass, {
			addMethods: function(source) {
				var ancestor = this.superclass && this.superclass.prototype;
				var properties = Object.keys(source);
				
				for (var i = 0, length = properties.length; i < length; i++) {
					var property = properties[i];
					var value = source[property];
					
					if (ancestor && Object.isFunction(value) && (value.argumentNames()[0] === '$super')) {
						var method = value;
						
						value = (function(m) {
							return function() {
								return ancestor[m].apply(this, arguments);
							};
						})(property).wrap(method);
						
						value.valueOf = method.valueOf.bind(method);
						value.toString = method.toString.bind(method);
					}
					
					this.prototype[property] = value;
				}
				
				return this;
			}
		});
		klass.superclass = parent;
		klass.subclasses = [];
		
		if (parent) {
			var subclass = function() { };
			
			subclass.prototype = parent.prototype;
			klass.prototype = new subclass;
			parent.subclasses.push(klass);
		}
		
		for (var i = 0, length = properties.length; i < length; i++) {
			if (typeof properties[i] === 'object' ) {
				klass.addMethods(properties[i]);
			}
		}
		
		if (!Object.isFunction(klass.prototype.initialize)) {
			klass.prototype.initialize = Function.empty;
		}
		
		klass.prototype.constructor = klass;
	}
	
	function AbstractClass() {
		var klass = getKlass(true);
		
		createInternalStructure(klass, internalArrayCasting(arguments));
		
		return klass;
	}
	
	function Class() {
		var klass = getKlass(false);
		
		createInternalStructure(klass, internalArrayCasting(arguments));
		
		return klass;
	}
	
	return {
		AbstractClass:	AbstractClass,
		Class:		Class
	};
})();
