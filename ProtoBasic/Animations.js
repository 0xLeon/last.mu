/*
 * Animation Class
 * Copyright (C) 2011-2012 Stefan Hahn
 */
var Animations = (function() {
	var AbstractAnimation = new ClassSystem.AbstractClass({
		initialize: function(element, config) {
			this.element = $(element);
			this.config = config || {};
			
			this.addGlobalAnimationListeners();
			this.handleConfig();
			this.doAnimation();
		},
		
		addGlobalAnimationListeners: function() {
			if (!this.element.animationGlobalListenersAdded) {
				this.element.addEventListener(Animations.config.events.animation.start, function(event) {
					event.target.animating = true;
					
					switch (event.animationName) {
						case 'fadeIn':
							event.target.style.display = '';
							break;
					}
					
					this.config.onAnimationStart(event);
				}.bind(this), false);
				this.element.addEventListener(Animations.config.events.animation.end, function(event) {
					switch (event.animationName) {
						case 'fadeOut':
							event.target.style.display = 'none';
							break;
					}
					
					this.config.onAnimationEnd(event);
					
					event.target.animating = false;
					event.target.style[Animations.config.domAnimationString] = '';
				}.bind(this), false);
				this.element.addEventListener(Animations.config.events.transition.end, function(event) {
					if (Element.hasClassName(event.target, 'transitionAll')) {
						Element.removeClassName(event.target, 'transitionAll');
						
						this.config.onAnimationEnd(event);
					}
				}.bind(this), true);
				
				this.element.animationGlobalListenersAdded = true;
			}
		},
		
		handleConfig: function() {
			if (!Object.isFunction(this.config.onAnimationBeforeStart)) this.config.onAnimationBeforeStart = Function.empty;
			if (!Object.isFunction(this.config.onAnimationStart)) this.config.onAnimationStart = Function.empty;
			if (!Object.isFunction(this.config.onAnimationEnd)) this.config.onAnimationEnd = Function.empty;
		},
		
		doAnimation: function() {
			this.config.onAnimationBeforeStart({
				target: this.element
			});
		}
	});
	var FadeIn = new ClassSystem.Class(AbstractAnimation, {
		doAnimation: function($super) {
			if (!this.element.animating) {
				$super();
				if (Animations.config.domAnimationString === 'WebkitAnimation') this.element.style.display = '';
				
				this.element.style[Animations.config.domAnimationString] = 'fadeIn 1s ease-in-out forwards';
			}
		}
	});
	var FadeOut = new ClassSystem.Class(AbstractAnimation, {
		doAnimation: function($super) {
			if (!this.element.animating) {
				$super();
				this.element.style[Animations.config.domAnimationString] = 'fadeOut 1s ease-in-out forwards';
			}
		}
	});
	var Highlight = new ClassSystem.Class(AbstractAnimation, {
		doAnimation: function($super) {
			if (!this.element.animating) {
				$super();
				this.element.style[Animations.config.domAnimationString] = 'highlight 1500ms linear forwards';
			}
		}
	});
	var Morph = new ClassSystem.Class(AbstractAnimation, {
		handleConfig: function($super) {
			$super();
			
			if (!this.config.properties) {
				throw new Error('No property list given.')
			}
			else {
				if (!(this.config.properties instanceof Array)) {
					this.config.properties = [this.config.properties];
				}
				
				this.config.properties = $A(this.config.properties);
			}
			
			if (!this.config.values) {
				throw new Error('No value list given.')
			}
			else {
				if (!(this.config.values instanceof Array)) {
					this.config.values = [this.config.values];
				}
				
				this.config.values = $A(this.config.values);
			}
		},
		
		doAnimation: function($super) {
			$super();

			Element.addClassName(this.element, 'transitionAll');
			
			this.config.onAnimationStart({
				target: this.element
			});
			
			this.config.properties.each(function(item, index) {
				this.element.style[item] = this.config.values[index];
			}, this);
		}
	});
	
	// get config
	var config = {
		animation: false,
		domAnimationString: 'animation',
		cssVendorPrefix: '',
		styleID: 17,
		events: {
			animation: {
				start: 'animationstart',
				end: 'animationend',
				iteration: 'animationiteration'
			},
			transition: {
				end: 'transitionend'
			}
		}
	};
	
	if (!Object.isUndefined($$('body')[0].style.animationName)) {
		config.animation = true;
	}
	
	if (!config.animation) {
		['Moz', 'Webkit', 'O'].each(function(prefix) {
			if (!Object.isUndefined($$('body')[0].style[prefix+'AnimationName'])) {
				config.animation = true;
				config.domAnimationString = prefix+'Animation';
				config.cssVendorPrefix = '-'+prefix.toLowerCase()+'-';
				
				if (prefix == 'Webkit') {
					config.events.animation.start = 'webkitAnimationStart';
					config.events.animation.end = 'webkitAnimationEnd';
					config.events.animation.iteration = 'webkitAnimationIteration';
					config.events.transition.end = 'webkitTransitionEnd'; 
				}
				
				throw $break;
			}
		});
	}
	
	$$('head > link[rel="stylesheet"]').each(function(styleNode) {
		var result = null;
		
		if (!!(result = styleNode.getAttribute('href').match(/style-(\d+)\.css$/))) {
			config.styleID = parseInt(result[1], 10);
			
			throw $break;
		}
	});
	
	// add style rules
	Style.addNode('@' + config.cssVendorPrefix + 'keyframes fadeIn {\n' +
		'from {\n' +
			'opacity: 0;\n' +
		'}\n' +
		'to {\n' +
			'opacity: 1;\n' +
		'}\n' +
	'}');
	Style.addNode('@' + config.cssVendorPrefix + 'keyframes fadeOut {\n' +
		'from {\n' +
			'opacity: 1;\n' +
		'}\n' +
		'to {\n' +
			'opacity: 0;\n' +
		'}\n' +
	'}');
	Style.addNode('@' + config.cssVendorPrefix+'keyframes highlight {\n' +
		'0% {\n' +
			'background-color: rgba(255, 255, 153, 0);\n' +
		'}\n' +
		'15% {\n' +
			'background-color: rgba(255, 255, 153, 1);\n' +
		'}\n' +
		'100% {\n' +
			'background-color: transparent;\n' +
		'}\n' +
	'}');
	Style.addNode('.transitionOpacity { ' + config.cssVendorPrefix + 'transition: opacity 1s ease-in-out; transition: opacity 1s ease-in-out; }');
	Style.addNode('.transitionAll { ' + config.cssVendorPrefix + 'transition: all 1s ease-in-out; transition: all 1s ease-in-out; }');
	
	return {
		config:		config,
		
		FadeIn:		FadeIn,
		FadeOut:	FadeOut,
		Highlight:	Highlight,
		Morph:		Morph
	};
})();
