/*
 * Dragging implementation
 * Copyright (C) 2011-2012 Stefan Hahn
 *
 * Based on Scriptaculous
 * Copyright (C) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
 */
var Draggables = {
	drags: [],
	observers: [],
	
	register: function(draggable) {
		if (this.drags.size() === 0) {
			this.eventMouseUp = this.endDrag.bindAsEventListener(this);
			this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
			this.eventKeypress = this.keyPress.bindAsEventListener(this);

			document.addEventListener('mouseup', this.eventMouseUp, true);
			document.addEventListener('mousemove', this.eventMouseMove, true);
			document.addEventListener('keypress', this.eventKeypress, true);
		}
		
		this.drags.push(draggable);
	},
	
	unregister: function(draggable) {
		this.drags = this.drags.reject(function(d) {
			return (d == draggable);
		});
		
		if (this.drags.size() === 0) {
			document.removeEventListener('mouseup', this.eventMouseUp, true);
			document.removeEventListener('mousemove', this.eventMouseMove, true);
			document.removeEventListener('keypress', this.eventKeypress, true);
		}
	},
	
	activate: function(draggable) {
		if (draggable.options.delay) {
			this._timeout = setTimeout(function() {
				this._timeout = null;
				window.focus();
				this.activeDraggable = draggable;
			}.bind(this), draggable.options.delay);
		}
		else {
			window.focus();
			this.activeDraggable = draggable;
		}
	},
	
	deactivate: function() {
		this.activeDraggable = null;
	},
	
	updateDrag: function(event) {
		if (!this.activeDraggable) {
			return;
		}
		
		var pointer = [Event.pointerX(event), Event.pointerY(event)];
		
		if (this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) {
			return;
		}
		
		this._lastPointer = pointer;
		
		this.activeDraggable.updateDrag(event, pointer);
	},
	
	endDrag: function(event) {
		if (this._timeout) {
			clearTimeout(this._timeout);
			this._timeout = null;
		}
		
		if (!this.activeDraggable) {
			return;
		}
		
		this._lastPointer = null;
		this.activeDraggable.endDrag(event);
		this.activeDraggable = null;
	},
	
	keyPress: function(event) {
		if (this.activeDraggable) {
			this.activeDraggable.keyPress(event);
		}
	},
	
	addObserver: function(observer) {
		this.observers.push(observer);
		this._cacheObserverCallbacks();
	},
	
	removeObserver: function(element) {
		this.observers = this.observers.reject(function(o) {
			return (o.element == element);
		});
		this._cacheObserverCallbacks();
	},
	
	// 'onStart', 'onEnd', 'onDrag'
	notify: function(eventName, draggable, event) {
		if (this[eventName + 'Count'] > 0) {
			this.observers.each(function(o) {
				if (o[eventName]) {
					o[eventName](eventName, draggable, event);
				}
			});
		}
		
		if (draggable.options[eventName]) {
			draggable.options[eventName](draggable, event);
		}
	},
	
	_cacheObserverCallbacks : function() {
		['onStart', 'onEnd', 'onDrag'].each(function(eventName) {
			Draggables[eventName + 'Count'] = Draggables.observers.select(function(o) {
				return o[eventName];
			}).size();
		});
	}
}; 

