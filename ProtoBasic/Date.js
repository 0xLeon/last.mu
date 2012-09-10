/* 
 * Extended Date functions
 * Copyright (c) 2011-2012 Stefan Hahn
 */
Object.extend(Date, {
	fromMessageTime: function(timeString) {
		var timeArray = timeString.split(':');
		var now = new Date();
		
		if (timeArray.length !== 3) throw new Error('invalid timeString »'+timeString+'«');
		
		return (new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(timeArray[0], 10), parseInt(timeArray[1], 10), parseInt(timeArray[2], 10)));
	}
});

Object.extend(Date.prototype, {
	getMessageDate: function() {
		return ((this.getHours() < 10) ? '0' + this.getHours() : this.getHours()) + ':' + ((this.getMinutes() < 10) ? '0' + this.getMinutes() : this.getMinutes()) + ':' + ((this.getSeconds() < 10) ? '0' + this.getSeconds() : this.getSeconds());
	}
});
