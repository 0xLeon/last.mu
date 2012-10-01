/* 
 * Compare Module
 * Copyright (C) 2012 Stefan Hahn
 */
Modules.AddOn.Compare = new ClassSystem.Class(Modules.Util.AbstractModule, {
	initializeVariables: function() {
		this.posts = [];
		this.cacheStorage = Storage.getInterface(this.storage.namespace + '.compatibilityCache');
		
		$$('.post').each(function(post) {
			this.posts.push({
				postID: parseInt(post.getAttribute('id').slice(1)),
				text: post.querySelector('.postMessage').innerHTML.replace(/<br(?: ?\/)?>/g, "\n")
			});
		}, this);
	},
	
	addStyleRules: function() {
		Style.addNode('.lastmuSideArrows { color: transparent !important; }');
		Style.addNode('.lastmuInfo > p { margin: 5px !important; }');
	},
	
	registerOptions: function() {
		this.callerObj.registerBoolOption('compare', 'Compare taste in posts', true);
	},
	
	buildUI: function() {
		if (this.storage.getValue('lastfmUsername') && this.storage.getValue('compareStatus')) {
			this.posts.each(function(post) {
				var match = post.text.match(/last(?:\.fm|fm(?:\.[A-Za-z]{2,3})+)\/user\/(.*)(?:\s|$)/);
				
				if (!!match && (match[1].toLowerCase() !== this.storage.getValue('lastfmUsername').toLowerCase())) {
					this.compareTaste(match[1], post.postID);
				}
			}, this);
		}
	},
	
	compareTaste: function(username, postID) {
		var cachedData = this.cacheStorage.getValue(username.toLowerCase());
		
		if (!cachedData || ((Math.floor((new Date()).getTime() / 1000) - cachedData.time) > 604800)) {
			this.compareOnline(username, postID);
		}
		else {
			this.compareCached(cachedData, postID);
		}
	},
	
	compareCached: function(cachedData, postID) {
		this.insertComparisonResult(postID, cachedData.username, cachedData.score, cachedData.stats, cachedData.commonArtists);
	},
	
	compareOnline: function(username, postID) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'http://ws.audioscrobbler.com/2.0/?method=tasteometer.compare&type1=user&type2=user&api_key=f27f59e52cce2ed5fd8bbd412c7165bf&limit=5&value1=' + encodeURIComponent(this.storage.getValue('lastfmUsername')) + '&value2=' + username,
			headers: {
				'Accept': 'application/atom+xml,application/xml,text/xml'
			},
			onload: function(response) {
				var lastfmXML = (new DOMParser()).parseFromString(response.responseText, 'application/xml');
				
				if ((response.status == 200) && lastfmXML.querySelector('score')) {
					var score = parseFloat(lastfmXML.querySelector('score').firstChild.nodeValue);
					var stats = this.getCompatibilityStats(score);
					var commonArtists = [];
					
					if (lastfmXML.querySelector('artist > name')) {
						$A(lastfmXML.querySelectorAll('artist > name')).each(function(nameNode, index) {
							commonArtists.push(nameNode.firstChild.nodeValue);
						});
					}
					
					// caching data
					this.cacheStorage.setValue(username.toLowerCase(), {
						username: username, 
						score: score,
						stats: stats,
						commonArtists: commonArtists,
						time: Math.floor((new Date()).getTime() / 1000)
					});
					
					// insert data
					this.insertComparisonResult(postID, username, score, stats, commonArtists);
				}
			}.bind(this)
		});
	},
	
	insertComparisonResult: function(postID, username, score, stats, commonArtists) {
		var sideArrows = new Element('div', { 'class': 'sideArrows lastmuSideArrows' });
		var infoBox = new Element('div', { id: 'lastmuInfo' + postID, 'class': 'post reply lastmuInfo' });
		var commonArtistsNode = new Element('p', { style: 'font-size: 0.8em;' });
		var commonArtistsText = '';
		var postWidth = 0;
		var infoWidth = 0;
		
		sideArrows.appendChild(document.createTextNode('>>'));
		infoBox.innerHTML = "<p>Your musical compatibility with <a target='_blank' href='http://www.last.fm/user/" + username + "'>" + username + "</a> is <strong style='color:" + stats.color + "'>" + stats.name.toUpperCase() + "</strong></p>";
		
		if (!!commonArtists.length) {
			commonArtists.each(function(name, index) {
				commonArtistsText += name;
				
				if (index === (commonArtists.length - 2)) {
					commonArtistsText += ' and '
				}
				else if (index === (commonArtists.length - 1)) {
					commonArtistsText += '.';
				}
				else {
					commonArtistsText += ', ';
				}
			});
			
			commonArtistsNode.innerHTML = 'Music you have in common includes ' + commonArtistsText;
			infoBox.appendChild(commonArtistsNode);
		}
		
		$('pc' + postID).appendChild(sideArrows);
		$('pc' + postID).appendChild(infoBox);
		
		postWidth = parseFloat(Element.getStyle($('p' + postID), 'width'));
		infoWidth = parseFloat(Element.getStyle($('lastmuInfo' + postID), 'width'));
		
		if (postWidth > infoWidth) {
			infoBox.style.width = postWidth.toString() + 'px';
		}
		else {
			$('p' + postID).style.width = infoWidth.toString() + 'px';
		}
	},
	
	getCompatibilityStats: function(score) {
		var result = {
			name: 'Unknown',
			color: '#000'
		};
		
		if (score > 0) {
			if (score < 0.10) {
				result.name = 'Very Low';
				result.color = '#9A9A9A';
			}
			else if (score < 0.30) {
				result.name = 'Low';
				result.color = '#453E45';
			}
			else if (score < 0.50) {
				result.name = 'Medium';
				result.color = '#5336BD';
			}
			else if (score < 0.70) {
				result.name = 'High';
				result.color = '#05BD4C';
			}
			else if (score < 0.90) {
				result.name = 'Very High';
				result.color = '#E9C102';
			}
			else if (score <= 1.00) {
				result.name = 'Super';
				result.color = '#FF0101';
			}
		}
		
		return result;
	}
});
