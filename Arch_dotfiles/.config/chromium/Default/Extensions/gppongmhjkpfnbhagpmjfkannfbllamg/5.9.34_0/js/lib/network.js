(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
(function() {

	function isChrome() {
		return (typeof chrome !== 'undefined' &&
				window.navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9\.]+)/));
	}

	var requiredBrowserApis = [
		browser.webNavigation,
		browser.tabs,
		browser.webRequest,
		browser.runtime
	];

	var MIN_FF_MAJOR_VERSION = 51;

	var areListenersRegistered = false;
	var secBefore = 2000;
	var secAfter = 5000;
	var secBetweenDupAssets = 10e3;
	var minVidSize = 500e3;
	var maxVidSize = 25e6;
	var maxContentRange = 25e6;
	var videoExtensions = [
		'af', '3gp', 'asf', 'avchd', 'avi', 'cam', 'dsh', 'flv', 'm1v', 'm2v',
		'fla', 'flr', 'sol', 'm4v', 'mkv', 'wrap', 'mng', 'mov', 'mpeg', 'mpg',
		'mpe', 'mp4', 'mxf', 'nsv', 'ogg', 'rm', 'svi', 'smi', 'wmv', 'webm'
	];
	var extensionsReg = new RegExp('\\.' + videoExtensions.join('$|\\.') + '$');
	var videoContentTypesPrefixes = ['binary/octet-stream', 'video/', 'flv-application/', 'media'];

	var bannedContentTypes = ['video/mp2t','video/f4m','video/f4f'];
	var bannedFiletypes = ['ts'];
	var bannedFiletypesReg = new RegExp('\\.' + bannedFiletypes.join('$|\\.') + '$');
	var whitelistReqTypes = ['object', 'xmlhttprequest', 'other'];

	var topVideoAssetDomains = [
		'2mdn.net',
		'adap.tv',
		'adnxs.com',
		'adsrvr.org',
		'btrll.com',
		'celtra.com',
		'flashtalking.com',
		'flite.com',
		'innovid.com',
		'jivox.com',
		'mixpo.com',
		'nytimes.com',
		'playwire.com',
		'selectmedia.asia',
		'serving-sys.com',
		'solvemedia.com',
		'spotible.com',
		'teads.tv',
		'tribalfusion.com',
		'tubemogul.com',
		'videologygroup.com',
		'washingtonpost.com'
	];

	var robotsTxtAllows = wappalyzer.robotsTxtAllows.bind(wappalyzer);
	if ( !String.prototype.endsWith ) {
		String.prototype.endsWith = function(searchString, position) {
			var subjectString = this.toString();
			if ( typeof position !== 'number' || !isFinite(position) ||
				Math.floor(position) !== position || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		};
	}

	function getFrame(getFrameDetails, callback) {
		var gettingFrame = browser.webNavigation.getFrame(getFrameDetails);
		gettingFrame.then(callback);
	}

	function ifBrowserValid(callback, elseCallback) {
		if ( isChrome() ) {

			callback();
		} else if ( typeof browser !== 'undefined' ) {
			try {
				var gettingInfo = browser.runtime.getBrowserInfo();
				gettingInfo.then(function(browserInfo) {
					var browserVersion = parseInt(browserInfo.version.split('.')[0]);

					if ( browserInfo.name === 'Firefox' &&
						browserVersion >= MIN_FF_MAJOR_VERSION) {
						callback();
					} else {
						elseCallback();
					}
				});
			} catch (err) {

				elseCallback();
			}
		} else {
			elseCallback();
		}
	}

	function ifTrackingEnabled(details, ifCallback, elseCallback) {

		var fullIfCallback = function() {
			allowedByRobotsTxt(details, ifCallback, elseCallback);
		};

		browser.storage.local.get('tracking').then(function(item) {

			if ( item.hasOwnProperty('tracking') ) {
				if ( item.tracking ) {
					fullIfCallback();
				} else {
					elseCallback();
				}
			} else {
				fullIfCallback();
			}
		});

	}

	function allowedByRobotsTxt(details, ifCallback, elseCallback) {
		if (  details.url && !details.url.startsWith('chrome://')  ) {
			robotsTxtAllows(details.url).then(ifCallback, elseCallback);
		} else {
			elseCallback();
		}
	}

	function isPixelRequest(request) {
		return (request.type === 'image' || request.responseStatus === 204) &&
				request.size <= 1000;
	}

	function isVpaidOrVastRequest(request) {
		var lowerCaseUrl = request.url.toLowerCase();
		return lowerCaseUrl.indexOf('vpaid') !== -1 || lowerCaseUrl.indexOf('vast') !== -1;
	}

	function hasValidRequestType(request) {
		return whitelistReqTypes.indexOf(request.type) >= 0;
	}

	function stripQueryParams(url) {
		return url.split('?', 1)[0];
	}

	function parseHostnameFromUrl(url) {
		var parser = document.createElement('a');
		parser.href = url;
		return parser.hostname;
	}

	function hasDomain(url, domain) {
		return parseHostnameFromUrl(url).endsWith(domain);
	}

	function findHeader(headers, key) {
		var header;
		for ( var i = 0; i < headers.length; i += 1 ) {
			header = headers[i];
			if ( header.name.toLowerCase() === key ) {
				return header;
			}
		}
		return null;
	}

	function validVideoType(vtype) {
		var goodType = videoContentTypesPrefixes.some(function(prefix) {
			return vtype.indexOf(prefix) === 0;
		});
		return goodType;
	}

	function assetMsgKey(assetReq) {
		var url = stripQueryParams(assetReq.url);
		var key = assetReq.frameId + '-' + url;
		return key;
	}

	var PageNetworkTrafficCollector = function(tabId) {
		this.tabId = tabId;
		this.displayAdFound = false;
		this.requests = {};
		this.msgsBeingSent = {};
		this.assetsSeen = {};
		this.allRedirects = {};
	};

	var globalPageContainer = {
		collectors: {},
		dyingCollectors: {},

		cleanupCollector: function(tabId) {
			if ( tabId in this.collectors ) {
				delete globalPageContainer.collectors[tabId];
			}
		},

		onNewNavigation: function(details) {
			var tabId = details.tabId;
			this.cleanupCollector(tabId);

			ifTrackingEnabled(
				details,
				function() {
					if ( !areListenersRegistered ) {

						registerListeners();
					}
					this.collectors[tabId] = new PageNetworkTrafficCollector(tabId);
				}.bind(this),
				function() {
					if ( areListenersRegistered ) {

						unregisterListeners();
					}
				}
			);
		},

		onNavigationCommitted: function(details) {

		},

		onNavigationCompleted: function(details) {

		},

		onTabClose: function(tabId, closeInfo) {

			this.cleanupCollector(tabId);
			delete this.collectors[tabId];
		},

		onDisplayAdFound: function(tabId) {
			this.collectors[tabId].displayAdFound = true;
		},

		getRandId: function() {
			return String(Math.floor(Math.random() * 1e9));
		},

		getCollector: function(tabId) {
			if ( this.collectors.hasOwnProperty(tabId) ) {
				return this.collectors[tabId];
			}
			return null;
		},

		forwardCall: function(details, collectorMemberFunction) {
			var collector = this.getCollector(details.tabId);
			if ( collector !== null ) {
				collectorMemberFunction.apply(collector, [details]);
			}
		}
	};

	PageNetworkTrafficCollector.prototype.sendLogMessageToTabConsole = function() {
		var logMessage = Array.from(arguments).join(' ');
		var message = {message: logMessage, event: 'console-log-message'};
		browser.tabs.sendMessage(this.tabId, message);
	};

	PageNetworkTrafficCollector.prototype.sendToTab = function(assetReq, reqs, curPageUrl, adTrackingEvent) {
		var msg = {};
		msg.assets = [];
		msg.requests = [];
		msg.event_data = {};
		msg.event = adTrackingEvent;
		if ( adTrackingEvent === 'new-video-ad' ) {
			msg.requests = reqs;
			msg.requests.sort(function(reqA, reqB) {return reqA.requestTimestamp - reqB.requestTimestamp;});
			if ( assetReq ) {
				msg.assets = [assetReq];
			}
		} else if ( adTrackingEvent === 'new-invalid-video-ad' ) {
			msg.requests = reqs.map(function(request) {
				return parseHostnameFromUrl(request.url);
			});
			msg.assets = [{

				url: parseHostnameFromUrl(assetReq.url),

				contentType: assetReq.contentType,
				size: assetReq.size
			}];
		}
		msg.origUrl = curPageUrl;
		msg.displayAdFound = this.displayAdFound;

		browser.tabs.sendMessage(this.tabId, msg);
	};

	PageNetworkTrafficCollector.prototype.getRedirKey = function(url, frameId) {
		return url + ':' + frameId;
	};

	PageNetworkTrafficCollector.prototype.seenBefore = function(request) {
		var oldTime = this.assetsSeen[assetMsgKey(request)];
		if ( oldTime && (request.requestTimestamp-oldTime < secBetweenDupAssets)){

			return true;
		}
		return false;
	};

	PageNetworkTrafficCollector.prototype.recordSeenAsset = function(request) {
		this.assetsSeen[assetMsgKey(request)] = request.requestTimestamp;
	};

	PageNetworkTrafficCollector.prototype.onBeforeRequest = function(details) {
		var req = {
			url: details.url,
			type: details.type,
			httpMethod: details.method,
			frameId: details.frameId,
			parentFrameId: details.parentFrameId,
			requestTimestamp: details.timeStamp,
		};
		this.requests[details.requestId] = req;
	};

	PageNetworkTrafficCollector.prototype.onSendHeaders = function(details) {
		var request, header;
		request = this.requests[details.requestId];
		header = request && findHeader(details.requestHeaders, 'x-requested-with');
		if ( header && header.value.toLowerCase().indexOf('flash') > -1 ) {
			request.from_flash = true;
		}
	};

	PageNetworkTrafficCollector.prototype.onHeadersReceived = function(details) {
		var getFrameDetails = {
			tabId: details.tabId,
			processId: null,
			frameId: details.frameId
		};
		var pageNetworkTrafficController = this;
		getFrame(getFrameDetails, function(frameDetails) {
			if ( frameDetails && frameDetails.url ) {
				pageNetworkTrafficController._onHeadersReceived(details, frameDetails);
			}
		});
	};

	PageNetworkTrafficCollector.prototype._onHeadersReceived = function(details, frameDetails) {
		var contentSize, contentRange;

		var request = this.requests[details.requestId];
		if ( request ) {
			var redirParent = this.allRedirects[this.getRedirKey(details.url, details.frameId)];
			var header = request && findHeader(details.responseHeaders, 'content-type');
			var contentType = header && header.value.toLowerCase();

			if ( contentType){
				request.contentType = contentType;
			}
			header = request && findHeader(details.responseHeaders, 'content-length');
			contentSize = header && header.value;
			if ( contentSize ) {
				request.size = request.size || 0;
				request.size += parseInt(contentSize);
			}
			header = request && findHeader(details.responseHeaders, 'content-range');
			contentRange = header && header.value;
			if ( contentRange ) {
				request.contentRange = parseInt(contentRange.split('/')[1]);
			}

			var frameUrl = null;
			if ( frameDetails && frameDetails.url ) {
				frameUrl = frameDetails.url;
			}
			if ( !this.bannedRequest(request) &&
				(this.isVideoReq(frameUrl, request) || (redirParent && redirParent.isVideo))) {
				request.isVideo = true;
			}
		}
	};

	PageNetworkTrafficCollector.prototype.onBeforeRedirect = function(details) {
		var request = this.requests[details.requestId];
		if ( request ) {
			if ( request.redirects ) {
				request.redirects.push(details.redirectUrl);
			} else {
				request.redirects = [details.redirectUrl];
			}
			this.allRedirects[this.getRedirKey(details.redirectUrl, details.frameId)] = request;
		}
	};

	PageNetworkTrafficCollector.prototype.isYoutubeMastheadRequest = function(url) {
		var re = /video_masthead/;
		return this.hasYoutubeDomain(url) && re.test(url);
	};
	PageNetworkTrafficCollector.prototype.isYoutubeVideoRequest = function(srcUrl, destUrl) {
		if ( !this.hasYoutubeDomain(srcUrl) ) {
			return false;
		}

		var re = /https?:\/\/r.*?\.googlevideo\.com\/videoplayback\?/;
		return re.test(destUrl);
	};
	PageNetworkTrafficCollector.prototype.processResponse = function(requestDetails, frameDetails) {
		var request;
		if ( requestDetails ) {
			request = this.requests[requestDetails.requestId];
			if ( request ) {
				request.responseStatus = requestDetails.statusCode;
				request.responseTimestamp = requestDetails.timeStamp;

				var frameUrl = null;
				if ( frameDetails && frameDetails.url ) {
					frameUrl = frameDetails.url;
				}

				var requestUrl = null;
				if ( request.url ) {
					requestUrl = request.url;
				}

				if ( this.isYoutubeAdReq(frameUrl, requestUrl) ) {
					var destVideoId = this.parseYoutubeVideoIdFromUrl(requestUrl);
					var srcVideoId = this.parseYoutubeVideoIdFromUrl(frameUrl);
					if ( srcVideoId && destVideoId ) {
						request.isYoutubeAd = true;
						request.isVideo = true;
						request.rawSrcUrl = frameUrl;
						request.rawDestUrl = requestUrl;
						request.url = 'https://www.youtube.com/watch?v=' + this.parseYoutubeVideoIdFromUrl(requestUrl);
					}
				} else if ( !this.bannedRequest(request) &&
						(this.isVideo || this.isVideoReq(frameUrl, request))) {
					request.isVideo = true;
				}

				if ( request.isVideo ) {

					var msgKey = assetMsgKey(request);
					this.msgsBeingSent[msgKey] = request;
					if ( !this.seenBefore(request) ) {
						this.sendMsgWhenQuiet(msgKey);
					}
					this.recordSeenAsset(request);
				}
			}
		}
	};

	PageNetworkTrafficCollector.prototype.onResponseStarted = function(responseDetails) {
		if ( responseDetails.frameId < 0 ) {
			responseDetails.frameId = 99999;

		}
		var getFrameDetails = {
			tabId: responseDetails.tabId,
			processId: null,
			frameId: responseDetails.frameId
		};
		var pageNetworkTrafficController = this;
		getFrame(getFrameDetails, function(frameDetails) {
			if ( frameDetails && frameDetails.url ) {
				pageNetworkTrafficController.processResponse(responseDetails, frameDetails);
			}
		});
	};

	PageNetworkTrafficCollector.prototype.hasBannedFiletype = function(request) {
		var url = stripQueryParams(request.url);
		if ( bannedFiletypesReg.exec(url) ) {
			return true;
		} else {
			return false;
		}
	};

	PageNetworkTrafficCollector.prototype.checkContentHeaders = function(request) {
		if ( request.contentType && validVideoType(request.contentType) ) {
			return true;
		}
		return false;
	};

	PageNetworkTrafficCollector.prototype.checkUrlExtension = function(request) {
		var url = stripQueryParams(request.url);
		if ( extensionsReg.exec(url) ) {
			return true;
		} else {
			return false;
		}
	};

	PageNetworkTrafficCollector.prototype.isVideoReq = function(srcUrl, request) {
		if ( this.isYoutubeVideoRequest(srcUrl, request.url) ) {
			return false;
		}
		return this.checkUrlExtension(request) || this.checkContentHeaders(request);
	};
	PageNetworkTrafficCollector.prototype.hasYoutubeDomain = function(url) {
		var hostname = parseHostnameFromUrl(url) ;
		if ( hostname === 'www.youtube.com' ) {
			return true;
		}
		return false;
	};
	PageNetworkTrafficCollector.prototype.parseYoutubeVideoIdFromUrl = function(url) {
		var re = /^https?:\/\/www\.youtube\.com\/get_video_info.*(?:\?|&)video_id=(.*?)(?:$|&)/;
		var match = re.exec(url);
		if ( match && match.length > 1 ) {
			return match[1];
		}

		re = /^https?:\/\/www\.youtube\.com\/embed\/(.*?)(?:$|\?)/;
		match = re.exec(url);
		if ( match && match.length > 1 ) {
			return match[1];
		}

		re = /^https?:\/\/www\.youtube\.com\/watch.*(\?|&)v=([^&]*)/;
		match = re.exec(url);
		if ( match && match.length > 1 ) {
			return match[1];
		}
		return null;
	};

	PageNetworkTrafficCollector.prototype.isYoutubeGetVideoInfoReq = function(url) {
		var re = /^https?:\/\/www\.youtube\.com\/get_video_info\?/;
		return re.test(url);
	};
	PageNetworkTrafficCollector.prototype.isYoutubeAdReq = function(srcUrl, destUrl) {

		if ( !this.hasYoutubeDomain(srcUrl) ||
			!this.isYoutubeGetVideoInfoReq(destUrl)) {
			return false;
		}
		if ( this.parseYoutubeVideoIdFromUrl(srcUrl) ===
			this.parseYoutubeVideoIdFromUrl(destUrl) &&
			!this.isYoutubeMastheadRequest(destUrl)) {
			return false;
		}
		return true;
	};

	PageNetworkTrafficCollector.prototype.bannedRequest = function(request) {
		return this.bannedVideoType(request) || this.hasBannedFiletype(request) || this.bannedVideoSize(request);
	};

	PageNetworkTrafficCollector.prototype.bannedVideoType = function(request) {
		var badType = false;
		if ( request.contentType ) {
			badType = bannedContentTypes.some(function(prefix) {
				return request.contentType.indexOf(prefix) >= 0;
			});
		}
		return badType;
	};

	PageNetworkTrafficCollector.prototype.bannedVideoSize = function(request) {
		if ( request.size !== null ) {
			if ( request.size < minVidSize || request.size > maxVidSize || request.contentRange > maxContentRange ) {
				return true;
			}
		}
		return false;
	};

	PageNetworkTrafficCollector.prototype.grabTagReqs = function(tabRequests, assetRequest) {
		var minTimestamp, maxTimestamp;
		minTimestamp = assetRequest.requestTimestamp - secBefore;
		maxTimestamp = assetRequest.requestTimestamp + secAfter;

		var filteredRequests = tabRequests.filter(function(request) {
			return (request.requestTimestamp > minTimestamp &&
				request.requestTimestamp < maxTimestamp &&
				request.frameId === assetRequest.frameId &&
				request.url !== assetRequest.url &&
				(hasValidRequestType(request) ||
				isPixelRequest(request)));
		});

		return filteredRequests;
	};

	PageNetworkTrafficCollector.prototype.isValidVideoAd = function(assetRequest, tagRequests) {
		var hasVpaidOrVastRequest = tagRequests.some(function(tagRequest) {
			return isVpaidOrVastRequest(tagRequest);
		});

		if ( assetRequest.isYoutubeAd ) {
			return true;
		}
		if ( hasVpaidOrVastRequest ) {
			return true;
		}
		var hasTopVideoAssetDomain = topVideoAssetDomains.some(function(assetDomain) {
			return hasDomain(assetRequest.url, assetDomain);
		});

		return hasTopVideoAssetDomain;
	};

	PageNetworkTrafficCollector.prototype.sendMsgWhenQuiet = function(msgKey) {
		var _this = this,
			origPageUrl, msgAssetReq;
		msgAssetReq = this.msgsBeingSent[msgKey];
		browser.tabs.get(this.tabId).then(function(tab) {
			origPageUrl = tab.url;
		});

		setTimeout(function() {
			var rawRequests = [];
			if ( globalPageContainer.collectors[_this.tabId] === _this ) {
				for ( var reqId in _this.requests ) {
					rawRequests.push(_this.requests[reqId]);
				}
				var tagReqs = _this.grabTagReqs(rawRequests, msgAssetReq);

				if ( _this.isValidVideoAd(msgAssetReq, tagReqs) ) {
					_this.sendToTab(msgAssetReq, tagReqs, origPageUrl, 'new-video-ad');
				} else {

					_this.sendToTab(msgAssetReq, tagReqs, origPageUrl, 'new-invalid-video-ad');
				}

			} else {

			}
			delete _this.msgsBeingSent[msgKey];
		}, secAfter+secBefore);
	};

	PageNetworkTrafficCollector.prototype.existingMessage = function(candidateRequest) {
		var frameMsg = this.msgsBeingSent[candidateRequest.frameId];
		if ( frameMsg ) {
			return frameMsg;
		} else {
			return null;
		}
	};

	function onBeforeRequestListener(details) {
		globalPageContainer.forwardCall(details, PageNetworkTrafficCollector.prototype.onBeforeRequest);
	}

	function onSendHeadersListener(details) {
		globalPageContainer.forwardCall(details, PageNetworkTrafficCollector.prototype.onSendHeaders);
	}

	function onHeadersReceivedListener(details) {
		globalPageContainer.forwardCall(details, PageNetworkTrafficCollector.prototype.onHeadersReceived);
	}

	function onBeforeRedirectListener(details) {
		globalPageContainer.forwardCall(details, PageNetworkTrafficCollector.prototype.onBeforeRedirect);
	}

	function onResponseStartedListener(details) {
		globalPageContainer.forwardCall(details, PageNetworkTrafficCollector.prototype.onResponseStarted);
	}

	function onCommittedListener(details) {
		if ( details.frameId === 0 ) {
			globalPageContainer.onNavigationCommitted(details);
		}
	}

	function onCompletedListener(details) {
		if ( details.frameId === 0 ) {
			globalPageContainer.onNavigationCompleted(details);
		}
	}

	function onRemovedListener(tabId, closeInfo) {
		globalPageContainer.onTabClose(tabId, closeInfo);
	}

	function onMessageListener(message, sender, sendResponse) {
		if ( message.event === 'new-ad' && message.data.event === 'ad' ) {
			var tabId = sender.tab.id;
			if ( tabId ) {
				globalPageContainer.onDisplayAdFound(tabId);
			}
		}
	}

	function registerListeners() {

		browser.webRequest.onBeforeRequest.addListener(
			onBeforeRequestListener,
			{urls: ['http://*/*', 'https://*/*']},
			[]
		);

		browser.webRequest.onSendHeaders.addListener(
			onSendHeadersListener,
			{urls: ['http://*/*', 'https://*/*']},
			['requestHeaders']
		);

		browser.webRequest.onHeadersReceived.addListener(
			onHeadersReceivedListener,
			{urls: ['http://*/*', 'https://*/*']},
			['responseHeaders']
		);

		browser.webRequest.onBeforeRedirect.addListener(
			onBeforeRedirectListener,
			{urls: ['http://*/*', 'https://*/*']},
			[]
		);

		browser.webRequest.onResponseStarted.addListener(
			onResponseStartedListener,
			{urls: ['http://*/*', 'https://*/*']},
			['responseHeaders']
		);

		browser.webNavigation.onCommitted.addListener(onCommittedListener);
		browser.webNavigation.onCompleted.addListener(onCompletedListener);
		browser.tabs.onRemoved.addListener(onRemovedListener);
		browser.runtime.onMessage.addListener(onMessageListener);

		areListenersRegistered = true;
	}

	function unregisterListeners() {

		browser.webRequest.onBeforeRequest.removeListener(
			onBeforeRequestListener
		);

		browser.webRequest.onSendHeaders.removeListener(
			onSendHeadersListener
		);

		browser.webRequest.onHeadersReceived.removeListener(
			onHeadersReceivedListener
		);

		browser.webRequest.onBeforeRedirect.removeListener(
			onBeforeRedirectListener
		);

		browser.webRequest.onResponseStarted.removeListener(
			onResponseStartedListener
		);

		browser.webNavigation.onCommitted.removeListener(onCommittedListener);
		browser.webNavigation.onCompleted.removeListener(onCompletedListener);
		browser.tabs.onRemoved.removeListener(onRemovedListener);
		browser.runtime.onMessage.removeListener(onMessageListener);
		areListenersRegistered = false;
	}

	function areRequiredBrowserApisAvailable() {
		return requiredBrowserApis.every(function(api) {
			return typeof api !== 'undefined';
		});
	}

	if ( areRequiredBrowserApisAvailable() ) {
			ifBrowserValid(
				function() {
					browser.webNavigation.onBeforeNavigate.addListener(
						function(details) {
							if ( details.frameId === 0 ) {
								globalPageContainer.onNewNavigation(details);
							}
						},
						{
							url: [{urlMatches: 'http://*/*'}, {urlMatches: 'https://*/*'}]
						}
					);
				}, function() {

				}
			);
	}

	browser.runtime.onConnect.addListener((port) => {
		port.onMessage.addListener((message) => {
			if ( message === 'is_browser_valid' ) {
				ifBrowserValid(
					port.postMessage({'browser_valid': true}),
					port.postMessage({'browser_valid': false})
				);
			}
		});
	});

	browser.runtime.onConnect.addListener((port) => {
		port.onMessage.addListener((message) => {
			if ( message === 'is_tracking_enabled' ) {
				ifTrackingEnabled(
					port.sender.tab,
					function() {
						try {port.postMessage({'tracking_enabled': true});}
						catch(err) {} },
					function() {
						try {port.postMessage({'tracking_enabled': false});}
						catch(err) {} }
				);
			}
			return true;
		});
	});

})();

},{}]},{},[1]);
