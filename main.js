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
		this.buildUIPanel('lastmuSettings', 'last.mu', function(contentDiv) {
			contentDiv.appendChild(document.createTextNode('test content'));
		});
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
	
	function buildUIPanel(panelID, title, contentBuilder, context) {
		var windowLink = new Element('a', { id: panelID + 'WindowLink', href: 'javascript:void(0);' });
		var panelDiv = new Element('div', { id: panelID, 'class': 'UIPanel', style: 'display: none;' });
		var extPanelDiv = new Element('div', { 'class': 'extPanel reply' });
		var panelHeaderDiv = new Element('div', { 'class': 'panelHeader' });
		var panelControlsSpan = new Element('span');
		var panelControlsCloseButton = new Element('img', { 'class': 'pointer', src: '//static.4chan.org/image/buttons/burichan/cross.png', alt: 'Close', title: 'Close' });
		var contentDiv = new Element('div');
		
		panelControlsCloseButton.addEventListener('click', function(event) {
			$(panelID).style.display = 'none';
		}, true);
		
		windowLink.addEventListener('click', function(event) {
			$(panelID).style.display = '';
		}, true);
		
		windowLink.appendChild(document.createTextNode(title));
		
		panelControlsSpan.appendChild(panelControlsCloseButton);
		panelHeaderDiv.appendChild(document.createTextNode(title));
		panelHeaderDiv.appendChild(panelControlsSpan);
		extPanelDiv.appendChild(panelHeaderDiv);
		extPanelDiv.appendChild(contentDiv);
		panelDiv.appendChild(extPanelDiv);
		
		try {
			contentDiv.appendChild(contentBuilder.call(context));
		}
		catch (e) {
			contentBuilder.call(context, contentDiv);
		}
		
		$('navtopright').insertBefore(windowLink, $$('#navtopright > a:last-child')[0]);
		$('navtopright').insertBefore(document.createTextNode('] ['), $$('#navtopright > a:last-child')[0]);
		
		$$('body')[0].appendChild(panelDiv);
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
		
		buildUIPanel:		buildUIPanel,
		getUpdateServer:	getUpdateServer,
		getVersion:		getVersion,
		getUpdateCallback:	getUpdateCallback
	};
})());

Window.lastmu = new Lastmu();