var Draggable = new ClassSystem.Class({
	initialize: function(element) {
		var defaults = {
			handle: false,
			reverteffect: function(element, top_offset, left_offset) {
				var top = (parseFloat(Element.getStyle(element, 'top')) - top_offset).toString() + 'px';
				var left = (parseFloat(Element.getStyle(element, 'left')) - left_offset).toString() + 'px';
 				
				new Animations.Morph(element, {
					properties: ['top', 'left'],
					values: [top, left]
				});
			},
			endeffect: function(element) {
				var toOpacity = ((Object.isNumber(element._opacity)) ? (element._opacity) : (1.0));
				
				// TODO: 0.2 seconds
				new Animations.Morph(element, {
					properties: ['opacity'],
					values: [toOpacity],
					onAnimationEnd: function(event) {
						Draggable._dragging[event.target] = false;
					}
				});
			},
			zindex: 1000,
			revert: false,
			quiet: false,
			scroll: false,
			scrollSensitivity: 20,
			scrollSpeed: 15,
			snap: false,
			delay: 0
		};
		
		if (!arguments[1] || Object.isUndefined(arguments[1].endeffect)) {
			Object.extend(defaults, {
				starteffect: function(element) {
					element._opacity = Element.getStyle(element, 'opacity');
					Draggable._dragging[element] = true;
					
					// TODO: 0.2 seconds
					new Animations.Morph(element, {
						properties: ['opacity'],
						values: [0.7]
					});
				}
			});
		}
		
		var options = Object.extend(defaults, arguments[1] || { });
		
		this.element = $(element);
		
		if (options.handle && Object.isString(options.handle)) this.handle = this.element.querySelector('.' + options.handle);
		if (!this.handle) this.handle = $(options.handle);
		if (!this.handle) this.handle = this.element;

		if (options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
			options.scroll = $(options.scroll);
			this._isScrollChild = Element.descendantOf(this.element, options.scroll);
		}
		
		// fix IE
		// Element.makePositioned(this.element);

		this.options = options;
		this.dragging = false;

		this.eventMouseDown = this.initDrag.bindAsEventListener(this);
		this.handle.addEventListener('mousedown', this.eventMouseDown, true);

		Draggables.register(this);
	},

	destroy: function() {
		this.handle.removeEventListener('mousedown', this.eventMouseDown, true);
		Draggables.unregister(this);
	},

	currentDelta: function() {
		return [
			parseInt(Element.getStyle(this.element, 'left') || '0'),
			parseInt(Element.getStyle(this.element, 'top') || '0')
		];
	},

	initDrag: function(event) {
		if (!Object.isUndefined(Draggable._dragging[this.element]) && Draggable._dragging[this.element]) {
			return;
		}
		
		if (Event.isLeftClick(event)) {
			var src = event.target;
			
			if ((tag_name = src.tagName.toLowerCase()) && (['input', 'select', 'option', 'button', 'textarea'].indexOf(tag_name) > -1)) {
				return;
			}

			var pointer = [Event.pointerX(event), Event.pointerY(event)];
			var pos = Element.cumulativeOffset(this.element);
			
			this.offset = [0, 1].map(function(i) {
				return (pointer[i] - pos[i]);
			});

			Draggables.activate(this);
			Event.stop(event);
		}
	},

	startDrag: function(event) {
		this.dragging = true;
		
		if (!this.delta) {
			this.delta = this.currentDelta();
		}

		if (this.options.zindex) {
			this.originalZ = parseInt(Element.getStyle(this.element, 'z-index') || 0);
			this.element.style.zIndex = this.options.zindex;
		}

		if (this.options.ghosting) {
			this._clone = this.element.cloneNode(true);
			this._originallyAbsolute = (Element.getStyle(this.element, 'position') == 'absolute');
			
			if (!this._originallyAbsolute) {
				// TODO: absolutize
				// Element.absolutize(this.element);
			}
			
			this.element.parentNode.insertBefore(this._clone, this.element);
		}

		if (this.options.scroll) {
			if (this.options.scroll == window) {
				var where = this._getWindowScroll(this.options.scroll);
				
				this.originalScrollLeft = where.left;
				this.originalScrollTop = where.top;
			}
			else {
				this.originalScrollLeft = this.options.scroll.scrollLeft;
				this.originalScrollTop = this.options.scroll.scrollTop;
			}
		}

		Draggables.notify('onStart', this, event);

		if (this.options.starteffect) {
			this.options.starteffect(this.element);
		}
	},

	updateDrag: function(event, pointer) {
		if (!this.dragging) {
			this.startDrag(event);
		}

		// if (!this.options.quiet) {
		// 	Position.prepare();
		// 	Droppables.show(pointer, this.element);
		// }

		Draggables.notify('onDrag', this, event);

		this.draw(pointer);
		
		if (this.options.change) {
			this.options.change(this);
		}

		if (this.options.scroll) {
			this.stopScrolling();

			var p;
			var speed = [0, 0];
			
			if (this.options.scroll == window) {
				with (this._getWindowScroll(this.options.scroll)) {
					p = [left, top, left + width, top + height];
				}
			}
			else {
				p = Element.viewportOffset(this.options.scroll).toArray();
				p[0] += this.options.scroll.scrollLeft + (document.documentElement.scrollLeft || document.body.scrollLeft);
				p[1] += this.options.scroll.scrollTop + (document.documentElement.scrollTop || document.body.scrollTop);
				p.push(p[0] + this.options.scroll.offsetWidth);
				p.push(p[1] + this.options.scroll.offsetHeight);
			}
			
			if (pointer[0] < (p[0] + this.options.scrollSensitivity)) speed[0] = pointer[0] - (p[0] + this.options.scrollSensitivity);
			if (pointer[1] < (p[1] + this.options.scrollSensitivity)) speed[1] = pointer[1] - (p[1] + this.options.scrollSensitivity);
			if (pointer[0] > (p[2] - this.options.scrollSensitivity)) speed[0] = pointer[0] - (p[2] - this.options.scrollSensitivity);
			if (pointer[1] > (p[3] - this.options.scrollSensitivity)) speed[1] = pointer[1] - (p[3] - this.options.scrollSensitivity);
			this.startScrolling(speed);
		}

		if (WEBKIT) {
			window.scrollBy(0, 0);
		}

		Event.stop(event);
	},

	finishDrag: function(event, success) {
		this.dragging = false;
		
		var dropped = false;
		var revert = this.options.revert;
		var d = this.currentDelta();
		
		// if (this.options.quiet) {
		// 	var pointer = [Event.pointerX(event), Event.pointerY(event)];
		// 	Droppables.show(pointer, this.element);
		// }
		
		if (this.options.ghosting) {
			if (!this._originallyAbsolute) {
				// TODO: relativize
				// Element.relativize(this.element);
			}
			
			delete this._originallyAbsolute;
			this._clone.parentNode.removeChild(this._clone);
			this._clone = null;
		}
		
		// if (success) {
		// 	dropped = Droppables.fire(event, this.element);
			
		// 	if (!dropped) {
		// 		dropped = false;
		// 	}
		// }
		
		// if (dropped && this.options.onDropped) {
		// 	this.options.onDropped(this.element);
		// }
		
		Draggables.notify('onEnd', this, event);
		
		if (revert && Object.isFunction(revert)) {
			revert = revert(this.element);
		}
		
		if (revert && this.options.reverteffect) {
			if (!dropped || (revert != 'failure')) {
				this.options.reverteffect(this.element, d[1] - this.delta[1], d[0] - this.delta[0]);
			}
		}
		else {
			this.delta = d;
		}
		
		if (this.options.zindex) {
			this.element.style.zIndex = this.originalZ;
		}
		
		if (this.options.endeffect) {
			this.options.endeffect(this.element);
		}
		
		Draggables.deactivate(this);
		// Droppables.reset();
	},

	keyPress: function(event) {
		if (event.keyCode != Event.keys.KEY_ESC) {
			return;
		}
		
		this.finishDrag(event, false);
		Event.stop(event);
	},

	endDrag: function(event) {
		if (!this.dragging) {
			return;
		}
		
		this.stopScrolling();
		this.finishDrag(event, true);
		this.delta = null;
		Event.stop(event);
	},

	draw: function(point) {
		var pos = Element.cumulativeOffset(this.element);
		
		if (this.options.ghosting) {
			var r = Element.cumulativeScrollOffset(this.element);
			pos[0] += r[0] - (document.documentElement.scrollLeft || document.body.scrollLeft);
			pos[1] += r[1] - (document.documentElement.scrollTop || document.body.scrollTop);
		}

		var d = this.currentDelta();
		pos[0] -= d[0];
		pos[1] -= d[1];

		if (this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
			pos[0] -= this.options.scroll.scrollLeft - this.originalScrollLeft;
			pos[1] -= this.options.scroll.scrollTop - this.originalScrollTop;
		}

		var p = [0, 1].map(function(i) {
			return (point[i] - pos[i] - this.offset[i]);
		}.bind(this));

		if (this.options.snap) {
			if (Object.isFunction(this.options.snap)) {
				p = this.options.snap(p[0], p[1], this);
			}
			else if (Object.isArray(this.options.snap)) {
				p = p.map(function(v, i) {
					return (Math.round((v / this.options.snap[i])) * this.options.snap[i]);
				}.bind(this));
			}
			else {
				p = p.map(function(v) {
					return (Math.round((v / this.options.snap)) * this.options.snap);
				}.bind(this));
			}
			
		}

		var style = this.element.style;
		if (!this.options.constraint || (this.options.constraint == 'horizontal')) {
			style.left = p[0] + 'px';
		}
		
		if (!this.options.constraint || (this.options.constraint == 'vertical')) {
			style.top = p[1] + 'px';
		}

		if (style.visibility == 'hidden') {
			style.visibility = '';
		}
	},

	stopScrolling: function() {
		if (this.scrollInterval) {
			clearInterval(this.scrollInterval);
			this.scrollInterval = null;
			Draggables._lastScrollPointer = null;
		}
	},

	startScrolling: function(speed) {
		if (!(speed[0] || speed[1])) {
			return;
		}
		
		this.scrollSpeed = [speed[0] * this.options.scrollSpeed, speed[1] * this.options.scrollSpeed];
		this.lastScrolled = new Date();
		this.scrollInterval = setInterval(function() {
			this.scroll();
		}.bind(this), 10);
	},

	scroll: function() {
		var current = new Date();
		var delta = current - this.lastScrolled;
		this.lastScrolled = current;
		
		if (this.options.scroll == window) {
			with (this._getWindowScroll(this.options.scroll)) {
				if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
					var d = delta / 1000;
					this.options.scroll.scrollTo(left + d * this.scrollSpeed[0], top + d * this.scrollSpeed[1]);
				}
			}
		}
		else {
			this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
			this.options.scroll.scrollTop += this.scrollSpeed[1] * delta / 1000;
		}
		
		// Position.prepare();
		// Droppables.show(Draggables._lastPointer, this.element);
		Draggables.notify('onDrag', this);
		
		if (this._isScrollChild) {
			Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
			Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
			Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
			
			if (Draggables._lastScrollPointer[0] < 0) Draggables._lastScrollPointer[0] = 0;
			if (Draggables._lastScrollPointer[1] < 0) Draggables._lastScrollPointer[1] = 0;
			
			this.draw(Draggables._lastScrollPointer);
		}

		if (this.options.change) {
			this.options.change(this);
		}
	},

	_getWindowScroll: function(w) {
		var T, L, W, H;
		
		with (w.document) {
			if (w.document.documentElement && documentElement.scrollTop) {
				T = documentElement.scrollTop;
				L = documentElement.scrollLeft;
			}
			else if (w.document.body) {
				T = body.scrollTop;
				L = body.scrollLeft;
			}
			
			if (w.innerWidth) {
				W = w.innerWidth;
				H = w.innerHeight;
			}
			else if(w.document.documentElement && documentElement.clientWidth) {
				W = documentElement.clientWidth;
				H = documentElement.clientHeight;
			}
			else {
				W = body.offsetWidth;
				H = body.offsetHeight;
			}
		}
		return {
			top : T,
			left : L,
			width : W,
			height : H
		};
	}
});

Draggable._dragging = { };
