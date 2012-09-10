/*
 * Event System
 * Basic event system for custom events
 *
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Event = (function() {
	/**
	 * Saves event handlers
	 * 
	 * @private
	 * @type	{Hash}
	 */
	var events = $H({});
	
	/**
	 * Hash for key codes
	 * 
	 * @type	{Object}
	 */
	var keys = {
		KEY_BACKSPACE:	8,
		KEY_TAB:	9,
		KEY_RETURN:	13,
		KEY_ESC:	27,
		KEY_LEFT:	37,
		KEY_UP:		38,
		KEY_RIGHT:	39,
		KEY_DOWN:	40,
		KEY_DELETE:	46,
		KEY_HOME:	36,
		KEY_END:	35,
		KEY_PAGEUP:	33,
		KEY_PAGEDOWN:	34,
		KEY_INSERT:	45
	};

	/**
	 * Register an event handler for an event
	 * 
	 * @param	{String}	name		event name
	 * @param	{Function}	handler		event handler function, has to accept one parameter of type Object
	 * @param	{Object}	[context]	optional object which this will reference to within handler function
	 * @returns	{Number}			index of event handler, necessary when you want to unregister the listener
	 */
	function register(name, handler, context) {
		if (Object.isUndefined(events.get(name))) {
			events.set(name, []);
		}
		
		return (events.get(name).push(handler.bind(context))-1);
	}
	
	/**
	 * Remove an event listener
	 * 
	 * @param	{String}	name		event name
	 * @param	{Number}	index		index retuern by Event.register
	 * @returns	{undefined}			Returns nothing
	 */
	function unregister(name, index) {
		delete events.get(name)[index];
	}
	
	/**
	 * Executes all listeners registered to the named event
	 * 
	 * @param	{String}	name		event name
	 * @param	{Object}	eventObj	object passed to event handlers
	 * @returns	{undefined}			Returns nothing
	 */
	function fire(name, eventObj) {
		if (Object.isArray(events.get(name))) {
			events.get(name).each(function(item) {
				try {
					item(eventObj);
				}
				catch (e) {
					alert('Event Listener konnte nicht ausgeführt werden!'+"\n"+e.name+' - '+e.message);
				}
			});
		}
	}
	
	/**
	 * Prevent default action and further bubbling in DOM events
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{undefined}			Returns nothing
	 */
	function stop(event) {
		event.preventDefault();
		event.stopPropagation();

		event.stopped = true;
	}
	
	/*
	 * Get x coordinate on DOM pointing device events
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{Number}			event x coordinate
	 */
	function pointerX(event) {
		var docElement = document.documentElement;
		var body = document.body || {
			scrollLeft: 0
		};
		
		return (event.pageX || (event.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0)));
	}

	/*
	 * Get y coordinate on DOM pointing device events
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{Number}			event y coordinate
	 */
	function pointerY(event) {
		var docElement = document.documentElement;
		var body = document.body || {
			scrollTop: 0
		};

		return (event.pageY || (event.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0)));
	}

	if (WEBKIT) {
		_isButton = function(event, code) {
			switch (code) {
				case 0:
					return ((event.which == 1) && !event.metaKey);
				case 1:
					return ((event.which == 2) || ((event.which == 1) && event.metaKey));
				case 2:
					return (event.which == 3);
				default:
					return false;
			}
		}

	}
	else {
		_isButton = function(event, code) {
			return ((event.which) ? (event.which === code + 1) : (event.button === code));
		}
	}
	
	/**
	 * Returns true if the click event was triggered by primary mouse button
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{Boolean}
	 */
	function isLeftClick(event) {
		return _isButton(event, 0);
	}
	
	/**
	 * Returns true if the click event was triggered by middle mouse button
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{Boolean}
	 */
	function isMiddleClick(event) {
		return _isButton(event, 1);
	}
	
	/**
	 * Returns true if the click event was triggered by secondary mouse button
	 * 
	 * @param	{Object}	event		DOM event object
	 * @returns	{Boolean}
	 */
	function isRightClick(event) {
		return _isButton(event, 2);
	}

	
	return {
		register:	register,
		unregister:	unregister,
		fire:		fire,
		
		keys:		keys,
		stop:		stop,
		pointerX:	pointerX,
		pointerY:	pointerY,
		isLeftClick:	isLeftClick,
		isMiddleClick:	isMiddleClick,
		isRightClick:	isRightClick
	};
})();
