/* 
 * Update Core Module
 * Copyright (C) 2011-2012 Stefan Hahn
 */
Modules.Core.Update = new ClassSystem.Class(Modules.Util.AbstractCoreModule, {
	finish: function() {
		this.check();
	},
	
	check: function() {
		GM_xmlhttpRequest({
			method: 'GET',
			url: this.callerObj.getUpdateServer()+'?version='+encodeURIComponent(this.callerObj.getVersion())+'&getNonStableReleases='+((this.storage.getValue('getNonStableReleasesStatus', false)) ? '1' : '0'),
			headers: {
				'Accept': 'text/xml'
			},
			onload: function(response) {
				var xml = (new DOMParser()).parseFromString(response.responseText, 'text/xml');
				
				if (xml.documentElement.getAttribute('newVersion') === 'true') {
					(this.callerObj.getUpdateCallback())(xml);
				}
			}.bind(this)
		});
	}
});
