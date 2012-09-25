/*
 * last.mu
 * Copyright (C) 2012 Stefan Hahn
 */
var Lastmu = new ClassSystem.Class((function() {
	/**
	 * Interface to access global storage
	 * 
	 * @type	{StorageInterface}
	 */
	var storage = Storage.getInterface('lastmu');
	
	/**
	 * Hash of all active core module instances
	 * 
	 * @type	{Hash}
	 */
	var coreModuleInstances = $H({});
	
	/**
	 * Hash of all active addon module instances
	 * 
	 * @type	{Hash}
	 */
	var moduleInstances = $H({});
	
	function initialize() {
		this.initCoreModules();
		this.buildUI();
		
		Window.addEventListener('load', function(event) {
			this.finish();
		}.bindAsEventListener(this), true);
	}
	
	function initCoreModules() {
		$H(Modules.Core).each(function(pair) {
			try {
				// TODO: reactivate when update server is set up
				// this.coreModuleInstances.set(pair.key, new pair.value(this));
			}
			catch (e) {
				Window.alert('Couldn\'t initialze core module »'+pair.key+'«.'+"\n"+e.name+' - '+e.message);
			}
		}, this);
	}
	
	function buildUI() {
		
	}
	
	function finish() {
		this.initModules();
	}
	
	function initModules() {
		$H(Modules.AddOn).each(function(pair) {
			try {
				this.moduleInstances.set(pair.key, new pair.value(this));
			}
			catch (e) {
				Window.alert('Couldn\'t initialze module »'+pair.key+'«.'+"\n"+e.name+' - '+e.message);
			}
		}, this);
	}
	
	function updateCallback(xml) {
		
	}
	
	/**
	 * Returns the URI where the update server for this application is located
	 * 
	 * @return	{String}				Update server URI
	 */
	function getUpdateServer() {
		return 'http://example.com/';
	}
	
	/**
	 * Returns the version of the application
	 * 
	 * @return	{String}				Version number string
	 */
	function getVersion() {
		return '{version}';
	}
	
	/**
	 * Returns a function which handles an update xml given as the only parameter
	 * 
	 * @return	{Function}				Update callback function
	 */
	function getUpdateCallback() {
		return updateCallback.bind(this);
	}
	
	return {
		storage:		storage,
		coreModuleInstances:	coreModuleInstances,
		moduleInstances:	moduleInstances,
		
		initialize:		initialize,
		initCoreModules:	initCoreModules,
		buildUI:		buildUI,
		finish:			finish,
		initModules:		initModules,
		
		getUpdateServer:	getUpdateServer,
		getVersion:		getVersion,
		getUpdateCallback:	getUpdateCallback
	};
})());

Window.lastmu = new Lastmu();
