/**
 * Storage engine for persistent value storage
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Storage = (function() {
	var StorageInterface = new ClassSystem.Class((function() {
		function initialize(namespace) {
			this.namespace = namespace;
		}
		
		/**
		 * Gets saved value from persistent storage
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		[defaultValue]
		 * @returns	{mixed}
		 */
		function getValue(key, defaultValue) {
			var type, value;
			
			if (localStorage.getItem(this.namespace + key) === null) {
				if (!Object.isUndefined(defaultValue)) this.setValue(key, defaultValue);
				return defaultValue;
			}
			
			value = localStorage.getItem(this.namespace + key);
			type = value[0];
			value = value.slice(1);
			switch (type) {
				case 'b':
					return (value === 'true');
				case 'n':
					return Number(value);
				case 'o':
					return JSON.parse(value);
				default:
					return value;
			}
		}
		
		/**
		 * Saves value persistent
		 * 
		 * @param	{String}	key
		 * @param	{mixed}		value
		 * @returns	{undefined}
		 */
		function setValue(key, value) {
			value = (typeof value)[0] + ((typeof value === 'object') ? JSON.stringify(value) : value);
			return localStorage.setItem(this.namespace + key, value);
		}
		
		/**
		 * Deletes value from persistent storage
		 * 
		 * @param	{String}	key
		 * @returns	{undefined}
		 */
		function unsetValue(key) {
			localStorage.removeItem(this.namespace + key);
		}
		
		/**
		 * Returns an array of all keys within the given namespace
		 * 
		 * @returns	{Array}
		 */
		function keys() {
			var length = localStorage.length;
			var keysArray = [];
			
			while (length--) {
				if (localStorage.key(length).startsWith(this.namespace)) {
					keysArray.push(localStorage.key(length).replace(this.namespace, ''));
				}
			}
			
			return keysArray;
		}
		
		/**
		 * Amount of saved key value pairs within the given namespace
		 * 
		 * @returns	{Number}
		 */
		function size() {
			var length = localStorage.length;
			var i = 0;
			
			while (length--) {
				if (localStorage.key(length).startsWith(this.namespace)) {
					i++;
				}
			}
			
			return i;
		}
		
		/**
		 * Deletes all data from persistent storage within the given namespace
		 * 
		 * @returns	{undefined}
		 */
		function clear() {
			var keys = this.keys();
			
			keys.each(function(key) {
				this.unsetValue(key);
			}, this);
		}
		
		/**
		 * Replace all data in the given namespace with properties of passed object
		 * 
		 * @param	{Object}	Object	Hash-like object
		 * @returns	{undefined}	Returns nothing
		 */
		function importSettings(obj) {
			if (typeof obj !== 'object') throw new TypeError('obj has to be an object type');
			
			var keys = Object.keys(obj);
			
			this.clear();
			keys.each(function(key) {
				this.setValue(key, obj[key]);
			}, this);
		}
		
		/**
		 * Returns all key value pairs from the given namespace
		 * 
		 * @returns	{Object}	Hash-like object with every key as property
		 */
		function exportSettings() {
			var obj = {};
			var keys = this.keys();
			
			for (var i = 0, length = keys.length; i < length; i++) {
				obj[keys[i]] = this.getValue(keys[i]);
			}
			
			return obj;
		}
		
		return {
			initialize:	initialize,
			getValue:	getValue,
			setValue:	setValue,
			unsetValue:	unsetValue,
			keys:		keys,
			size:		size,
			clear:		clear,
			importSettings:	importSettings,
			exportSettings:	exportSettings
		};
	})());
	var namespaces = {
		noNamespace: new StorageInterface(''),
		global: new StorageInterface('.')
	};
	
	function getInterface() {
		if (arguments.length < 1) {
			throw new Error('No namespace given');
		}
		
		if ((arguments.length === 1) && (arguments[0] === '')) {
			return namespaces.noNamespace;
		}
		else if ((arguments.length === 1) && (arguments[0] === '.')) {
			return namespaces.global;
		}
		else {
			var namespace = '';
			
			$A(arguments).each(function(namespaceItem) {
				namespace += '.' + namespaceItem;
			});
			
			namespace += '.'
			
			if (Object.isUndefined(namespaces[namespace])) {
				namespaces[namespace] = new StorageInterface(namespace);
			}
			
			return namespaces[namespace];
		}
	}
	
	return {
		getInterface:	getInterface
	};
})();
