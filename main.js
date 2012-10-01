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
		this.addStyleRules();
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
	
	function addStyleRules() {
		Style.addNode('.hidden { display: none; height: 0; overflow: hidden; position: absolute; left: -9000px; max-width: 8000px; }');
	}
	
	function buildUI() {
		this.buildUIPanel('lastmuSettings', 'last.mu', function(contentDiv) {
			var settingsList = new Element('ul', { id: 'lastmuSettingsGeneral' });
			var generalSettingsCategoryListItem = new Element('li', { 'class': 'settings-cat' });
			
			generalSettingsCategoryListItem.appendChild(document.createTextNode('General'));
			
			settingsList.appendChild(generalSettingsCategoryListItem);
			contentDiv.appendChild(settingsList);
		});
		this.registerTextOption('lastfmUsername', 'last.fm username', null, function(value) {
			Event.fire('lastfmUsernameChange', {
				newUsername: value
			});
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
	
	function registerBoolOption(optionID, optionTitle, defaultValue, switchCallback, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		
		var optionListElement = new Element('li');
		var optionLabel = new Element('label', { 'for': optionID });
		var optionInput = new Element('input', { id: optionID, 'class': 'menuOption', 'type': 'checkbox' });
		
		optionInput.addEventListener('change', function(event) {
			if (Object.isFunction(switchCallback) && !switchCallback.call(context, event, event.target.checked)) {
				event.target.checked = !event.target.checked;
			}
			
			this.storage.setValue(event.target.getAttribute('id') + 'Status', event.target.checked);
		}.bindAsEventListener(this), true);
		
		optionInput.checked = this.storage.getValue(optionID + 'Status', defaultValue);
		optionLabel.appendChild(optionInput);
		optionLabel.appendChild(document.createTextNode(' ' + optionTitle));
		optionListElement.appendChild(optionLabel);
		
		$('lastmuSettingsGeneral').appendChild(optionListElement);
	}
	
	function registerTextOption(optionID, optionTitle, defaultValue, changeCallback, context) {
		if (!!$(optionID)) throw new Error('optionID \''+optionID+'\' already used');
		
		var optionValue = ((!!this.storage.getValue(optionID + 'Value', defaultValue)) ? this.storage.getValue(optionID + 'Value', defaultValue) : 'Not set yet');
		var optionListElement = new Element('li');
		var optionSpan = new Element('span', { id: optionID, 'class': 'textOptionValue', title: 'Click to change' });
		var optionInput = new Element('input', { id: optionID + 'Input', 'class': 'menuOption hidden', 'type': 'text', size: '8', autocomplete: 'off', value: optionValue });
		
		optionSpan.addEventListener('click', function(event) {
			Element.addClassName(event.target, 'hidden');
			Element.removeClassName(event.target.nextSibling, 'hidden');
			event.target.nextSibling.focus();
		}, true);
		
		optionInput.addEventListener('focus', function(event) {
			event.target.select();
		}, true);
		
		optionInput.addEventListener('keydown', function(event) {
			if ((event.keyCode === Event.keys.KEY_RETURN) && (event.target.value.length > 0)) {
				var optionSpan = event.target.previousSibling;
				var optionInput = event.target;
				
				this.storage.setValue(optionSpan.getAttribute('id') + 'Value', optionInput.value);
				optionSpan.firstChild.replaceData(0, optionSpan.firstChild.nodeValue.length, this.storage.getValue(optionSpan.getAttribute('id') + 'Value'));
				
				Element.addClassName(optionInput, 'hidden');
				Element.removeClassName(optionSpan, 'hidden');
				
				if (Object.isFunction(changeCallback)) changeCallback.call(context, optionInput.value);
				
				event.preventDefault();
			}
		}.bindAsEventListener(this), true);
		
		optionSpan.appendChild(document.createTextNode(optionValue));
		optionListElement.appendChild(document.createTextNode(optionTitle + ': '));
		optionListElement.appendChild(optionSpan);
		optionListElement.appendChild(optionInput);
		
		$('lastmuSettingsGeneral').appendChild(optionListElement);
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
		addStyleRules:		addStyleRules,
		buildUI:		buildUI,
		finish:			finish,
		initModules:		initModules,
		
		buildUIPanel:		buildUIPanel,
		registerBoolOption:	registerBoolOption,
		registerTextOption:	registerTextOption,
		getUpdateServer:	getUpdateServer,
		getVersion:		getVersion,
		getUpdateCallback:	getUpdateCallback
	};
})());

Window.lastmu = new Lastmu();
