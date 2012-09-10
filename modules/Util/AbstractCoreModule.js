/* 
 * Abstract Core Module class
 * All core modules should inhert from this class
 * 
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.Util.AbstractCoreModule = new ClassSystem.AbstractClass(Modules.Util.AbstractModule, {
	initialize: function($super, callerObj) {
		this.callerObj = callerObj;
		this.storage = this.callerObj.storage;
		
		this.initializeVariables();
		this.addStyleRules();
		this.addListeners();
		this.finish();
	},
	
	registerOptions: function($super) {
		throw new Error('User interface functions are not available from core modules');
	},
	
	buildUI: function($super) {
		throw new Error('User interface functions are not available from core modules');
	}
});
