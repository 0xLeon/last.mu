/* 
 * Abstract Module class
 * All modules should inhert from this class
 * 
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.Util.AbstractModule = new ClassSystem.AbstractClass({
	initialize: function(callerObj) {
		this.callerObj = callerObj;
		this.storage = this.callerObj.storage;
		
		this.initializeVariables();
		this.addStyleRules();
		this.registerOptions();
		this.addListeners();
		this.buildUI();
		this.finish();
	},
	initializeVariables: function() {},
	addStyleRules: function() {},
	registerOptions: function() {},
	addListeners: function() {},
	buildUI: function() {},
	finish: function() {},
});
