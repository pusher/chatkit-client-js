(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Chatkit = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var pusherPlatform = createCommonjsModule(function (module, exports) {
(function webpackUniversalModuleDefinition(root, factory) {
	module.exports = factory();
})(commonjsGlobal, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
function responseToHeadersObject(headerStr) {
    var headers = {};
    if (!headerStr) {
        return headers;
    }
    var headerPairs = headerStr.split('\u000d\u000a');
    for (var _i = 0, headerPairs_1 = headerPairs; _i < headerPairs_1.length; _i++) {
        var headerPair = headerPairs_1[_i];
        var index = headerPair.indexOf('\u003a\u0020');
        if (index > 0) {
            var key = headerPair.substring(0, index);
            var val = headerPair.substring(index + 2);
            headers[key] = val;
        }
    }
    return headers;
}
exports.responseToHeadersObject = responseToHeadersObject;
var ErrorResponse = (function () {
    function ErrorResponse(statusCode, headers, info) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.info = info;
    }
    ErrorResponse.fromXHR = function (xhr) {
        var errorInfo = xhr.responseText;
        try {
            errorInfo = JSON.parse(xhr.responseText);
        }
        catch (e) {
        }
        return new ErrorResponse(xhr.status, responseToHeadersObject(xhr.getAllResponseHeaders()), errorInfo);
    };
    return ErrorResponse;
}());
exports.ErrorResponse = ErrorResponse;
var NetworkError = (function () {
    function NetworkError(error) {
        this.error = error;
    }
    return NetworkError;
}());
exports.NetworkError = NetworkError;
var XhrReadyState;
(function (XhrReadyState) {
    XhrReadyState[XhrReadyState["UNSENT"] = 0] = "UNSENT";
    XhrReadyState[XhrReadyState["OPENED"] = 1] = "OPENED";
    XhrReadyState[XhrReadyState["HEADERS_RECEIVED"] = 2] = "HEADERS_RECEIVED";
    XhrReadyState[XhrReadyState["LOADING"] = 3] = "LOADING";
    XhrReadyState[XhrReadyState["DONE"] = 4] = "DONE";
})(XhrReadyState = exports.XhrReadyState || (exports.XhrReadyState = {}));


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["WARNING"] = 4] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 5] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var ConsoleLogger = (function () {
    function ConsoleLogger(threshold) {
        if (threshold === void 0) { threshold = 2; }
        this.threshold = threshold;
        var groups = Array();
        var hr = '--------------------------------------------------------------------------------';
        if (!window.console.group) {
            window.console.group = function (label) {
                groups.push(label);
                window.console.log('%c \nBEGIN GROUP: %c', hr, label);
            };
        }
        if (!window.console.groupEnd) {
            window.console.groupEnd = function () {
                window.console.log('END GROUP: %c\n%c', groups.pop(), hr);
            };
        }
    }
    ConsoleLogger.prototype.verbose = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        this.log(window.console.log, LogLevel.VERBOSE, items);
    };
    ConsoleLogger.prototype.debug = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        this.log(window.console.log, LogLevel.DEBUG, items);
    };
    ConsoleLogger.prototype.info = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        this.log(window.console.info, LogLevel.INFO, items);
    };
    ConsoleLogger.prototype.warn = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        this.log(window.console.warn, LogLevel.WARNING, items);
    };
    ConsoleLogger.prototype.error = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        this.log(window.console.error, LogLevel.ERROR, items);
    };
    ConsoleLogger.prototype.log = function (logFunction, level, items) {
        var _this = this;
        if (level >= this.threshold) {
            var loggerSignature_1 = "Logger." + LogLevel[level];
            if (items.length > 1) {
                window.console.group();
                items.forEach(function (item) {
                    _this.errorAwareLog(logFunction, item, loggerSignature_1);
                });
                window.console.groupEnd();
            }
            else {
                this.errorAwareLog(logFunction, items[0], loggerSignature_1);
            }
        }
    };
    ConsoleLogger.prototype.errorAwareLog = function (logFunction, item, loggerSignature) {
        if (item.info && item.info.error_uri) {
            var errorDesc = item.info.error_description;
            var errorIntro = errorDesc ? errorDesc : 'An error has occurred';
            logFunction(errorIntro + ". More information can be found at " + item.info.error_uri + ". Error object: ", item);
        }
        else {
            logFunction(loggerSignature + ": ", item);
        }
    };
    return ConsoleLogger;
}());
exports.ConsoleLogger = ConsoleLogger;
var EmptyLogger = (function () {
    function EmptyLogger() {
    }
    EmptyLogger.prototype.verbose = function (message, error) { };
    EmptyLogger.prototype.debug = function (message, error) { };
    EmptyLogger.prototype.info = function (message, error) { };
    EmptyLogger.prototype.warn = function (message, error) { };
    EmptyLogger.prototype.error = function (message, error) { };
    return EmptyLogger;
}());
exports.EmptyLogger = EmptyLogger;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
exports.createRetryStrategyOptionsOrDefault = function (options) {
    var initialTimeoutMillis = options.initialTimeoutMillis || 1000;
    var maxTimeoutMillis = options.maxTimeoutMillis || 5000;
    var limit = -1;
    if (options.limit !== undefined && options.limit != null) {
        limit = options.limit;
    }
    var increaseTimeout;
    if (options.increaseTimeout !== undefined) {
        increaseTimeout = options.increaseTimeout;
    }
    else {
        increaseTimeout = function (currentTimeout) {
            if (currentTimeout * 2 > maxTimeoutMillis) {
                return maxTimeoutMillis;
            }
            else {
                return currentTimeout * 2;
            }
        };
    }
    return {
        increaseTimeout: increaseTimeout,
        initialTimeoutMillis: initialTimeoutMillis,
        limit: limit,
        maxTimeoutMillis: maxTimeoutMillis,
    };
};
var Retry = (function () {
    function Retry(waitTimeMillis) {
        this.waitTimeMillis = waitTimeMillis;
    }
    return Retry;
}());
exports.Retry = Retry;
var DoNotRetry = (function () {
    function DoNotRetry(error) {
        this.error = error;
    }
    return DoNotRetry;
}());
exports.DoNotRetry = DoNotRetry;
var requestMethodIsSafe = function (method) {
    method = method.toUpperCase();
    return (method === 'GET' ||
        method === 'HEAD' ||
        method === 'OPTIONS' ||
        method === 'SUBSCRIBE');
};
var RetryResolution = (function () {
    function RetryResolution(options, logger, retryUnsafeRequests) {
        this.options = options;
        this.logger = logger;
        this.retryUnsafeRequests = retryUnsafeRequests;
        this.currentRetryCount = 0;
        this.initialTimeoutMillis = options.initialTimeoutMillis;
        this.maxTimeoutMillis = options.maxTimeoutMillis;
        this.limit = options.limit;
        this.increaseTimeoutFunction = options.increaseTimeout;
        this.currentBackoffMillis = this.initialTimeoutMillis;
    }
    RetryResolution.prototype.attemptRetry = function (error) {
        this.logger.verbose(this.constructor.name + ":  Error received", error);
        if (this.currentRetryCount >= this.limit && this.limit >= 0) {
            this.logger.verbose(this.constructor.name + ":  Retry count is over the maximum limit: " + this.limit);
            return new DoNotRetry(error);
        }
        if (error instanceof network_1.ErrorResponse && error.headers['Retry-After']) {
            this.logger.verbose(this.constructor.name + ":  Retry-After header is present, retrying in " + error.headers['Retry-After']);
            return new Retry(parseInt(error.headers['Retry-After'], 10) * 1000);
        }
        if (error instanceof network_1.NetworkError ||
            (error instanceof network_1.ErrorResponse &&
                requestMethodIsSafe(error.headers['Request-Method'])) ||
            this.retryUnsafeRequests) {
            return this.shouldSafeRetry(error);
        }
        if (error instanceof network_1.NetworkError) {
            return this.shouldSafeRetry(error);
        }
        this.logger.verbose(this.constructor.name + ": Error is not retryable", error);
        return new DoNotRetry(error);
    };
    RetryResolution.prototype.shouldSafeRetry = function (error) {
        if (error instanceof network_1.NetworkError) {
            this.logger.verbose(this.constructor.name + ": It's a Network Error, will retry", error);
            return new Retry(this.calulateMillisToRetry());
        }
        else if (error instanceof network_1.ErrorResponse) {
            if (error.statusCode >= 500 && error.statusCode < 600) {
                this.logger.verbose(this.constructor.name + ": Error 5xx, will retry");
                return new Retry(this.calulateMillisToRetry());
            }
        }
        this.logger.verbose(this.constructor.name + ": Error is not retryable", error);
        return new DoNotRetry(error);
    };
    RetryResolution.prototype.calulateMillisToRetry = function () {
        this.currentBackoffMillis = this.increaseTimeoutFunction(this.currentBackoffMillis);
        this.logger.verbose(this.constructor.name + ": Retrying in " + this.currentBackoffMillis + "ms");
        return this.currentBackoffMillis;
    };
    return RetryResolution;
}());
exports.RetryResolution = RetryResolution;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __webpack_require__(1);
var request_1 = __webpack_require__(4);
var resuming_subscription_1 = __webpack_require__(5);
var retrying_subscription_1 = __webpack_require__(6);
var subscribe_strategy_1 = __webpack_require__(11);
var subscription_1 = __webpack_require__(12);
var token_providing_subscription_1 = __webpack_require__(7);
var http_1 = __webpack_require__(13);
var websocket_1 = __webpack_require__(14);
var transports_1 = __webpack_require__(8);
var BaseClient = (function () {
    function BaseClient(options) {
        this.options = options;
        this.host = options.host.replace(/(\/)+$/, '');
        this.logger = options.logger || new logger_1.ConsoleLogger();
        this.websocketTransport = new websocket_1.default(this.host);
        this.httpTransport = new http_1.default(this.host, options.encrypted);
    }
    BaseClient.prototype.request = function (options, tokenParams) {
        var _this = this;
        if (options.tokenProvider) {
            return options.tokenProvider
                .fetchToken(tokenParams)
                .then(function (token) {
                if (options.headers !== undefined) {
                    options.headers['Authorization'] = "Bearer " + token;
                }
                else {
                    options.headers = (_a = {}, _a['Authorization'] = "Bearer " + token, _a);
                }
                return request_1.executeNetworkRequest(function () { return _this.httpTransport.request(options); }, options);
                var _a;
            })
                .catch(function (error) {
                _this.logger.error(error);
            });
        }
        return request_1.executeNetworkRequest(function () { return _this.httpTransport.request(options); }, options);
    };
    BaseClient.prototype.subscribeResuming = function (path, headers, listeners, retryStrategyOptions, initialEventId, tokenProvider) {
        var completeListeners = subscription_1.replaceMissingListenersWithNoOps(listeners);
        var subscribeStrategyListeners = subscribe_strategy_1.subscribeStrategyListenersFromSubscriptionListeners(completeListeners);
        var subscriptionStrategy = resuming_subscription_1.createResumingStrategy(retryStrategyOptions, token_providing_subscription_1.createTokenProvidingStrategy(transports_1.createTransportStrategy(path, this.websocketTransport, this.logger), this.logger, tokenProvider), this.logger, initialEventId);
        var opened = false;
        return subscriptionStrategy({
            onEnd: subscribeStrategyListeners.onEnd,
            onError: subscribeStrategyListeners.onError,
            onEvent: subscribeStrategyListeners.onEvent,
            onOpen: function (headers) {
                if (!opened) {
                    opened = true;
                    subscribeStrategyListeners.onOpen(headers);
                }
                completeListeners.onSubscribe();
            },
            onRetrying: subscribeStrategyListeners.onRetrying,
        }, headers);
    };
    BaseClient.prototype.subscribeNonResuming = function (path, headers, listeners, retryStrategyOptions, tokenProvider) {
        var completeListeners = subscription_1.replaceMissingListenersWithNoOps(listeners);
        var subscribeStrategyListeners = subscribe_strategy_1.subscribeStrategyListenersFromSubscriptionListeners(completeListeners);
        var subscriptionStrategy = retrying_subscription_1.createRetryingStrategy(retryStrategyOptions, token_providing_subscription_1.createTokenProvidingStrategy(transports_1.createTransportStrategy(path, this.websocketTransport, this.logger), this.logger, tokenProvider), this.logger);
        var opened = false;
        return subscriptionStrategy({
            onEnd: subscribeStrategyListeners.onEnd,
            onError: subscribeStrategyListeners.onError,
            onEvent: subscribeStrategyListeners.onEvent,
            onOpen: function (headers) {
                if (!opened) {
                    opened = true;
                    subscribeStrategyListeners.onOpen(headers);
                }
                completeListeners.onSubscribe();
            },
            onRetrying: subscribeStrategyListeners.onRetrying,
        }, headers);
    };
    return BaseClient;
}());
exports.BaseClient = BaseClient;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
function executeNetworkRequest(createXhr, options) {
    return new Promise(function (resolve, reject) {
        var xhr = attachOnReadyStateChangeHandler(createXhr(), resolve, reject);
        sendBody(xhr, options);
    });
}
exports.executeNetworkRequest = executeNetworkRequest;
function sendBody(xhr, options) {
    if (options.json) {
        xhr.send(JSON.stringify(options.json));
    }
    else {
        xhr.send(options.body);
    }
}
function sendRawRequest(options) {
    return new Promise(function (resolve, reject) {
        var xhr = attachOnReadyStateChangeHandler(new window.XMLHttpRequest(), resolve, reject);
        xhr.open(options.method.toUpperCase(), options.url, true);
        if (options.headers) {
            for (var key in options.headers) {
                if (options.headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            }
        }
        xhr.send(options.body);
    });
}
exports.sendRawRequest = sendRawRequest;
function attachOnReadyStateChangeHandler(xhr, resolve, reject) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            }
            else if (xhr.status !== 0) {
                reject(network_1.ErrorResponse.fromXHR(xhr));
            }
            else {
                reject(new network_1.NetworkError('No Connection'));
            }
        }
    };
    return xhr;
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var retry_strategy_1 = __webpack_require__(2);
exports.createResumingStrategy = function (retryOptions, nextSubscribeStrategy, logger, initialEventId) {
    var completeRetryOptions = retry_strategy_1.createRetryStrategyOptionsOrDefault(retryOptions);
    var retryResolution = new retry_strategy_1.RetryResolution(completeRetryOptions, logger);
    var ResumingSubscription = (function () {
        function ResumingSubscription(listeners, headers) {
            var _this = this;
            this.unsubscribe = function () {
                _this.state.unsubscribe();
            };
            this.onTransition = function (newState) {
                _this.state = newState;
            };
            var OpeningSubscriptionState = (function () {
                function OpeningSubscriptionState(onTransition) {
                    var _this = this;
                    this.onTransition = onTransition;
                    var lastEventId = initialEventId;
                    logger.verbose("ResumingSubscription: transitioning to OpeningSubscriptionState");
                    if (lastEventId) {
                        headers['Last-Event-Id'] = lastEventId;
                        logger.verbose("ResumingSubscription: initialEventId is " + lastEventId);
                    }
                    this.underlyingSubscription = nextSubscribeStrategy({
                        onEnd: function (error) {
                            onTransition(new EndedSubscriptionState(error));
                        },
                        onError: function (error) {
                            onTransition(new ResumingSubscriptionState(error, onTransition, lastEventId));
                        },
                        onEvent: function (event) {
                            lastEventId = event.eventId;
                            listeners.onEvent(event);
                        },
                        onOpen: function (headers) {
                            onTransition(new OpenSubscriptionState(headers, _this.underlyingSubscription, onTransition));
                        },
                        onRetrying: listeners.onRetrying,
                    }, headers);
                }
                OpeningSubscriptionState.prototype.unsubscribe = function () {
                    this.onTransition(new EndingSubscriptionState());
                    this.underlyingSubscription.unsubscribe();
                };
                return OpeningSubscriptionState;
            }());
            var OpenSubscriptionState = (function () {
                function OpenSubscriptionState(headers, underlyingSubscription, onTransition) {
                    this.underlyingSubscription = underlyingSubscription;
                    this.onTransition = onTransition;
                    logger.verbose("ResumingSubscription: transitioning to OpenSubscriptionState");
                    listeners.onOpen(headers);
                }
                OpenSubscriptionState.prototype.unsubscribe = function () {
                    this.onTransition(new EndingSubscriptionState());
                    this.underlyingSubscription.unsubscribe();
                };
                return OpenSubscriptionState;
            }());
            var ResumingSubscriptionState = (function () {
                function ResumingSubscriptionState(error, onTransition, lastEventId) {
                    var _this = this;
                    this.onTransition = onTransition;
                    logger.verbose("ResumingSubscription: transitioning to ResumingSubscriptionState");
                    var executeSubscriptionOnce = function (error, lastEventId) {
                        listeners.onRetrying();
                        var resolveError = function (error) {
                            if (error instanceof network_1.ErrorResponse) {
                                error.headers['Request-Method'] = 'SUBSCRIBE';
                            }
                            return retryResolution.attemptRetry(error);
                        };
                        var errorResolution = resolveError(error);
                        if (errorResolution instanceof retry_strategy_1.Retry) {
                            _this.timeout = window.setTimeout(function () {
                                executeNextSubscribeStrategy(lastEventId);
                            }, errorResolution.waitTimeMillis);
                        }
                        else {
                            onTransition(new FailedSubscriptionState(error));
                        }
                    };
                    var executeNextSubscribeStrategy = function (lastEventId) {
                        logger.verbose("ResumingSubscription: trying to re-establish the subscription");
                        if (lastEventId) {
                            logger.verbose("ResumingSubscription: lastEventId: " + lastEventId);
                            headers['Last-Event-Id'] = lastEventId;
                        }
                        _this.underlyingSubscription = nextSubscribeStrategy({
                            onEnd: function (error) {
                                onTransition(new EndedSubscriptionState(error));
                            },
                            onError: function (error) {
                                executeSubscriptionOnce(error, lastEventId);
                            },
                            onEvent: function (event) {
                                lastEventId = event.eventId;
                                listeners.onEvent(event);
                            },
                            onOpen: function (headers) {
                                onTransition(new OpenSubscriptionState(headers, _this.underlyingSubscription, onTransition));
                            },
                            onRetrying: listeners.onRetrying,
                        }, headers);
                    };
                    executeSubscriptionOnce(error, lastEventId);
                }
                ResumingSubscriptionState.prototype.unsubscribe = function () {
                    this.onTransition(new EndingSubscriptionState());
                    window.clearTimeout(this.timeout);
                    this.underlyingSubscription.unsubscribe();
                };
                return ResumingSubscriptionState;
            }());
            var EndingSubscriptionState = (function () {
                function EndingSubscriptionState(error) {
                    logger.verbose("ResumingSubscription: transitioning to EndingSubscriptionState");
                }
                EndingSubscriptionState.prototype.unsubscribe = function () {
                    throw new Error('Subscription is already ending');
                };
                return EndingSubscriptionState;
            }());
            var EndedSubscriptionState = (function () {
                function EndedSubscriptionState(error) {
                    logger.verbose("ResumingSubscription: transitioning to EndedSubscriptionState");
                    listeners.onEnd(error);
                }
                EndedSubscriptionState.prototype.unsubscribe = function () {
                    throw new Error('Subscription has already ended');
                };
                return EndedSubscriptionState;
            }());
            var FailedSubscriptionState = (function () {
                function FailedSubscriptionState(error) {
                    logger.verbose("ResumingSubscription: transitioning to FailedSubscriptionState", error);
                    listeners.onError(error);
                }
                FailedSubscriptionState.prototype.unsubscribe = function () {
                    throw new Error('Subscription has already ended');
                };
                return FailedSubscriptionState;
            }());
            this.state = new OpeningSubscriptionState(this.onTransition);
        }
        return ResumingSubscription;
    }());
    return function (listeners, headers) { return new ResumingSubscription(listeners, headers); };
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var retry_strategy_1 = __webpack_require__(2);
exports.createRetryingStrategy = function (retryOptions, nextSubscribeStrategy, logger) {
    var enrichedRetryOptions = retry_strategy_1.createRetryStrategyOptionsOrDefault(retryOptions);
    var retryResolution = new retry_strategy_1.RetryResolution(enrichedRetryOptions, logger);
    var RetryingSubscription = (function () {
        function RetryingSubscription(listeners, headers) {
            var _this = this;
            this.unsubscribe = function () {
                _this.state.unsubscribe();
            };
            this.onTransition = function (newState) {
                _this.state = newState;
            };
            var OpeningSubscriptionState = (function () {
                function OpeningSubscriptionState(onTransition) {
                    var _this = this;
                    logger.verbose("RetryingSubscription: transitioning to OpeningSubscriptionState");
                    this.underlyingSubscription = nextSubscribeStrategy({
                        onEnd: function (error) { return onTransition(new EndedSubscriptionState(error)); },
                        onError: function (error) {
                            return onTransition(new RetryingSubscriptionState(error, onTransition));
                        },
                        onEvent: listeners.onEvent,
                        onOpen: function (headers) {
                            return onTransition(new OpenSubscriptionState(headers, _this.underlyingSubscription, onTransition));
                        },
                        onRetrying: listeners.onRetrying,
                    }, headers);
                }
                OpeningSubscriptionState.prototype.unsubscribe = function () {
                    this.underlyingSubscription.unsubscribe();
                    throw new Error('Method not implemented.');
                };
                return OpeningSubscriptionState;
            }());
            var RetryingSubscriptionState = (function () {
                function RetryingSubscriptionState(error, onTransition) {
                    var _this = this;
                    this.onTransition = onTransition;
                    logger.verbose("RetryingSubscription: transitioning to RetryingSubscriptionState");
                    var executeSubscriptionOnce = function (error) {
                        listeners.onRetrying();
                        var resolveError = function (error) {
                            if (error instanceof network_1.ErrorResponse) {
                                error.headers['Request-Method'] = 'SUBSCRIBE';
                            }
                            return retryResolution.attemptRetry(error);
                        };
                        var errorResolution = resolveError(error);
                        if (errorResolution instanceof retry_strategy_1.Retry) {
                            _this.timeout = window.setTimeout(function () {
                                executeNextSubscribeStrategy();
                            }, errorResolution.waitTimeMillis);
                        }
                        else {
                            onTransition(new FailedSubscriptionState(error));
                        }
                    };
                    var executeNextSubscribeStrategy = function () {
                        logger.verbose("RetryingSubscription: trying to re-establish the subscription");
                        var underlyingSubscription = nextSubscribeStrategy({
                            onEnd: function (error) { return onTransition(new EndedSubscriptionState(error)); },
                            onError: function (error) { return executeSubscriptionOnce(error); },
                            onEvent: listeners.onEvent,
                            onOpen: function (headers) {
                                onTransition(new OpenSubscriptionState(headers, underlyingSubscription, onTransition));
                            },
                            onRetrying: listeners.onRetrying,
                        }, headers);
                    };
                    executeSubscriptionOnce(error);
                }
                RetryingSubscriptionState.prototype.unsubscribe = function () {
                    window.clearTimeout(this.timeout);
                    this.onTransition(new EndedSubscriptionState());
                };
                return RetryingSubscriptionState;
            }());
            var OpenSubscriptionState = (function () {
                function OpenSubscriptionState(headers, underlyingSubscription, onTransition) {
                    this.underlyingSubscription = underlyingSubscription;
                    this.onTransition = onTransition;
                    logger.verbose("RetryingSubscription: transitioning to OpenSubscriptionState");
                    listeners.onOpen(headers);
                }
                OpenSubscriptionState.prototype.unsubscribe = function () {
                    this.underlyingSubscription.unsubscribe();
                    this.onTransition(new EndedSubscriptionState());
                };
                return OpenSubscriptionState;
            }());
            var EndedSubscriptionState = (function () {
                function EndedSubscriptionState(error) {
                    logger.verbose("RetryingSubscription: transitioning to EndedSubscriptionState");
                    listeners.onEnd(error);
                }
                EndedSubscriptionState.prototype.unsubscribe = function () {
                    throw new Error('Subscription has already ended');
                };
                return EndedSubscriptionState;
            }());
            var FailedSubscriptionState = (function () {
                function FailedSubscriptionState(error) {
                    logger.verbose("RetryingSubscription: transitioning to FailedSubscriptionState", error);
                    listeners.onError(error);
                }
                FailedSubscriptionState.prototype.unsubscribe = function () {
                    throw new Error('Subscription has already ended');
                };
                return FailedSubscriptionState;
            }());
            this.state = new OpeningSubscriptionState(this.onTransition);
        }
        return RetryingSubscription;
    }());
    return function (listeners, headers) { return new RetryingSubscription(listeners, headers); };
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
exports.createTokenProvidingStrategy = function (nextSubscribeStrategy, logger, tokenProvider) {
    if (tokenProvider) {
        return function (listeners, headers) {
            return new TokenProvidingSubscription(logger, listeners, headers, tokenProvider, nextSubscribeStrategy);
        };
    }
    return nextSubscribeStrategy;
};
var TokenProvidingSubscription = (function () {
    function TokenProvidingSubscription(logger, listeners, headers, tokenProvider, nextSubscribeStrategy) {
        var _this = this;
        this.logger = logger;
        this.listeners = listeners;
        this.headers = headers;
        this.tokenProvider = tokenProvider;
        this.nextSubscribeStrategy = nextSubscribeStrategy;
        this.unsubscribe = function () {
            _this.state.unsubscribe();
            _this.state = new InactiveState(_this.logger);
        };
        this.state = new ActiveState(logger, headers, nextSubscribeStrategy);
        this.subscribe();
    }
    TokenProvidingSubscription.prototype.subscribe = function () {
        var _this = this;
        this.tokenProvider
            .fetchToken()
            .then(function (token) {
            var existingListeners = Object.assign({}, _this.listeners);
            _this.state.subscribe(token, {
                onEnd: function (error) {
                    _this.state = new InactiveState(_this.logger);
                    existingListeners.onEnd(error);
                },
                onError: function (error) {
                    if (_this.isTokenExpiredError(error)) {
                        _this.tokenProvider.clearToken(token);
                        _this.subscribe();
                    }
                    else {
                        _this.state = new InactiveState(_this.logger);
                        existingListeners.onError(error);
                    }
                },
                onEvent: _this.listeners.onEvent,
                onOpen: _this.listeners.onOpen,
            });
        })
            .catch(function (error) {
            _this.logger.debug('TokenProvidingSubscription: error when fetching token:', error);
            _this.state = new InactiveState(_this.logger);
            _this.listeners.onError(error);
        });
    };
    TokenProvidingSubscription.prototype.isTokenExpiredError = function (error) {
        return (error instanceof network_1.ErrorResponse &&
            error.statusCode === 401 &&
            error.info === 'authentication/expired');
    };
    return TokenProvidingSubscription;
}());
var ActiveState = (function () {
    function ActiveState(logger, headers, nextSubscribeStrategy) {
        this.logger = logger;
        this.headers = headers;
        this.nextSubscribeStrategy = nextSubscribeStrategy;
        logger.verbose("TokenProvidingSubscription: transitioning to TokenProvidingState");
    }
    ActiveState.prototype.subscribe = function (token, listeners) {
        var _this = this;
        this.putTokenIntoHeader(token);
        this.underlyingSubscription = this.nextSubscribeStrategy({
            onEnd: function (error) {
                _this.logger.verbose("TokenProvidingSubscription: subscription ended");
                listeners.onEnd(error);
            },
            onError: function (error) {
                _this.logger.verbose('TokenProvidingSubscription: subscription errored:', error);
                listeners.onError(error);
            },
            onEvent: listeners.onEvent,
            onOpen: function (headers) {
                _this.logger.verbose("TokenProvidingSubscription: subscription opened");
                listeners.onOpen(headers);
            },
            onRetrying: listeners.onRetrying,
        }, this.headers);
    };
    ActiveState.prototype.unsubscribe = function () {
        this.underlyingSubscription.unsubscribe();
    };
    ActiveState.prototype.putTokenIntoHeader = function (token) {
        this.headers['Authorization'] = "Bearer " + token;
        this.logger.verbose("TokenProvidingSubscription: token fetched: " + token);
    };
    return ActiveState;
}());
var InactiveState = (function () {
    function InactiveState(logger) {
        this.logger = logger;
        logger.verbose("TokenProvidingSubscription: transitioning to OpenTokenProvidingSubscriptionState");
    }
    InactiveState.prototype.subscribe = function (token, listeners) {
        this.logger.verbose('TokenProvidingSubscription: subscribe called in Inactive state; doing nothing');
    };
    InactiveState.prototype.unsubscribe = function () {
        this.logger.verbose('TokenProvidingSubscription: unsubscribe called in Inactive state; doing nothing');
    };
    return InactiveState;
}());


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransportStrategy = function (path, transport, logger) {
    return function (listeners, headers) { return transport.subscribe(path, listeners, headers); };
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_BASE = 'pusherplatform.io';


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var base_client_1 = __webpack_require__(3);
exports.BaseClient = base_client_1.BaseClient;
var host_base_1 = __webpack_require__(9);
exports.HOST_BASE = host_base_1.HOST_BASE;
var instance_1 = __webpack_require__(15);
exports.Instance = instance_1.default;
var logger_1 = __webpack_require__(1);
exports.ConsoleLogger = logger_1.ConsoleLogger;
exports.EmptyLogger = logger_1.EmptyLogger;
var network_1 = __webpack_require__(0);
exports.ErrorResponse = network_1.ErrorResponse;
exports.NetworkError = network_1.NetworkError;
exports.responseToHeadersObject = network_1.responseToHeadersObject;
exports.XhrReadyState = network_1.XhrReadyState;
var request_1 = __webpack_require__(4);
exports.executeNetworkRequest = request_1.executeNetworkRequest;
exports.sendRawRequest = request_1.sendRawRequest;
var resuming_subscription_1 = __webpack_require__(5);
exports.createResumingStrategy = resuming_subscription_1.createResumingStrategy;
var retry_strategy_1 = __webpack_require__(2);
exports.createRetryStrategyOptionsOrDefault = retry_strategy_1.createRetryStrategyOptionsOrDefault;
exports.DoNotRetry = retry_strategy_1.DoNotRetry;
exports.Retry = retry_strategy_1.Retry;
exports.RetryResolution = retry_strategy_1.RetryResolution;
var retrying_subscription_1 = __webpack_require__(6);
exports.createRetryingStrategy = retrying_subscription_1.createRetryingStrategy;
var token_providing_subscription_1 = __webpack_require__(7);
exports.createTokenProvidingStrategy = token_providing_subscription_1.createTokenProvidingStrategy;
var transports_1 = __webpack_require__(8);
exports.createTransportStrategy = transports_1.createTransportStrategy;
exports.default = {
    BaseClient: base_client_1.BaseClient,
    ConsoleLogger: logger_1.ConsoleLogger,
    EmptyLogger: logger_1.EmptyLogger,
    Instance: instance_1.default,
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeStrategyListenersFromSubscriptionListeners = function (subListeners) {
    return {
        onEnd: subListeners.onEnd,
        onError: subListeners.onError,
        onEvent: subListeners.onEvent,
        onOpen: subListeners.onOpen,
        onRetrying: subListeners.onRetrying,
    };
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceMissingListenersWithNoOps = function (listeners) {
    var onEndNoOp = function (error) { };
    var onEnd = listeners.onEnd || onEndNoOp;
    var onErrorNoOp = function (error) { };
    var onError = listeners.onError || onErrorNoOp;
    var onEventNoOp = function (event) { };
    var onEvent = listeners.onEvent || onEventNoOp;
    var onOpenNoOp = function (headers) { };
    var onOpen = listeners.onOpen || onOpenNoOp;
    var onRetryingNoOp = function () { };
    var onRetrying = listeners.onRetrying || onRetryingNoOp;
    var onSubscribeNoOp = function () { };
    var onSubscribe = listeners.onSubscribe || onSubscribeNoOp;
    return {
        onEnd: onEnd,
        onError: onError,
        onEvent: onEvent,
        onOpen: onOpen,
        onRetrying: onRetrying,
        onSubscribe: onSubscribe,
    };
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var HttpTransportState;
(function (HttpTransportState) {
    HttpTransportState[HttpTransportState["UNOPENED"] = 0] = "UNOPENED";
    HttpTransportState[HttpTransportState["OPENING"] = 1] = "OPENING";
    HttpTransportState[HttpTransportState["OPEN"] = 2] = "OPEN";
    HttpTransportState[HttpTransportState["ENDING"] = 3] = "ENDING";
    HttpTransportState[HttpTransportState["ENDED"] = 4] = "ENDED";
})(HttpTransportState = exports.HttpTransportState || (exports.HttpTransportState = {}));
var HttpSubscription = (function () {
    function HttpSubscription(xhr, listeners) {
        var _this = this;
        this.gotEOS = false;
        this.lastNewlineIndex = 0;
        this.state = HttpTransportState.UNOPENED;
        this.xhr = xhr;
        this.listeners = listeners;
        this.xhr.onreadystatechange = function () {
            switch (_this.xhr.readyState) {
                case network_1.XhrReadyState.UNSENT:
                case network_1.XhrReadyState.OPENED:
                case network_1.XhrReadyState.HEADERS_RECEIVED:
                    _this.assertStateIsIn(HttpTransportState.OPENING);
                    break;
                case network_1.XhrReadyState.LOADING:
                    _this.onLoading();
                    break;
                case network_1.XhrReadyState.DONE:
                    _this.onDone();
                    break;
            }
        };
        this.state = HttpTransportState.OPENING;
        this.xhr.send();
        return this;
    }
    HttpSubscription.prototype.unsubscribe = function () {
        this.state = HttpTransportState.ENDED;
        this.xhr.abort();
        if (this.listeners.onEnd) {
            this.listeners.onEnd(null);
        }
    };
    HttpSubscription.prototype.onLoading = function () {
        this.assertStateIsIn(HttpTransportState.OPENING, HttpTransportState.OPEN, HttpTransportState.ENDING);
        if (this.xhr.status === 200) {
            if (this.state === HttpTransportState.OPENING) {
                this.state = HttpTransportState.OPEN;
                window.console.log(network_1.responseToHeadersObject(this.xhr.getAllResponseHeaders()));
                if (this.listeners.onOpen) {
                    this.listeners.onOpen(network_1.responseToHeadersObject(this.xhr.getAllResponseHeaders()));
                }
            }
            this.assertStateIsIn(HttpTransportState.OPEN);
            var err = this.onChunk();
            this.assertStateIsIn(HttpTransportState.OPEN, HttpTransportState.ENDING);
            if (err) {
                this.state = HttpTransportState.ENDED;
                if (err instanceof network_1.ErrorResponse && err.statusCode !== 204) {
                    if (this.listeners.onError) {
                        this.listeners.onError(err);
                    }
                }
            }
            else {
            }
        }
    };
    HttpSubscription.prototype.onDone = function () {
        if (this.xhr.status === 200) {
            if (this.state === HttpTransportState.OPENING) {
                this.state = HttpTransportState.OPEN;
                if (this.listeners.onOpen) {
                    this.listeners.onOpen(network_1.responseToHeadersObject(this.xhr.getAllResponseHeaders()));
                }
            }
            this.assertStateIsIn(HttpTransportState.OPEN, HttpTransportState.ENDING);
            var err = this.onChunk();
            if (err) {
                this.state = HttpTransportState.ENDED;
                if (err.statusCode === 204) {
                    if (this.listeners.onEnd) {
                        this.listeners.onEnd(null);
                    }
                }
                else {
                    if (this.listeners.onError) {
                        this.listeners.onError(err);
                    }
                }
            }
            else if (this.state <= HttpTransportState.ENDING) {
                if (this.listeners.onError) {
                    this.listeners.onError(new Error('HTTP response ended without receiving EOS message'));
                }
            }
            else {
                if (this.listeners.onEnd) {
                    this.listeners.onEnd(null);
                }
            }
        }
        else {
            this.assertStateIsIn(HttpTransportState.OPENING, HttpTransportState.OPEN, HttpTransportState.ENDED);
            if (this.state === HttpTransportState.ENDED) {
                return;
            }
            else if (this.xhr.status === 0) {
                if (this.listeners.onError) {
                    this.listeners.onError(new network_1.NetworkError('Connection lost.'));
                }
            }
            else {
                if (this.listeners.onError) {
                    this.listeners.onError(network_1.ErrorResponse.fromXHR(this.xhr));
                }
            }
        }
    };
    HttpSubscription.prototype.onChunk = function () {
        this.assertStateIsIn(HttpTransportState.OPEN);
        var response = this.xhr.responseText;
        var newlineIndex = response.lastIndexOf('\n');
        if (newlineIndex > this.lastNewlineIndex) {
            var rawEvents = response
                .slice(this.lastNewlineIndex, newlineIndex)
                .split('\n');
            this.lastNewlineIndex = newlineIndex;
            for (var _i = 0, rawEvents_1 = rawEvents; _i < rawEvents_1.length; _i++) {
                var rawEvent = rawEvents_1[_i];
                if (rawEvent.length === 0) {
                    continue;
                }
                var data = JSON.parse(rawEvent);
                var err = this.onMessage(data);
                if (err != null) {
                    return err;
                }
            }
        }
    };
    HttpSubscription.prototype.assertStateIsIn = function () {
        var _this = this;
        var validStates = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            validStates[_i] = arguments[_i];
        }
        var stateIsValid = validStates.some(function (validState) { return validState === _this.state; });
        if (!stateIsValid) {
            var expectedStates = validStates
                .map(function (state) { return HttpTransportState[state]; })
                .join(', ');
            var actualState = HttpTransportState[this.state];
            window.console.warn("Expected this.state to be one of [" + expectedStates + "] but it is " + actualState);
        }
    };
    HttpSubscription.prototype.onMessage = function (message) {
        this.assertStateIsIn(HttpTransportState.OPEN);
        this.verifyMessage(message);
        switch (message[0]) {
            case 0:
                return null;
            case 1:
                return this.onEventMessage(message);
            case 255:
                return this.onEOSMessage(message);
            default:
                return new Error('Unknown Message: ' + JSON.stringify(message));
        }
    };
    HttpSubscription.prototype.onEventMessage = function (eventMessage) {
        this.assertStateIsIn(HttpTransportState.OPEN);
        if (eventMessage.length !== 4) {
            return new Error('Event message has ' + eventMessage.length + ' elements (expected 4)');
        }
        var _ = eventMessage[0], id = eventMessage[1], headers = eventMessage[2], body = eventMessage[3];
        if (typeof id !== 'string') {
            return new Error('Invalid event ID in message: ' + JSON.stringify(eventMessage));
        }
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            return new Error('Invalid event headers in message: ' + JSON.stringify(eventMessage));
        }
        if (this.listeners.onEvent) {
            this.listeners.onEvent({ body: body, headers: headers, eventId: id });
        }
        return null;
    };
    HttpSubscription.prototype.onEOSMessage = function (eosMessage) {
        this.assertStateIsIn(HttpTransportState.OPEN);
        if (eosMessage.length !== 4) {
            return new Error('EOS message has ' + eosMessage.length + ' elements (expected 4)');
        }
        var _ = eosMessage[0], statusCode = eosMessage[1], headers = eosMessage[2], info = eosMessage[3];
        if (typeof statusCode !== 'number') {
            return new Error('Invalid EOS Status Code');
        }
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            return new Error('Invalid EOS ElementsHeaders');
        }
        this.state = HttpTransportState.ENDING;
        return new network_1.ErrorResponse(statusCode, headers, info);
    };
    HttpSubscription.prototype.verifyMessage = function (message) {
        if (this.gotEOS) {
            return new Error('Got another message after EOS message');
        }
        if (!Array.isArray(message)) {
            return new Error('Message is not an array');
        }
        if (message.length < 1) {
            return new Error('Message is empty array');
        }
    };
    return HttpSubscription;
}());
var HttpTransport = (function () {
    function HttpTransport(host, encrypted) {
        if (encrypted === void 0) { encrypted = true; }
        this.baseURL = (encrypted ? 'https' : 'http') + "://" + host;
    }
    HttpTransport.prototype.request = function (requestOptions) {
        return this.createXHR(this.baseURL, requestOptions);
    };
    HttpTransport.prototype.subscribe = function (path, listeners, headers) {
        var requestOptions = {
            headers: headers,
            method: 'SUBSCRIBE',
            path: path,
        };
        return new HttpSubscription(this.createXHR(this.baseURL, requestOptions), listeners);
    };
    HttpTransport.prototype.createXHR = function (baseURL, options) {
        var xhr = new window.XMLHttpRequest();
        var path = options.path.replace(/^\/+/, '');
        var endpoint = baseURL + "/" + path;
        xhr.open(options.method.toUpperCase(), endpoint, true);
        xhr = this.setJSONHeaderIfAppropriate(xhr, options);
        if (options.jwt) {
            xhr.setRequestHeader('authorization', "Bearer " + options.jwt);
        }
        if (options.headers) {
            for (var key in options.headers) {
                if (options.headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, options.headers[key]);
                }
            }
        }
        return xhr;
    };
    HttpTransport.prototype.setJSONHeaderIfAppropriate = function (xhr, options) {
        if (options.json) {
            xhr.setRequestHeader('content-type', 'application/json');
        }
        return xhr;
    };
    return HttpTransport;
}());
exports.default = HttpTransport;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var SubscribeMessageType = 100;
var OpenMessageType = 101;
var EventMessageType = 102;
var UnsubscribeMessageType = 198;
var EosMessageType = 199;
var PingMessageType = 16;
var PongMessageType = 17;
var CloseMessageType = 99;
var WSReadyState;
(function (WSReadyState) {
    WSReadyState[WSReadyState["Connecting"] = 0] = "Connecting";
    WSReadyState[WSReadyState["Open"] = 1] = "Open";
    WSReadyState[WSReadyState["Closing"] = 2] = "Closing";
    WSReadyState[WSReadyState["Closed"] = 3] = "Closed";
})(WSReadyState = exports.WSReadyState || (exports.WSReadyState = {}));
var WsSubscriptions = (function () {
    function WsSubscriptions() {
        this.subscriptions = {};
    }
    WsSubscriptions.prototype.add = function (subID, path, listeners, headers) {
        this.subscriptions[subID] = {
            headers: headers,
            listeners: listeners,
            path: path,
        };
        return subID;
    };
    WsSubscriptions.prototype.has = function (subID) {
        return this.subscriptions[subID] !== undefined;
    };
    WsSubscriptions.prototype.isEmpty = function () {
        return Object.keys(this.subscriptions).length === 0;
    };
    WsSubscriptions.prototype.remove = function (subID) {
        return delete this.subscriptions[subID];
    };
    WsSubscriptions.prototype.get = function (subID) {
        return this.subscriptions[subID];
    };
    WsSubscriptions.prototype.getAll = function () {
        return this.subscriptions;
    };
    WsSubscriptions.prototype.getAllAsArray = function () {
        var _this = this;
        return Object.keys(this.subscriptions).map(function (subID) { return (__assign({ subID: parseInt(subID, 10) }, _this.subscriptions[parseInt(subID, 10)])); });
    };
    WsSubscriptions.prototype.removeAll = function () {
        this.subscriptions = {};
    };
    return WsSubscriptions;
}());
var WsSubscription = (function () {
    function WsSubscription(wsTransport, subID) {
        this.wsTransport = wsTransport;
        this.subID = subID;
    }
    WsSubscription.prototype.unsubscribe = function () {
        this.wsTransport.unsubscribe(this.subID);
    };
    return WsSubscription;
}());
var pingIntervalMs = 30000;
var pingTimeoutMs = 10000;
var WebSocketTransport = (function () {
    function WebSocketTransport(host) {
        this.webSocketPath = '/ws';
        this.forcedClose = false;
        this.closedError = null;
        this.baseURL = "wss://" + host + this.webSocketPath;
        this.lastSubscriptionID = 0;
        this.subscriptions = new WsSubscriptions();
        this.pendingSubscriptions = new WsSubscriptions();
        this.connect();
    }
    WebSocketTransport.prototype.subscribe = function (path, listeners, headers) {
        this.tryReconnectIfNeeded();
        var subID = this.lastSubscriptionID++;
        if (this.socket.readyState !== WSReadyState.Open) {
            this.pendingSubscriptions.add(subID, path, listeners, headers);
            return new WsSubscription(this, subID);
        }
        this.subscriptions.add(subID, path, listeners, headers);
        this.sendMessage(this.getMessage(SubscribeMessageType, subID, path, headers));
        return new WsSubscription(this, subID);
    };
    WebSocketTransport.prototype.unsubscribe = function (subID) {
        this.sendMessage(this.getMessage(UnsubscribeMessageType, subID));
        var subscription = this.subscriptions.get(subID);
        if (subscription.listeners.onEnd) {
            subscription.listeners.onEnd(null);
        }
        this.subscriptions.remove(subID);
    };
    WebSocketTransport.prototype.connect = function () {
        var _this = this;
        this.close();
        this.forcedClose = false;
        this.closedError = null;
        this.socket = new window.WebSocket(this.baseURL);
        this.socket.onopen = function (event) {
            var allPendingSubscriptions = _this.pendingSubscriptions.getAllAsArray();
            allPendingSubscriptions.forEach(function (subscription) {
                var subID = subscription.subID, path = subscription.path, listeners = subscription.listeners, headers = subscription.headers;
                _this.subscribePending(path, listeners, headers, subID);
            });
            _this.pendingSubscriptions.removeAll();
            _this.pingInterval = window.setInterval(function () {
                if (_this.pongTimeout) {
                    return;
                }
                var now = new Date().getTime();
                if (pingTimeoutMs > now - _this.lastMessageReceivedTimestamp) {
                    return;
                }
                _this.sendMessage(_this.getMessage(PingMessageType, now));
                _this.lastSentPingID = now;
                _this.pongTimeout = window.setTimeout(function () {
                    var now = new Date().getTime();
                    if (pingTimeoutMs > now - _this.lastMessageReceivedTimestamp) {
                        _this.pongTimeout = null;
                        return;
                    }
                    _this.close(new network_1.NetworkError("Pong response wasn't received until timeout."));
                }, pingTimeoutMs);
            }, pingIntervalMs);
        };
        this.socket.onmessage = function (event) { return _this.receiveMessage(event); };
        this.socket.onerror = function (event) {
            _this.close(new network_1.NetworkError('Connection was lost.'));
        };
        this.socket.onclose = function (event) {
            if (!_this.forcedClose) {
                _this.tryReconnectIfNeeded();
                return;
            }
            var callback = _this.closedError
                ? function (subscription) {
                    if (subscription.listeners.onError) {
                        subscription.listeners.onError(_this.closedError);
                    }
                }
                : function (subscription) {
                    if (subscription.listeners.onEnd) {
                        subscription.listeners.onEnd(null);
                    }
                };
            var allSubscriptions = _this.pendingSubscriptions.isEmpty() === false
                ? _this.pendingSubscriptions
                : _this.subscriptions;
            allSubscriptions.getAllAsArray().forEach(callback);
            allSubscriptions.removeAll();
            if (_this.closedError) {
                _this.tryReconnectIfNeeded();
            }
        };
    };
    WebSocketTransport.prototype.close = function (error) {
        if (!(this.socket instanceof window.WebSocket)) {
            return;
        }
        this.forcedClose = true;
        this.closedError = error;
        this.socket.close();
        window.clearTimeout(this.pingInterval);
        window.clearTimeout(this.pongTimeout);
        delete this.pongTimeout;
        this.lastSentPingID = null;
    };
    WebSocketTransport.prototype.tryReconnectIfNeeded = function () {
        if (this.socket.readyState !== WSReadyState.Closed) {
            return;
        }
        this.connect();
    };
    WebSocketTransport.prototype.subscribePending = function (path, listeners, headers, subID) {
        if (subID === undefined) {
            window.console.logger.debug("Subscription to path " + path + " has an undefined ID");
            return;
        }
        this.subscriptions.add(subID, path, listeners, headers);
        this.sendMessage(this.getMessage(SubscribeMessageType, subID, path, headers));
    };
    WebSocketTransport.prototype.getMessage = function (messageType, id, path, headers) {
        return [messageType, id, path, headers];
    };
    WebSocketTransport.prototype.sendMessage = function (message) {
        if (this.socket.readyState !== WSReadyState.Open) {
            return window.console.warn("Can't send in \"" + WSReadyState[this.socket.readyState] + "\" state");
        }
        this.socket.send(JSON.stringify(message));
    };
    WebSocketTransport.prototype.subscription = function (subID) {
        return this.subscriptions.get(subID);
    };
    WebSocketTransport.prototype.receiveMessage = function (event) {
        this.lastMessageReceivedTimestamp = new Date().getTime();
        var message;
        try {
            message = JSON.parse(event.data);
        }
        catch (err) {
            this.close(new Error("Message is not valid JSON format. Getting " + event.data));
            return;
        }
        var nonValidMessageError = this.validateMessage(message);
        if (nonValidMessageError) {
            this.close(new Error(nonValidMessageError.message));
            return;
        }
        var messageType = message.shift();
        switch (messageType) {
            case PongMessageType:
                this.onPongMessage(message);
                return;
            case PingMessageType:
                this.onPingMessage(message);
                return;
            case CloseMessageType:
                this.onCloseMessage(message);
                return;
        }
        var subID = message.shift();
        var subscription = this.subscription(subID);
        if (!subscription) {
            this.close(new Error("Received message for non existing subscription id: \"" + subID + "\""));
            return;
        }
        var listeners = subscription.listeners;
        switch (messageType) {
            case OpenMessageType:
                this.onOpenMessage(message, subID, listeners);
                break;
            case EventMessageType:
                this.onEventMessage(message, listeners);
                break;
            case EosMessageType:
                this.onEOSMessage(message, subID, listeners);
                break;
            default:
                this.close(new Error('Received non existing type of message.'));
        }
    };
    WebSocketTransport.prototype.validateMessage = function (message) {
        if (!Array.isArray(message)) {
            return new Error("Message is expected to be an array. Getting: " + JSON.stringify(message));
        }
        if (message.length < 1) {
            return new Error("Message is empty array: " + JSON.stringify(message));
        }
        return null;
    };
    WebSocketTransport.prototype.onOpenMessage = function (message, subID, subscriptionListeners) {
        if (subscriptionListeners.onOpen) {
            subscriptionListeners.onOpen(message[1]);
        }
    };
    WebSocketTransport.prototype.onEventMessage = function (eventMessage, subscriptionListeners) {
        if (eventMessage.length !== 3) {
            return new Error('Event message has ' + eventMessage.length + ' elements (expected 4)');
        }
        var eventId = eventMessage[0], headers = eventMessage[1], body = eventMessage[2];
        if (typeof eventId !== 'string') {
            return new Error("Invalid event ID in message: " + JSON.stringify(eventMessage));
        }
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            return new Error("Invalid event headers in message: " + JSON.stringify(eventMessage));
        }
        if (subscriptionListeners.onEvent) {
            subscriptionListeners.onEvent({ eventId: eventId, headers: headers, body: body });
        }
    };
    WebSocketTransport.prototype.onEOSMessage = function (eosMessage, subID, subscriptionListeners) {
        this.subscriptions.remove(subID);
        if (eosMessage.length !== 3) {
            if (subscriptionListeners.onError) {
                subscriptionListeners.onError(new Error("EOS message has " + eosMessage.length + " elements (expected 4)"));
            }
            return;
        }
        var statusCode = eosMessage[0], headers = eosMessage[1], body = eosMessage[2];
        if (typeof statusCode !== 'number') {
            if (subscriptionListeners.onError) {
                subscriptionListeners.onError(new Error('Invalid EOS Status Code'));
            }
            return;
        }
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            if (subscriptionListeners.onError) {
                subscriptionListeners.onError(new Error('Invalid EOS ElementsHeaders'));
            }
            return;
        }
        if (statusCode === 204) {
            if (subscriptionListeners.onEnd) {
                subscriptionListeners.onEnd(null);
            }
            return;
        }
        if (subscriptionListeners.onError) {
            subscriptionListeners.onError(new network_1.ErrorResponse(statusCode, headers, body));
        }
        return;
    };
    WebSocketTransport.prototype.onCloseMessage = function (closeMessage) {
        var statusCode = closeMessage[0], headers = closeMessage[1], body = closeMessage[2];
        if (typeof statusCode !== 'number') {
            return this.close(new Error('Close message: Invalid EOS Status Code'));
        }
        if (typeof headers !== 'object' || Array.isArray(headers)) {
            return this.close(new Error('Close message: Invalid EOS ElementsHeaders'));
        }
        this.close();
    };
    WebSocketTransport.prototype.onPongMessage = function (message) {
        var receviedPongID = message[0];
        if (this.lastSentPingID !== receviedPongID) {
            this.close(new network_1.NetworkError("Didn't received pong with proper ID"));
        }
        window.clearTimeout(this.pongTimeout);
        delete this.pongTimeout;
        this.lastSentPingID = null;
    };
    WebSocketTransport.prototype.onPingMessage = function (message) {
        var receviedPingID = message[0];
        this.sendMessage(this.getMessage(PongMessageType, receviedPingID));
    };
    return WebSocketTransport;
}());
exports.default = WebSocketTransport;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var base_client_1 = __webpack_require__(3);
var host_base_1 = __webpack_require__(9);
var logger_1 = __webpack_require__(1);
var Instance = (function () {
    function Instance(options) {
        if (!options.locator) {
            throw new Error('Expected `locator` property in Instance options!');
        }
        var splitInstanceLocator = options.locator.split(':');
        if (splitInstanceLocator.length !== 3) {
            throw new Error('The instance locator property is in the wrong format!');
        }
        if (!options.serviceName) {
            throw new Error('Expected `serviceName` property in Instance options!');
        }
        if (!options.serviceVersion) {
            throw new Error('Expected `serviceVersion` property in Instance otpions!');
        }
        this.platformVersion = splitInstanceLocator[0];
        this.cluster = splitInstanceLocator[1];
        this.id = splitInstanceLocator[2];
        this.serviceName = options.serviceName;
        this.serviceVersion = options.serviceVersion;
        this.host = options.host || this.cluster + "." + host_base_1.HOST_BASE;
        this.logger = options.logger || new logger_1.ConsoleLogger();
        this.client =
            options.client ||
                new base_client_1.BaseClient({
                    encrypted: options.encrypted,
                    host: this.host,
                    logger: this.logger,
                });
        this.tokenProvider = options.tokenProvider;
    }
    Instance.prototype.request = function (options, tokenParams) {
        options.path = this.absPath(options.path);
        if (options.headers == null || options.headers === undefined) {
            options.headers = {};
        }
        options.tokenProvider = options.tokenProvider || this.tokenProvider;
        return this.client.request(options, tokenParams);
    };
    Instance.prototype.subscribeNonResuming = function (options) {
        var headers = options.headers || {};
        var retryStrategyOptions = options.retryStrategyOptions || {};
        var tokenProvider = options.tokenProvider || this.tokenProvider;
        return this.client.subscribeNonResuming(this.absPath(options.path), headers, options.listeners, retryStrategyOptions, tokenProvider);
    };
    Instance.prototype.subscribeResuming = function (options) {
        var headers = options.headers || {};
        var retryStrategyOptions = options.retryStrategyOptions || {};
        var tokenProvider = options.tokenProvider || this.tokenProvider;
        return this.client.subscribeResuming(this.absPath(options.path), headers, options.listeners, retryStrategyOptions, options.initialEventId, tokenProvider);
    };
    Instance.prototype.absPath = function (relativePath) {
        return ("/services/" + this.serviceName + "/" + this.serviceVersion + "/" + this.id + "/" + relativePath)
            .replace(/\/+/g, '/')
            .replace(/\/+$/, '');
    };
    return Instance;
}());
exports.default = Instance;


/***/ })
/******/ ]);
});
});

unwrapExports(pusherPlatform);
var pusherPlatform_1 = pusherPlatform.BaseClient;
var pusherPlatform_2 = pusherPlatform.HOST_BASE;
var pusherPlatform_3 = pusherPlatform.Instance;
var pusherPlatform_4 = pusherPlatform.sendRawRequest;

function _isPlaceholder(a) {
       return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      var t = R.always('Tee');
 *      t(); //=> 'Tee'
 */
var always = /*#__PURE__*/_curry1(function always(val) {
  return function () {
    return val;
  };
});

/**
 * A function that always returns `false`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.always, R.T
 * @example
 *
 *      R.F(); //=> false
 */
var F = /*#__PURE__*/always(false);

/**
 * A function that always returns `true`. Any passed in parameters are ignored.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig * -> Boolean
 * @param {*}
 * @return {Boolean}
 * @see R.always, R.F
 * @example
 *
 *      R.T(); //=> true
 */
var T = /*#__PURE__*/always(true);

/**
 * A special placeholder value used to specify "gaps" within curried functions,
 * allowing partial application of any combination of arguments, regardless of
 * their positions.
 *
 * If `g` is a curried ternary function and `_` is `R.__`, the following are
 * equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2, _)(1, 3)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @constant
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @example
 *
 *      var greet = R.replace('{name}', R.__, 'Hello, {name}!');
 *      greet('Alice'); //=> 'Hello, Alice!'
 */

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

/**
 * Adds two values.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @see R.subtract
 * @example
 *
 *      R.add(2, 3);       //=>  5
 *      R.add(7)(10);      //=> 17
 */
var add = /*#__PURE__*/_curry2(function add(a, b) {
  return Number(a) + Number(b);
});

/**
 * Private `concat` function to merge two array-like objects.
 *
 * @private
 * @param {Array|Arguments} [set1=[]] An array-like object.
 * @param {Array|Arguments} [set2=[]] An array-like object.
 * @return {Array} A new, merged array.
 * @example
 *
 *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 */
function _concat(set1, set2) {
  set1 = set1 || [];
  set2 = set2 || [];
  var idx;
  var len1 = set1.length;
  var len2 = set2.length;
  var result = [];

  idx = 0;
  while (idx < len1) {
    result[result.length] = set1[idx];
    idx += 1;
  }
  idx = 0;
  while (idx < len2) {
    result[result.length] = set2[idx];
    idx += 1;
  }
  return result;
}

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };
    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };
    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };
    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };
    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };
    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };
    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };
    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };
    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };
    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };
    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };
    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;
      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }
      combined[combinedIdx] = result;
      if (!_isPlaceholder(result)) {
        left -= 1;
      }
      combinedIdx += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      var sumArgs = (...args) => R.sum(args);
 *
 *      var curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      var f = curriedAddFourNumbers(1, 2);
 *      var g = f(3);
 *      g(4); //=> 10
 */
var curryN = /*#__PURE__*/_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }
  return _arity(length, _curryN(length, [], fn));
});

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;
      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });
      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
var _isArray = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

function _isTransformer(obj) {
  return typeof obj['@@transducer/step'] === 'function';
}

/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a function with one of the given method names, it will
 * execute that function (functor case). Otherwise, if it is a transformer,
 * uses transducer [xf] to return a new transformer (transducer case).
 * Otherwise, it will default to executing [fn].
 *
 * @private
 * @param {Array} methodNames properties to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */
function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }
    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();
    if (!_isArray(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }
        idx += 1;
      }
      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
}

var _xfBase = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};

/**
 * Returns the larger of its two arguments.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig Ord a => a -> a -> a
 * @param {*} a
 * @param {*} b
 * @return {*}
 * @see R.maxBy, R.min
 * @example
 *
 *      R.max(789, 123); //=> 789
 *      R.max('a', 'b'); //=> 'b'
 */
var max = /*#__PURE__*/_curry2(function max(a, b) {
  return b > a ? b : a;
});

function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);
  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }
  return result;
}

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */
var _isArrayLike = /*#__PURE__*/_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }
  if (!x) {
    return false;
  }
  if (typeof x !== 'object') {
    return false;
  }
  if (_isString(x)) {
    return false;
  }
  if (x.nodeType === 1) {
    return !!x.length;
  }
  if (x.length === 0) {
    return true;
  }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
});

var XWrap = /*#__PURE__*/function () {
  function XWrap(fn) {
    this.f = fn;
  }
  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };
  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };
  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      var log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */
var bind = /*#__PURE__*/_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    idx += 1;
  }
  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();
  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);
    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }
    step = iter.next();
  }
  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';

function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }
  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }
  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }
  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }
  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }
  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}

var XMap = /*#__PURE__*/function () {
  function XMap(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XMap.prototype['@@transducer/init'] = _xfBase.init;
  XMap.prototype['@@transducer/result'] = _xfBase.result;
  XMap.prototype['@@transducer/step'] = function (result, input) {
    return this.xf['@@transducer/step'](result, this.f(input));
  };

  return XMap;
}();

var _xmap = /*#__PURE__*/_curry2(function _xmap(f, xf) {
  return new XMap(f, xf);
});

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var toString = Object.prototype.toString;
var _isArguments = function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
};

// cover IE < 9 keys issues
var hasEnumBug = ! /*#__PURE__*/{ toString: null }.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];
// Safari bug
var hasArgsEnumBug = /*#__PURE__*/function () {
  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;
  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }
    idx += 1;
  }
  return false;
};

/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
var _keys = typeof Object.keys === 'function' && !hasArgsEnumBug ? function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
} : function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }
  var prop, nIdx;
  var ks = [];
  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }
  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;
    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];
      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }
      nIdx -= 1;
    }
  }
  return ks;
};
var keys = /*#__PURE__*/_curry1(_keys);

/**
 * Takes a function and
 * a [functor](https://github.com/fantasyland/fantasy-land#functor),
 * applies the function to each of the functor's values, and returns
 * a functor of the same shape.
 *
 * Ramda provides suitable `map` implementations for `Array` and `Object`,
 * so this function may be applied to `[1, 2, 3]` or `{x: 1, y: 2, z: 3}`.
 *
 * Dispatches to the `map` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * Also treats functions as functors and will compose them together.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => (a -> b) -> f a -> f b
 * @param {Function} fn The function to be called on every element of the input `list`.
 * @param {Array} list The list to be iterated over.
 * @return {Array} The new list.
 * @see R.transduce, R.addIndex
 * @example
 *
 *      var double = x => x * 2;
 *
 *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
 *
 *      R.map(double, {x: 1, y: 2, z: 3}); //=> {x: 2, y: 4, z: 6}
 * @symb R.map(f, [a, b]) = [f(a), f(b)]
 * @symb R.map(f, { x: a, y: b }) = { x: f(a), y: f(b) }
 * @symb R.map(f, functor_o) = functor_o.map(f)
 */
var map = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['fantasy-land/map', 'map'], _xmap, function map(fn, functor) {
  switch (Object.prototype.toString.call(functor)) {
    case '[object Function]':
      return curryN(functor.length, function () {
        return fn.call(this, functor.apply(this, arguments));
      });
    case '[object Object]':
      return _reduce(function (acc, key) {
        acc[key] = fn(functor[key]);
        return acc;
      }, {}, keys(functor));
    default:
      return _map(fn, functor);
  }
}));

/**
 * Retrieve the value at a given path.
 *
 * @func
 * @memberOf R
 * @since v0.2.0
 * @category Object
 * @typedefn Idx = String | Int
 * @sig [Idx] -> {a} -> a | Undefined
 * @param {Array} path The path to use.
 * @param {Object} obj The object to retrieve the nested property from.
 * @return {*} The data at `path`.
 * @see R.prop
 * @example
 *
 *      R.path(['a', 'b'], {a: {b: 2}}); //=> 2
 *      R.path(['a', 'b'], {c: {b: 2}}); //=> undefined
 */
var path = /*#__PURE__*/_curry2(function path(paths, obj) {
  var val = obj;
  var idx = 0;
  while (idx < paths.length) {
    if (val == null) {
      return;
    }
    val = val[paths[idx]];
    idx += 1;
  }
  return val;
});

/**
 * Returns a function that when supplied an object returns the indicated
 * property of that object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig s -> {s: a} -> a | Undefined
 * @param {String} p The property name
 * @param {Object} obj The object to query
 * @return {*} The value at `obj.p`.
 * @see R.path
 * @example
 *
 *      R.prop('x', {x: 100}); //=> 100
 *      R.prop('x', {}); //=> undefined
 */

var prop = /*#__PURE__*/_curry2(function prop(p, obj) {
  return path([p], obj);
});

/**
 * Returns a new list by plucking the same named property off all objects in
 * the list supplied.
 *
 * `pluck` will work on
 * any [functor](https://github.com/fantasyland/fantasy-land#functor) in
 * addition to arrays, as it is equivalent to `R.map(R.prop(k), f)`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Functor f => k -> f {k: v} -> f v
 * @param {Number|String} key The key name to pluck off of each object.
 * @param {Array} f The array or functor to consider.
 * @return {Array} The list of values for the given key.
 * @see R.props
 * @example
 *
 *      R.pluck('a')([{a: 1}, {a: 2}]); //=> [1, 2]
 *      R.pluck(0)([[1, 2], [3, 4]]);   //=> [1, 3]
 *      R.pluck('val', {a: {val: 3}, b: {val: 5}}); //=> {a: 3, b: 5}
 * @symb R.pluck('x', [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}]) = [1, 3, 5]
 * @symb R.pluck(0, [[1, 2], [3, 4], [5, 6]]) = [1, 3, 5]
 */
var pluck = /*#__PURE__*/_curry2(function pluck(p, list) {
  return map(prop(p), list);
});

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */
var reduce = /*#__PURE__*/_curry3(_reduce);

/**
 * ap applies a list of functions to a list of values.
 *
 * Dispatches to the `ap` method of the second argument, if present. Also
 * treats curried functions as applicatives.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig [a -> b] -> [a] -> [b]
 * @sig Apply f => f (a -> b) -> f a -> f b
 * @sig (a -> b -> c) -> (a -> b) -> (a -> c)
 * @param {*} applyF
 * @param {*} applyX
 * @return {*}
 * @example
 *
 *      R.ap([R.multiply(2), R.add(3)], [1,2,3]); //=> [2, 4, 6, 4, 5, 6]
 *      R.ap([R.concat('tasty '), R.toUpper], ['pizza', 'salad']); //=> ["tasty pizza", "tasty salad", "PIZZA", "SALAD"]
 *
 *      // R.ap can also be used as S combinator
 *      // when only two functions are passed
 *      R.ap(R.concat, R.toUpper)('Ramda') //=> 'RamdaRAMDA'
 * @symb R.ap([f, g], [a, b]) = [f(a), f(b), g(a), g(b)]
 */
var ap = /*#__PURE__*/_curry2(function ap(applyF, applyX) {
  return typeof applyX['fantasy-land/ap'] === 'function' ? applyX['fantasy-land/ap'](applyF) : typeof applyF.ap === 'function' ? applyF.ap(applyX) : typeof applyF === 'function' ? function (x) {
    return applyF(x)(applyX(x));
  } :
  // else
  _reduce(function (acc, f) {
    return _concat(acc, map(f, applyX));
  }, [], applyF);
});

/**
 * Returns a new list containing the contents of the given list, followed by
 * the given element.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> [a]
 * @param {*} el The element to add to the end of the new list.
 * @param {Array} list The list of elements to add a new item to.
 *        list.
 * @return {Array} A new list containing the elements of the old list followed by `el`.
 * @see R.prepend
 * @example
 *
 *      R.append('tests', ['write', 'more']); //=> ['write', 'more', 'tests']
 *      R.append('tests', []); //=> ['tests']
 *      R.append(['tests'], ['write', 'more']); //=> ['write', 'more', ['tests']]
 */
var append = /*#__PURE__*/_curry2(function append(el, list) {
  return _concat(list, [el]);
});

/**
 * Returns a list of all the enumerable own properties of the supplied object.
 * Note that the order of the output array is not guaranteed across different
 * JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own properties.
 * @see R.valuesIn, R.keys
 * @example
 *
 *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
 */
var values = /*#__PURE__*/_curry1(function values(obj) {
  var props = keys(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;
  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }
  return vals;
});

/**
 * Determine if the passed argument is an integer.
 *
 * @private
 * @param {*} n
 * @category Type
 * @return {Boolean}
 */

function _isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

/**
 * "lifts" a function to be the specified arity, so that it may "map over" that
 * many lists, Functions or other objects that satisfy the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig Number -> (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.lift, R.ap
 * @example
 *
 *      var madd3 = R.liftN(3, (...args) => R.sum(args));
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 */
var liftN = /*#__PURE__*/_curry2(function liftN(arity, fn) {
  var lifted = curryN(arity, fn);
  return curryN(arity, function () {
    return _reduce(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
  });
});

/**
 * "lifts" a function of arity > 1 so that it may "map over" a list, Function or other
 * object that satisfies the [FantasyLand Apply spec](https://github.com/fantasyland/fantasy-land#apply).
 *
 * @func
 * @memberOf R
 * @since v0.7.0
 * @category Function
 * @sig (*... -> *) -> ([*]... -> [*])
 * @param {Function} fn The function to lift into higher context
 * @return {Function} The lifted function.
 * @see R.liftN
 * @example
 *
 *      var madd3 = R.lift((a, b, c) => a + b + c);
 *
 *      madd3([1,2,3], [1,2,3], [1]); //=> [3, 4, 5, 4, 5, 6, 5, 6, 7]
 *
 *      var madd5 = R.lift((a, b, c, d, e) => a + b + c + d + e);
 *
 *      madd5([1,2], [3], [4, 5], [6], [7, 8]); //=> [21, 22, 22, 23, 22, 23, 23, 24]
 */
var lift = /*#__PURE__*/_curry1(function lift(fn) {
  return liftN(fn.length, fn);
});

/**
 * Returns a curried equivalent of the provided function. The curried function
 * has two unusual capabilities. First, its arguments needn't be provided one
 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> a) -> (* -> a)
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curryN
 * @example
 *
 *      var addFourNumbers = (a, b, c, d) => a + b + c + d;
 *
 *      var curriedAddFourNumbers = R.curry(addFourNumbers);
 *      var f = curriedAddFourNumbers(1, 2);
 *      var g = f(3);
 *      g(4); //=> 10
 */
var curry = /*#__PURE__*/_curry1(function curry(fn) {
  return curryN(fn.length, fn);
});

/**
 * Returns the result of calling its first argument with the remaining
 * arguments. This is occasionally useful as a converging function for
 * [`R.converge`](#converge): the first branch can produce a function while the
 * remaining branches produce values to be passed to that function as its
 * arguments.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Function
 * @sig (*... -> a),*... -> a
 * @param {Function} fn The function to apply to the remaining arguments.
 * @param {...*} args Any number of positional arguments.
 * @return {*}
 * @see R.apply
 * @example
 *
 *      R.call(R.add, 1, 2); //=> 3
 *
 *      var indentN = R.pipe(R.repeat(' '),
 *                           R.join(''),
 *                           R.replace(/^(?!$)/gm));
 *
 *      var format = R.converge(R.call, [
 *                                  R.pipe(R.prop('indent'), indentN),
 *                                  R.prop('value')
 *                              ]);
 *
 *      format({indent: 2, value: 'foo\nbar\nbaz\n'}); //=> '  foo\n  bar\n  baz\n'
 * @symb R.call(f, a, b) = f(a, b)
 */
var call = /*#__PURE__*/curry(function call(fn) {
  return fn.apply(this, Array.prototype.slice.call(arguments, 1));
});

/**
 * `_makeFlat` is a helper function that returns a one-level or fully recursive
 * function based on the flag passed in.
 *
 * @private
 */
function _makeFlat(recursive) {
  return function flatt(list) {
    var value, jlen, j;
    var result = [];
    var idx = 0;
    var ilen = list.length;

    while (idx < ilen) {
      if (_isArrayLike(list[idx])) {
        value = recursive ? flatt(list[idx]) : list[idx];
        j = 0;
        jlen = value.length;
        while (j < jlen) {
          result[result.length] = value[j];
          j += 1;
        }
      } else {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
  };
}

function _forceReduced(x) {
  return {
    '@@transducer/value': x,
    '@@transducer/reduced': true
  };
}

var preservingReduced = function (xf) {
  return {
    '@@transducer/init': _xfBase.init,
    '@@transducer/result': function (result) {
      return xf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      var ret = xf['@@transducer/step'](result, input);
      return ret['@@transducer/reduced'] ? _forceReduced(ret) : ret;
    }
  };
};

var _flatCat = function _xcat(xf) {
  var rxf = preservingReduced(xf);
  return {
    '@@transducer/init': _xfBase.init,
    '@@transducer/result': function (result) {
      return rxf['@@transducer/result'](result);
    },
    '@@transducer/step': function (result, input) {
      return !_isArrayLike(input) ? _reduce(rxf, result, [input]) : _reduce(rxf, result, input);
    }
  };
};

var _xchain = /*#__PURE__*/_curry2(function _xchain(f, xf) {
  return map(f, _flatCat(xf));
});

/**
 * `chain` maps a function over a list and concatenates the results. `chain`
 * is also known as `flatMap` in some libraries
 *
 * Dispatches to the `chain` method of the second argument, if present,
 * according to the [FantasyLand Chain spec](https://github.com/fantasyland/fantasy-land#chain).
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain m => (a -> m b) -> m a -> m b
 * @param {Function} fn The function to map with
 * @param {Array} list The list to map over
 * @return {Array} The result of flat-mapping `list` with `fn`
 * @example
 *
 *      var duplicate = n => [n, n];
 *      R.chain(duplicate, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
 *
 *      R.chain(R.append, R.head)([1, 2, 3]); //=> [1, 2, 3, 1]
 */
var chain = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['fantasy-land/chain', 'chain'], _xchain, function chain(fn, monad) {
  if (typeof monad === 'function') {
    return function (x) {
      return fn(monad(x))(x);
    };
  }
  return _makeFlat(false)(map(fn, monad));
}));

function _cloneRegExp(pattern) {
                                  return new RegExp(pattern.source, (pattern.global ? 'g' : '') + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '') + (pattern.sticky ? 'y' : '') + (pattern.unicode ? 'u' : ''));
}

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */
var type = /*#__PURE__*/_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});

/**
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */
function _clone(value, refFrom, refTo, deep) {
  var copy = function copy(copiedValue) {
    var len = refFrom.length;
    var idx = 0;
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }
      idx += 1;
    }
    refFrom[idx + 1] = value;
    refTo[idx + 1] = copiedValue;
    for (var key in value) {
      copiedValue[key] = deep ? _clone(value[key], refFrom, refTo, true) : value[key];
    }
    return copiedValue;
  };
  switch (type(value)) {
    case 'Object':
      return copy({});
    case 'Array':
      return copy([]);
    case 'Date':
      return new Date(value.valueOf());
    case 'RegExp':
      return _cloneRegExp(value);
    default:
      return value;
  }
}

/**
 * Creates a deep copy of the value which may contain (nested) `Array`s and
 * `Object`s, `Number`s, `String`s, `Boolean`s and `Date`s. `Function`s are
 * assigned by reference rather than copied
 *
 * Dispatches to a `clone` method if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {*} -> {*}
 * @param {*} value The object or array to clone
 * @return {*} A deeply cloned copy of `val`
 * @example
 *
 *      var objects = [{}, {}, {}];
 *      var objectsClone = R.clone(objects);
 *      objects === objectsClone; //=> false
 *      objects[0] === objectsClone[0]; //=> false
 */
var clone = /*#__PURE__*/_curry1(function clone(value) {
  return value != null && typeof value.clone === 'function' ? value.clone() : _clone(value, [], [], true);
});

/**
 * A function that returns the `!` of its argument. It will return `true` when
 * passed false-y value, and `false` when passed a truth-y one.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig * -> Boolean
 * @param {*} a any value
 * @return {Boolean} the logical inverse of passed argument.
 * @see R.complement
 * @example
 *
 *      R.not(true); //=> false
 *      R.not(false); //=> true
 *      R.not(0); //=> true
 *      R.not(1); //=> false
 */
var not = /*#__PURE__*/_curry1(function not(a) {
  return !a;
});

/**
 * Takes a function `f` and returns a function `g` such that if called with the same arguments
 * when `f` returns a "truthy" value, `g` returns `false` and when `f` returns a "falsy" value `g` returns `true`.
 *
 * `R.complement` may be applied to any functor
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category Logic
 * @sig (*... -> *) -> (*... -> Boolean)
 * @param {Function} f
 * @return {Function}
 * @see R.not
 * @example
 *
 *      var isNotNil = R.complement(R.isNil);
 *      isNil(null); //=> true
 *      isNotNil(null); //=> false
 *      isNil(7); //=> false
 *      isNotNil(7); //=> true
 */
var complement = /*#__PURE__*/lift(not);

function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}

/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */
function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;
    if (length === 0) {
      return fn();
    }
    var obj = arguments[length - 1];
    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */
var slice = /*#__PURE__*/_curry3( /*#__PURE__*/_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));

/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */
var tail = /*#__PURE__*/_curry1( /*#__PURE__*/_checkForMethod('tail', /*#__PURE__*/slice(1, Infinity)));

/**
 * Performs left-to-right function composition. The leftmost function may have
 * any arity; the remaining functions must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      var f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 */
function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }
  return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
}

/**
 * Returns a new list or string with the elements or characters in reverse
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {Array|String} list
 * @return {Array|String}
 * @example
 *
 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
 *      R.reverse([1, 2]);     //=> [2, 1]
 *      R.reverse([1]);        //=> [1]
 *      R.reverse([]);         //=> []
 *
 *      R.reverse('abc');      //=> 'cba'
 *      R.reverse('ab');       //=> 'ba'
 *      R.reverse('a');        //=> 'a'
 *      R.reverse('');         //=> ''
 */
var reverse = /*#__PURE__*/_curry1(function reverse(list) {
  return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
});

/**
 * Performs right-to-left function composition. The rightmost function may have
 * any arity; the remaining functions must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipe
 * @example
 *
 *      var classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
 *      var yellGreeting = R.compose(R.toUpper, classyGreeting);
 *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
 *
 * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
 */
function compose() {
  if (arguments.length === 0) {
    throw new Error('compose requires at least one argument');
  }
  return pipe.apply(this, reverse(arguments));
}

function _arrayFromIterator(iter) {
  var list = [];
  var next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}

function _containsWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`;
 * `0` and `-0` are not identical.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      var o = {};
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */
var identical = /*#__PURE__*/_curry2(function identical(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
});

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);
  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  }

  // if *a* array contains any element that is not included in *b*
  return !_containsWith(function (b, aItem) {
    return !_containsWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (identical(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }
      break;
    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case 'Date':
      if (!identical(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }
      break;
  }

  var idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;
    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);
  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);

  idx = keysA.length - 1;
  while (idx >= 0) {
    var key = keysA[idx];
    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }
    idx -= 1;
  }
  return true;
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      var a = {}; a.v = a;
 *      var b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */
var equals = /*#__PURE__*/_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});

function _indexOf(list, a, idx) {
  var inf, item;
  // Array.prototype.indexOf doesn't exist below IE9
  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;
          while (idx < list.length) {
            item = list[idx];
            if (item === 0 && 1 / item === inf) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];
            if (typeof item === 'number' && item !== item) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        }
        // non-zero numbers can utilise Set
        return list.indexOf(a, idx);

      // all these types can utilise Set
      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }
    }
  }
  // anything else not covered above, defer to R.equals
  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }
    idx += 1;
  }
  return -1;
}

function _contains(a, list) {
  return _indexOf(list, a, 0) >= 0;
}

function _quote(s) {
  var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b') // \b matches word boundary; [\b] matches backspace
  .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');

  return '"' + escaped.replace(/"/g, '\\"') + '"';
}

/**
 * Polyfill from <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString>.
 */
var pad = function pad(n) {
  return (n < 10 ? '0' : '') + n;
};

var _toISOString = typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
  return d.toISOString();
} : function _toISOString(d) {
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
};

function _complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
}

function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];

  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }
    idx += 1;
  }
  return result;
}

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

var XFilter = /*#__PURE__*/function () {
  function XFilter(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XFilter.prototype['@@transducer/init'] = _xfBase.init;
  XFilter.prototype['@@transducer/result'] = _xfBase.result;
  XFilter.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
  };

  return XFilter;
}();

var _xfilter = /*#__PURE__*/_curry2(function _xfilter(f, xf) {
  return new XFilter(f, xf);
});

/**
 * Takes a predicate and a `Filterable`, and returns a new filterable of the
 * same type containing the members of the given filterable which satisfy the
 * given predicate. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * Dispatches to the `filter` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array} Filterable
 * @see R.reject, R.transduce, R.addIndex
 * @example
 *
 *      var isEven = n => n % 2 === 0;
 *
 *      R.filter(isEven, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.filter(isEven, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */
var filter = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable(['filter'], _xfilter, function (pred, filterable) {
  return _isObject(filterable) ? _reduce(function (acc, key) {
    if (pred(filterable[key])) {
      acc[key] = filterable[key];
    }
    return acc;
  }, {}, keys(filterable)) :
  // else
  _filter(pred, filterable);
}));

/**
 * The complement of [`filter`](#filter).
 *
 * Acts as a transducer if a transformer is given in list position. Filterable
 * objects include plain objects or any object that has a filter method such
 * as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> f a
 * @param {Function} pred
 * @param {Array} filterable
 * @return {Array}
 * @see R.filter, R.transduce, R.addIndex
 * @example
 *
 *      var isOdd = (n) => n % 2 === 1;
 *
 *      R.reject(isOdd, [1, 2, 3, 4]); //=> [2, 4]
 *
 *      R.reject(isOdd, {a: 1, b: 2, c: 3, d: 4}); //=> {b: 2, d: 4}
 */
var reject = /*#__PURE__*/_curry2(function reject(pred, filterable) {
  return filter(_complement(pred), filterable);
});

function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return _contains(y, xs) ? '<Circular>' : _toString(y, xs);
  };

  //  mapPairs :: (Object, [String]) -> [String]
  var mapPairs = function (obj, keys$$1) {
    return _map(function (k) {
      return _quote(k) + ': ' + recur(obj[k]);
    }, keys$$1.slice().sort());
  };

  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
    case '[object Array]':
      return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
        return (/^\d+$/.test(k)
        );
      }, keys(x)))).join(', ') + ']';
    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
    case '[object Null]':
      return 'null';
    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
    case '[object Undefined]':
      return 'undefined';
    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();
        if (repr !== '[object Object]') {
          return repr;
        }
      }
      return '{' + mapPairs(x, keys(x)).join(', ') + '}';
  }
}

/**
 * Returns the string representation of the given value. `eval`'ing the output
 * should result in a value equivalent to the input value. Many of the built-in
 * `toString` methods do not satisfy this requirement.
 *
 * If the given value is an `[object Object]` with a `toString` method other
 * than `Object.prototype.toString`, this method is invoked with no arguments
 * to produce the return value. This means user-defined constructor functions
 * can provide a suitable `toString` method. For example:
 *
 *     function Point(x, y) {
 *       this.x = x;
 *       this.y = y;
 *     }
 *
 *     Point.prototype.toString = function() {
 *       return 'new Point(' + this.x + ', ' + this.y + ')';
 *     };
 *
 *     R.toString(new Point(1, 2)); //=> 'new Point(1, 2)'
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category String
 * @sig * -> String
 * @param {*} val
 * @return {String}
 * @example
 *
 *      R.toString(42); //=> '42'
 *      R.toString('abc'); //=> '"abc"'
 *      R.toString([1, 2, 3]); //=> '[1, 2, 3]'
 *      R.toString({foo: 1, bar: 2, baz: 3}); //=> '{"bar": 2, "baz": 3, "foo": 1}'
 *      R.toString(new Date('2001-02-03T04:05:06Z')); //=> 'new Date("2001-02-03T04:05:06.000Z")'
 */
var toString$1 = /*#__PURE__*/_curry1(function toString(val) {
  return _toString(val, []);
});

/**
 * Returns the result of concatenating the given lists or strings.
 *
 * Note: `R.concat` expects both arguments to be of the same type,
 * unlike the native `Array.prototype.concat` method. It will throw
 * an error if you `concat` an Array with a non-Array value.
 *
 * Dispatches to the `concat` method of the first argument, if present.
 * Can also concatenate two members of a [fantasy-land
 * compatible semigroup](https://github.com/fantasyland/fantasy-land#semigroup).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a] -> [a]
 * @sig String -> String -> String
 * @param {Array|String} firstList The first list
 * @param {Array|String} secondList The second list
 * @return {Array|String} A list consisting of the elements of `firstList` followed by the elements of
 * `secondList`.
 *
 * @example
 *
 *      R.concat('ABC', 'DEF'); // 'ABCDEF'
 *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
 *      R.concat([], []); //=> []
 */
var concat = /*#__PURE__*/_curry2(function concat(a, b) {
  if (_isArray(a)) {
    if (_isArray(b)) {
      return a.concat(b);
    }
    throw new TypeError(toString$1(b) + ' is not an array');
  }
  if (_isString(a)) {
    if (_isString(b)) {
      return a + b;
    }
    throw new TypeError(toString$1(b) + ' is not a string');
  }
  if (a != null && _isFunction(a['fantasy-land/concat'])) {
    return a['fantasy-land/concat'](b);
  }
  if (a != null && _isFunction(a.concat)) {
    return a.concat(b);
  }
  throw new TypeError(toString$1(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
});

/**
 * Returns `true` if the specified value is equal, in [`R.equals`](#equals)
 * terms, to at least one element of the given list; `false` otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig a -> [a] -> Boolean
 * @param {Object} a The item to compare against.
 * @param {Array} list The array to consider.
 * @return {Boolean} `true` if an equivalent item is in the list, `false` otherwise.
 * @see R.any
 * @example
 *
 *      R.contains(3, [1, 2, 3]); //=> true
 *      R.contains(4, [1, 2, 3]); //=> false
 *      R.contains({ name: 'Fred' }, [{ name: 'Fred' }]); //=> true
 *      R.contains([42], [[42]]); //=> true
 */
var contains$1 = /*#__PURE__*/_curry2(_contains);

/**
 * Accepts a converging function and a list of branching functions and returns
 * a new function. When invoked, this new function is applied to some
 * arguments, each branching function is applied to those same arguments. The
 * results of each branching function are passed as arguments to the converging
 * function to produce the return value.
 *
 * @func
 * @memberOf R
 * @since v0.4.2
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [((a, b, ...) -> x1), ((a, b, ...) -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} after A function. `after` will be invoked with the return values of
 *        `fn1` and `fn2` as its arguments.
 * @param {Array} functions A list of functions.
 * @return {Function} A new function.
 * @see R.useWith
 * @example
 *
 *      var average = R.converge(R.divide, [R.sum, R.length])
 *      average([1, 2, 3, 4, 5, 6, 7]) //=> 4
 *
 *      var strangeConcat = R.converge(R.concat, [R.toUpper, R.toLower])
 *      strangeConcat("Yodel") //=> "YODELyodel"
 *
 * @symb R.converge(f, [g, h])(a, b) = f(g(a, b), h(a, b))
 */
var converge = /*#__PURE__*/_curry2(function converge(after, fns) {
  return curryN(reduce(max, 0, pluck('length', fns)), function () {
    var args = arguments;
    var context = this;
    return after.apply(context, _map(function (fn) {
      return fn.apply(context, args);
    }, fns));
  });
});

var XReduceBy = /*#__PURE__*/function () {
  function XReduceBy(valueFn, valueAcc, keyFn, xf) {
    this.valueFn = valueFn;
    this.valueAcc = valueAcc;
    this.keyFn = keyFn;
    this.xf = xf;
    this.inputs = {};
  }
  XReduceBy.prototype['@@transducer/init'] = _xfBase.init;
  XReduceBy.prototype['@@transducer/result'] = function (result) {
    var key;
    for (key in this.inputs) {
      if (_has(key, this.inputs)) {
        result = this.xf['@@transducer/step'](result, this.inputs[key]);
        if (result['@@transducer/reduced']) {
          result = result['@@transducer/value'];
          break;
        }
      }
    }
    this.inputs = null;
    return this.xf['@@transducer/result'](result);
  };
  XReduceBy.prototype['@@transducer/step'] = function (result, input) {
    var key = this.keyFn(input);
    this.inputs[key] = this.inputs[key] || [key, this.valueAcc];
    this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
    return result;
  };

  return XReduceBy;
}();

var _xreduceBy = /*#__PURE__*/_curryN(4, [], function _xreduceBy(valueFn, valueAcc, keyFn, xf) {
  return new XReduceBy(valueFn, valueAcc, keyFn, xf);
});

/**
 * Groups the elements of the list according to the result of calling
 * the String-returning function `keyFn` on each element and reduces the elements
 * of each group to a single value via the reducer function `valueFn`.
 *
 * This function is basically a more general [`groupBy`](#groupBy) function.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.20.0
 * @category List
 * @sig ((a, b) -> a) -> a -> (b -> String) -> [b] -> {String: a}
 * @param {Function} valueFn The function that reduces the elements of each group to a single
 *        value. Receives two values, accumulator for a particular group and the current element.
 * @param {*} acc The (initial) accumulator value for each group.
 * @param {Function} keyFn The function that maps the list's element into a key.
 * @param {Array} list The array to group.
 * @return {Object} An object with the output of `keyFn` for keys, mapped to the output of
 *         `valueFn` for elements which produced that key when passed to `keyFn`.
 * @see R.groupBy, R.reduce
 * @example
 *
 *      var reduceToNamesBy = R.reduceBy((acc, student) => acc.concat(student.name), []);
 *      var namesByGrade = reduceToNamesBy(function(student) {
 *        var score = student.score;
 *        return score < 65 ? 'F' :
 *               score < 70 ? 'D' :
 *               score < 80 ? 'C' :
 *               score < 90 ? 'B' : 'A';
 *      });
 *      var students = [{name: 'Lucy', score: 92},
 *                      {name: 'Drew', score: 85},
 *                      // ...
 *                      {name: 'Bart', score: 62}];
 *      namesByGrade(students);
 *      // {
 *      //   'A': ['Lucy'],
 *      //   'B': ['Drew']
 *      //   // ...,
 *      //   'F': ['Bart']
 *      // }
 */
var reduceBy = /*#__PURE__*/_curryN(4, [], /*#__PURE__*/_dispatchable([], _xreduceBy, function reduceBy(valueFn, valueAcc, keyFn, list) {
  return _reduce(function (acc, elt) {
    var key = keyFn(elt);
    acc[key] = valueFn(_has(key, acc) ? acc[key] : valueAcc, elt);
    return acc;
  }, {}, list);
}));

/**
 * Counts the elements of a list according to how many match each value of a
 * key generated by the supplied function. Returns an object mapping the keys
 * produced by `fn` to the number of occurrences in the list. Note that all
 * keys are coerced to strings because of how JavaScript objects work.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig (a -> String) -> [a] -> {*}
 * @param {Function} fn The function used to map values to keys.
 * @param {Array} list The list to count elements from.
 * @return {Object} An object mapping keys to number of occurrences in the list.
 * @example
 *
 *      var numbers = [1.0, 1.1, 1.2, 2.0, 3.0, 2.2];
 *      R.countBy(Math.floor)(numbers);    //=> {'1': 3, '2': 2, '3': 1}
 *
 *      var letters = ['a', 'b', 'A', 'a', 'B', 'c'];
 *      R.countBy(R.toLower)(letters);   //=> {'a': 3, 'b': 2, 'c': 1}
 */
var countBy = /*#__PURE__*/reduceBy(function (acc, elem) {
  return acc + 1;
}, 0);

/**
 * Decrements its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n - 1
 * @see R.inc
 * @example
 *
 *      R.dec(42); //=> 41
 */
var dec = /*#__PURE__*/add(-1);

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Objects and Arrays are compared in terms of
 * value equality, not reference equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith, R.without
 * @example
 *
 *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
 *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
 *      R.difference([{a: 1}, {b: 2}], [{a: 1}, {c: 3}]) //=> [{b: 2}]
 */
var difference = /*#__PURE__*/_curry2(function difference(first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;
  while (idx < firstLen) {
    if (!_contains(first[idx], second) && !_contains(first[idx], out)) {
      out[out.length] = first[idx];
    }
    idx += 1;
  }
  return out;
});

var XDropRepeatsWith = /*#__PURE__*/function () {
  function XDropRepeatsWith(pred, xf) {
    this.xf = xf;
    this.pred = pred;
    this.lastValue = undefined;
    this.seenFirstValue = false;
  }

  XDropRepeatsWith.prototype['@@transducer/init'] = _xfBase.init;
  XDropRepeatsWith.prototype['@@transducer/result'] = _xfBase.result;
  XDropRepeatsWith.prototype['@@transducer/step'] = function (result, input) {
    var sameAsLast = false;
    if (!this.seenFirstValue) {
      this.seenFirstValue = true;
    } else if (this.pred(this.lastValue, input)) {
      sameAsLast = true;
    }
    this.lastValue = input;
    return sameAsLast ? result : this.xf['@@transducer/step'](result, input);
  };

  return XDropRepeatsWith;
}();

var _xdropRepeatsWith = /*#__PURE__*/_curry2(function _xdropRepeatsWith(pred, xf) {
  return new XDropRepeatsWith(pred, xf);
});

/**
 * Returns the nth element of the given list or string. If n is negative the
 * element at index length + n is returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig Number -> [a] -> a | Undefined
 * @sig Number -> String -> String
 * @param {Number} offset
 * @param {*} list
 * @return {*}
 * @example
 *
 *      var list = ['foo', 'bar', 'baz', 'quux'];
 *      R.nth(1, list); //=> 'bar'
 *      R.nth(-1, list); //=> 'quux'
 *      R.nth(-99, list); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */
var nth = /*#__PURE__*/_curry2(function nth(offset, list) {
  var idx = offset < 0 ? list.length + offset : offset;
  return _isString(list) ? list.charAt(idx) : list[idx];
});

/**
 * Returns the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.init, R.head, R.tail
 * @example
 *
 *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
 *      R.last([]); //=> undefined
 *
 *      R.last('abc'); //=> 'c'
 *      R.last(''); //=> ''
 */
var last = /*#__PURE__*/nth(-1);

/**
 * Returns a new list without any consecutively repeating elements. Equality is
 * determined by applying the supplied predicate to each pair of consecutive elements. The
 * first element in a series of equal elements will be preserved.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig ((a, a) -> Boolean) -> [a] -> [a]
 * @param {Function} pred A predicate used to test whether two items are equal.
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *      var l = [1, -1, 1, 3, 4, -4, -4, -5, 5, 3, 3];
 *      R.dropRepeatsWith(R.eqBy(Math.abs), l); //=> [1, 3, 4, -5, 3]
 */
var dropRepeatsWith = /*#__PURE__*/_curry2( /*#__PURE__*/_dispatchable([], _xdropRepeatsWith, function dropRepeatsWith(pred, list) {
  var result = [];
  var idx = 1;
  var len = list.length;
  if (len !== 0) {
    result[0] = list[0];
    while (idx < len) {
      if (!pred(last(result), list[idx])) {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
  }
  return result;
}));

/**
 * Returns a new list without any consecutively repeating elements.
 * [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.14.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *     R.dropRepeats([1, 1, 1, 2, 3, 4, 4, 2, 2]); //=> [1, 2, 3, 4, 2]
 */
var dropRepeats = /*#__PURE__*/_curry1( /*#__PURE__*/_dispatchable([], /*#__PURE__*/_xdropRepeatsWith(equals), /*#__PURE__*/dropRepeatsWith(equals)));

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));      //=> Nothing()
 *      R.empty([1, 2, 3]);     //=> []
 *      R.empty('unicorns');    //=> ''
 *      R.empty({x: 1, y: 2});  //=> {}
 */
var empty = /*#__PURE__*/_curry1(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
    return arguments;
  }() :
  // else
  void 0;
});

/**
 * Returns a new function much like the supplied one, except that the first two
 * arguments' order is reversed.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((a, b, c, ...) -> z) -> (b -> a -> c -> ... -> z)
 * @param {Function} fn The function to invoke with its first two parameters reversed.
 * @return {*} The result of invoking `fn` with its first two parameters' order reversed.
 * @example
 *
 *      var mergeThree = (a, b, c) => [].concat(a, b, c);
 *
 *      mergeThree(1, 2, 3); //=> [1, 2, 3]
 *
 *      R.flip(mergeThree)(1, 2, 3); //=> [2, 1, 3]
 * @symb R.flip(f)(a, b, c) = f(b, a, c)
 */
var flip = /*#__PURE__*/_curry1(function flip(fn) {
  return curryN(fn.length, function (a, b) {
    var args = Array.prototype.slice.call(arguments, 0);
    args[0] = b;
    args[1] = a;
    return fn.apply(this, args);
  });
});

/**
 * Iterate over an input `list`, calling a provided function `fn` for each
 * element in the list.
 *
 * `fn` receives one argument: *(value)*.
 *
 * Note: `R.forEach` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.forEach` method. For more
 * details on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Description
 *
 * Also note that, unlike `Array.prototype.forEach`, Ramda's `forEach` returns
 * the original array. In some libraries this function is named `each`.
 *
 * Dispatches to the `forEach` method of the second argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> *) -> [a] -> [a]
 * @param {Function} fn The function to invoke. Receives one argument, `value`.
 * @param {Array} list The list to iterate over.
 * @return {Array} The original list.
 * @see R.addIndex
 * @example
 *
 *      var printXPlusFive = x => console.log(x + 5);
 *      R.forEach(printXPlusFive, [1, 2, 3]); //=> [1, 2, 3]
 *      // logs 6
 *      // logs 7
 *      // logs 8
 * @symb R.forEach(f, [a, b, c]) = [a, b, c]
 */
var forEach = /*#__PURE__*/_curry2( /*#__PURE__*/_checkForMethod('forEach', function forEach(fn, list) {
  var len = list.length;
  var idx = 0;
  while (idx < len) {
    fn(list[idx]);
    idx += 1;
  }
  return list;
}));

/**
 * Iterate over an input `object`, calling a provided function `fn` for each
 * key and value in the object.
 *
 * `fn` receives three argument: *(value, key, obj)*.
 *
 * @func
 * @memberOf R
 * @since v0.23.0
 * @category Object
 * @sig ((a, String, StrMap a) -> Any) -> StrMap a -> StrMap a
 * @param {Function} fn The function to invoke. Receives three argument, `value`, `key`, `obj`.
 * @param {Object} obj The object to iterate over.
 * @return {Object} The original object.
 * @example
 *
 *      var printKeyConcatValue = (value, key) => console.log(key + ':' + value);
 *      R.forEachObjIndexed(printKeyConcatValue, {x: 1, y: 2}); //=> {x: 1, y: 2}
 *      // logs x:1
 *      // logs y:2
 * @symb R.forEachObjIndexed(f, {x: a, y: b}) = {x: a, y: b}
 */
var forEachObjIndexed = /*#__PURE__*/_curry2(function forEachObjIndexed(fn, obj) {
  var keyList = keys(obj);
  var idx = 0;
  while (idx < keyList.length) {
    var key = keyList[idx];
    fn(obj[key], key, obj);
    idx += 1;
  }
  return obj;
});

/**
 * Creates a new object from a list key-value pairs. If a key appears in
 * multiple pairs, the rightmost pair is included in the object.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [[k,v]] -> {k: v}
 * @param {Array} pairs An array of two-element arrays that will be the keys and values of the output object.
 * @return {Object} The object made by pairing up `keys` and `values`.
 * @see R.toPairs, R.pair
 * @example
 *
 *      R.fromPairs([['a', 1], ['b', 2], ['c', 3]]); //=> {a: 1, b: 2, c: 3}
 */
var fromPairs = /*#__PURE__*/_curry1(function fromPairs(pairs) {
  var result = {};
  var idx = 0;
  while (idx < pairs.length) {
    result[pairs[idx][0]] = pairs[idx][1];
    idx += 1;
  }
  return result;
});

/**
 * Splits a list into sub-lists stored in an object, based on the result of
 * calling a String-returning function on each element, and grouping the
 * results according to values returned.
 *
 * Dispatches to the `groupBy` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a -> String) -> [a] -> {String: [a]}
 * @param {Function} fn Function :: a -> String
 * @param {Array} list The array to group
 * @return {Object} An object with the output of `fn` for keys, mapped to arrays of elements
 *         that produced that key when passed to `fn`.
 * @see R.transduce
 * @example
 *
 *      var byGrade = R.groupBy(function(student) {
 *        var score = student.score;
 *        return score < 65 ? 'F' :
 *               score < 70 ? 'D' :
 *               score < 80 ? 'C' :
 *               score < 90 ? 'B' : 'A';
 *      });
 *      var students = [{name: 'Abby', score: 84},
 *                      {name: 'Eddy', score: 58},
 *                      // ...
 *                      {name: 'Jack', score: 69}];
 *      byGrade(students);
 *      // {
 *      //   'A': [{name: 'Dianne', score: 99}],
 *      //   'B': [{name: 'Abby', score: 84}]
 *      //   // ...,
 *      //   'F': [{name: 'Eddy', score: 58}]
 *      // }
 */
var groupBy = /*#__PURE__*/_curry2( /*#__PURE__*/_checkForMethod('groupBy', /*#__PURE__*/reduceBy(function (acc, item) {
  if (acc == null) {
    acc = [];
  }
  acc.push(item);
  return acc;
}, null)));

/**
 * Returns the first element of the given list or string. In some libraries
 * this function is named `first`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> a | Undefined
 * @sig String -> String
 * @param {Array|String} list
 * @return {*}
 * @see R.tail, R.init, R.last
 * @example
 *
 *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
 *      R.head([]); //=> undefined
 *
 *      R.head('abc'); //=> 'a'
 *      R.head(''); //=> ''
 */
var head = /*#__PURE__*/nth(0);

function _identity(x) {
  return x;
}

/**
 * A function that does nothing but return the parameter supplied to it. Good
 * as a default or placeholder function.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> a
 * @param {*} x The value to return.
 * @return {*} The input value, `x`.
 * @example
 *
 *      R.identity(1); //=> 1
 *
 *      var obj = {};
 *      R.identity(obj) === obj; //=> true
 * @symb R.identity(a) = a
 */
var identity = /*#__PURE__*/_curry1(_identity);

/**
 * Increments its argument.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category Math
 * @sig Number -> Number
 * @param {Number} n
 * @return {Number} n + 1
 * @see R.dec
 * @example
 *
 *      R.inc(42); //=> 43
 */
var inc = /*#__PURE__*/add(1);

/**
 * Given a function that generates a key, turns a list of objects into an
 * object indexing the objects by the given key. Note that if multiple
 * objects generate the same value for the indexing key only the last value
 * will be included in the generated object.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category List
 * @sig (a -> String) -> [{k: v}] -> {k: {k: v}}
 * @param {Function} fn Function :: a -> String
 * @param {Array} array The array of objects to index
 * @return {Object} An object indexing each array element by the given property.
 * @example
 *
 *      var list = [{id: 'xyz', title: 'A'}, {id: 'abc', title: 'B'}];
 *      R.indexBy(R.prop('id'), list);
 *      //=> {abc: {id: 'abc', title: 'B'}, xyz: {id: 'xyz', title: 'A'}}
 */
var indexBy = /*#__PURE__*/reduceBy(function (acc, elem) {
  return elem;
}, null);

/**
 * Returns all but the last element of the given list or string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.last, R.head, R.tail
 * @example
 *
 *      R.init([1, 2, 3]);  //=> [1, 2]
 *      R.init([1, 2]);     //=> [1]
 *      R.init([1]);        //=> []
 *      R.init([]);         //=> []
 *
 *      R.init('abc');  //=> 'ab'
 *      R.init('ab');   //=> 'a'
 *      R.init('a');    //=> ''
 *      R.init('');     //=> ''
 */
var init = /*#__PURE__*/slice(0, -1);

var _Set = /*#__PURE__*/function () {
  function _Set() {
    /* globals Set */
    this._nativeSet = typeof Set === 'function' ? new Set() : null;
    this._items = {};
  }

  // until we figure out why jsdoc chokes on this
  // @param item The item to add to the Set
  // @returns {boolean} true if the item did not exist prior, otherwise false
  //
  _Set.prototype.add = function (item) {
    return !hasOrAdd(item, true, this);
  };

  //
  // @param item The item to check for existence in the Set
  // @returns {boolean} true if the item exists in the Set, otherwise false
  //
  _Set.prototype.has = function (item) {
    return hasOrAdd(item, false, this);
  };

  //
  // Combines the logic for checking whether an item is a member of the set and
  // for adding a new item to the set.
  //
  // @param item       The item to check or add to the Set instance.
  // @param shouldAdd  If true, the item will be added to the set if it doesn't
  //                   already exist.
  // @param set        The set instance to check or add to.
  // @return {boolean} true if the item already existed, otherwise false.
  //
  return _Set;
}();

function hasOrAdd(item, shouldAdd, set) {
  var type = typeof item;
  var prevSize, newSize;
  switch (type) {
    case 'string':
    case 'number':
      // distinguish between +0 and -0
      if (item === 0 && 1 / item === -Infinity) {
        if (set._items['-0']) {
          return true;
        } else {
          if (shouldAdd) {
            set._items['-0'] = true;
          }
          return false;
        }
      }
      // these types can all utilise the native Set
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;
          set._nativeSet.add(item);
          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = {};
            set._items[type][item] = true;
          }
          return false;
        } else if (item in set._items[type]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][item] = true;
          }
          return false;
        }
      }

    case 'boolean':
      // set._items['boolean'] holds a two element array
      // representing [ falseExists, trueExists ]
      if (type in set._items) {
        var bIdx = item ? 1 : 0;
        if (set._items[type][bIdx]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][bIdx] = true;
          }
          return false;
        }
      } else {
        if (shouldAdd) {
          set._items[type] = item ? [false, true] : [true, false];
        }
        return false;
      }

    case 'function':
      // compare functions for reference equality
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;
          set._nativeSet.add(item);
          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = [item];
          }
          return false;
        }
        if (!_contains(item, set._items[type])) {
          if (shouldAdd) {
            set._items[type].push(item);
          }
          return false;
        }
        return true;
      }

    case 'undefined':
      if (set._items[type]) {
        return true;
      } else {
        if (shouldAdd) {
          set._items[type] = true;
        }
        return false;
      }

    case 'object':
      if (item === null) {
        if (!set._items['null']) {
          if (shouldAdd) {
            set._items['null'] = true;
          }
          return false;
        }
        return true;
      }
    /* falls through */
    default:
      // reduce the search size of heterogeneous sets by creating buckets
      // for each type.
      type = Object.prototype.toString.call(item);
      if (!(type in set._items)) {
        if (shouldAdd) {
          set._items[type] = [item];
        }
        return false;
      }
      // scan through all previously applied items
      if (!_contains(item, set._items[type])) {
        if (shouldAdd) {
          set._items[type].push(item);
        }
        return false;
      }
      return true;
  }
}

/**
 * Returns a new list containing only one copy of each element in the original
 * list, based upon the value returned by applying the supplied function to
 * each list element. Prefers the first item if the supplied function produces
 * the same value on two items. [`R.equals`](#equals) is used for comparison.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig (a -> b) -> [a] -> [a]
 * @param {Function} fn A function used to produce a value to use during comparisons.
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniqBy(Math.abs, [-1, -5, 2, 10, 1, 2]); //=> [-1, -5, 2, 10]
 */
var uniqBy = /*#__PURE__*/_curry2(function uniqBy(fn, list) {
  var set = new _Set();
  var result = [];
  var idx = 0;
  var appliedItem, item;

  while (idx < list.length) {
    item = list[idx];
    appliedItem = fn(item);
    if (set.add(appliedItem)) {
      result.push(item);
    }
    idx += 1;
  }
  return result;
});

/**
 * Returns a new list containing only one copy of each element in the original
 * list. [`R.equals`](#equals) is used to determine equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @param {Array} list The array to consider.
 * @return {Array} The list of unique items.
 * @example
 *
 *      R.uniq([1, 1, 2, 1]); //=> [1, 2]
 *      R.uniq([1, '1']);     //=> [1, '1']
 *      R.uniq([[42], [42]]); //=> [[42]]
 */
var uniq = /*#__PURE__*/uniqBy(identity);

/**
 * Turns a named method with a specified arity into a function that can be
 * called directly supplied with arguments and a target object.
 *
 * The returned function is curried and accepts `arity + 1` parameters where
 * the final parameter is the target object.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
 * @param {Number} arity Number of arguments the returned function should take
 *        before the target object.
 * @param {String} method Name of the method to call.
 * @return {Function} A new curried function.
 * @see R.construct
 * @example
 *
 *      var sliceFrom = R.invoker(1, 'slice');
 *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
 *      var sliceFrom6 = R.invoker(2, 'slice')(6);
 *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
 * @symb R.invoker(0, 'method')(o) = o['method']()
 * @symb R.invoker(1, 'method')(a, o) = o['method'](a)
 * @symb R.invoker(2, 'method')(a, b, o) = o['method'](a, b)
 */
var invoker = /*#__PURE__*/_curry2(function invoker(arity, method) {
  return curryN(arity + 1, function () {
    var target = arguments[arity];
    if (target != null && _isFunction(target[method])) {
      return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
    }
    throw new TypeError(toString$1(target) + ' does not have a method named "' + method + '"');
  });
});

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);   //=> false
 *      R.isEmpty([]);          //=> true
 *      R.isEmpty('');          //=> true
 *      R.isEmpty(null);        //=> false
 *      R.isEmpty({});          //=> true
 *      R.isEmpty({length: 0}); //=> false
 */
var isEmpty = /*#__PURE__*/_curry1(function isEmpty(x) {
  return x != null && equals(x, empty(x));
});

/**
 * Returns a string made by inserting the `separator` between each element and
 * concatenating all the elements into a single string.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig String -> [a] -> String
 * @param {Number|String} separator The string used to separate the elements.
 * @param {Array} xs The elements to join into a string.
 * @return {String} str The string made by concatenating `xs` with `separator`.
 * @see R.split
 * @example
 *
 *      var spacer = R.join(' ');
 *      spacer(['a', 2, 3.4]);   //=> 'a 2 3.4'
 *      R.join('|', [1, 2, 3]);    //=> '1|2|3'
 */
var join = /*#__PURE__*/invoker(1, 'join');

/**
 * juxt applies a list of functions to a list of values.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Function
 * @sig [(a, b, ..., m) -> n] -> ((a, b, ..., m) -> [n])
 * @param {Array} fns An array of functions
 * @return {Function} A function that returns a list of values after applying each of the original `fns` to its parameters.
 * @see R.applySpec
 * @example
 *
 *      var getRange = R.juxt([Math.min, Math.max]);
 *      getRange(3, 4, 9, -3); //=> [-3, 9]
 * @symb R.juxt([f, g, h])(a, b) = [f(a, b), g(a, b), h(a, b)]
 */
var juxt = /*#__PURE__*/_curry1(function juxt(fns) {
  return converge(function () {
    return Array.prototype.slice.call(arguments, 0);
  }, fns);
});

function _isNumber(x) {
  return Object.prototype.toString.call(x) === '[object Number]';
}

/**
 * Returns the number of elements in the array by returning `list.length`.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig [a] -> Number
 * @param {Array} list The array to inspect.
 * @return {Number} The length of the array.
 * @example
 *
 *      R.length([]); //=> 0
 *      R.length([1, 2, 3]); //=> 3
 */
var length = /*#__PURE__*/_curry1(function length(list) {
  return list != null && _isNumber(list.length) ? list.length : NaN;
});

/**
 * Adds together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The sum of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.sum([2,4,6,8,100,1]); //=> 121
 */
var sum = /*#__PURE__*/reduce(add, 0);

/**
 * A customisable version of [`R.memoize`](#memoize). `memoizeWith` takes an
 * additional function that will be applied to a given argument set and used to
 * create the cache key under which the results of the function to be memoized
 * will be stored. Care must be taken when implementing key generation to avoid
 * clashes that may overwrite previous entries erroneously.
 *
 *
 * @func
 * @memberOf R
 * @since v0.24.0
 * @category Function
 * @sig (*... -> String) -> (*... -> a) -> (*... -> a)
 * @param {Function} fn The function to generate the cache key.
 * @param {Function} fn The function to memoize.
 * @return {Function} Memoized version of `fn`.
 * @see R.memoize
 * @example
 *
 *      let count = 0;
 *      const factorial = R.memoizeWith(R.identity, n => {
 *        count += 1;
 *        return R.product(R.range(1, n + 1));
 *      });
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      count; //=> 1
 */
var memoizeWith = /*#__PURE__*/_curry2(function memoizeWith(mFn, fn) {
  var cache = {};
  return _arity(fn.length, function () {
    var key = mFn.apply(this, arguments);
    if (!_has(key, cache)) {
      cache[key] = fn.apply(this, arguments);
    }
    return cache[key];
  });
});

/**
 * Creates a new function that, when invoked, caches the result of calling `fn`
 * for a given argument set and returns the result. Subsequent calls to the
 * memoized `fn` with the same argument set will not result in an additional
 * call to `fn`; instead, the cached result for that set of arguments will be
 * returned.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (*... -> a) -> (*... -> a)
 * @param {Function} fn The function to memoize.
 * @return {Function} Memoized version of `fn`.
 * @see R.memoizeWith
 * @deprecated since v0.25.0
 * @example
 *
 *      let count = 0;
 *      const factorial = R.memoize(n => {
 *        count += 1;
 *        return R.product(R.range(1, n + 1));
 *      });
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      factorial(5); //=> 120
 *      count; //=> 1
 */
var memoize = /*#__PURE__*/memoizeWith(function () {
  return toString$1(arguments);
});

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the key
 * and the values associated with the key in each object, with the result being
 * used as the value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((String, a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWithKey, R.merge, R.mergeWith
 * @example
 *
 *      let concatValues = (k, l, r) => k == 'values' ? R.concat(l, r) : r
 *      R.mergeWithKey(concatValues,
 *                     { a: true, thing: 'foo', values: [10, 20] },
 *                     { b: true, thing: 'bar', values: [15, 35] });
 *      //=> { a: true, b: true, thing: 'bar', values: [10, 20, 15, 35] }
 * @symb R.mergeWithKey(f, { x: 1, y: 2 }, { y: 5, z: 3 }) = { x: 1, y: f('y', 2, 5), z: 3 }
 */
var mergeWithKey = /*#__PURE__*/_curry3(function mergeWithKey(fn, l, r) {
  var result = {};
  var k;

  for (k in l) {
    if (_has(k, l)) {
      result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
    }
  }

  for (k in r) {
    if (_has(k, r) && !_has(k, result)) {
      result[k] = r[k];
    }
  }

  return result;
});

/**
 * Creates a new object with the own properties of the two provided objects. If
 * a key exists in both objects, the provided function is applied to the values
 * associated with the key in each object, with the result being used as the
 * value associated with the key in the returned object.
 *
 * @func
 * @memberOf R
 * @since v0.19.0
 * @category Object
 * @sig ((a, a) -> a) -> {a} -> {a} -> {a}
 * @param {Function} fn
 * @param {Object} l
 * @param {Object} r
 * @return {Object}
 * @see R.mergeDeepWith, R.merge, R.mergeWithKey
 * @example
 *
 *      R.mergeWith(R.concat,
 *                  { a: true, values: [10, 20] },
 *                  { b: true, values: [15, 35] });
 *      //=> { a: true, b: true, values: [10, 20, 15, 35] }
 */
var mergeWith = /*#__PURE__*/_curry3(function mergeWith(fn, l, r) {
  return mergeWithKey(function (_, _l, _r) {
    return fn(_l, _r);
  }, l, r);
});

/**
 * Multiplies two numbers. Equivalent to `a * b` but curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig Number -> Number -> Number
 * @param {Number} a The first value.
 * @param {Number} b The second value.
 * @return {Number} The result of `a * b`.
 * @see R.divide
 * @example
 *
 *      var double = R.multiply(2);
 *      var triple = R.multiply(3);
 *      double(3);       //=>  6
 *      triple(4);       //=> 12
 *      R.multiply(2, 5);  //=> 10
 */
var multiply = /*#__PURE__*/_curry2(function multiply(a, b) {
  return a * b;
});

function _createPartialApplicator(concat) {
  return _curry2(function (fn, args) {
    return _arity(Math.max(0, fn.length - args.length), function () {
      return fn.apply(this, concat(args, arguments));
    });
  });
}

/**
 * Takes a function `f` and a list of arguments, and returns a function `g`.
 * When applied, `g` returns the result of applying `f` to the arguments
 * provided to `g` followed by the arguments provided initially.
 *
 * @func
 * @memberOf R
 * @since v0.10.0
 * @category Function
 * @sig ((a, b, c, ..., n) -> x) -> [d, e, f, ..., n] -> ((a, b, c, ...) -> x)
 * @param {Function} f
 * @param {Array} args
 * @return {Function}
 * @see R.partial
 * @example
 *
 *      var greet = (salutation, title, firstName, lastName) =>
 *        salutation + ', ' + title + ' ' + firstName + ' ' + lastName + '!';
 *
 *      var greetMsJaneJones = R.partialRight(greet, ['Ms.', 'Jane', 'Jones']);
 *
 *      greetMsJaneJones('Hello'); //=> 'Hello, Ms. Jane Jones!'
 * @symb R.partialRight(f, [a, b])(c, d) = f(c, d, a, b)
 */
var partialRight = /*#__PURE__*/_createPartialApplicator( /*#__PURE__*/flip(_concat));

/**
 * Takes a predicate and a list or other `Filterable` object and returns the
 * pair of filterable objects of the same type of elements which do and do not
 * satisfy, the predicate, respectively. Filterable objects include plain objects or any object
 * that has a filter method such as `Array`.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Filterable f => (a -> Boolean) -> f a -> [f a, f a]
 * @param {Function} pred A predicate to determine which side the element belongs to.
 * @param {Array} filterable the list (or other filterable) to partition.
 * @return {Array} An array, containing first the subset of elements that satisfy the
 *         predicate, and second the subset of elements that do not satisfy.
 * @see R.filter, R.reject
 * @example
 *
 *      R.partition(R.contains('s'), ['sss', 'ttt', 'foo', 'bars']);
 *      // => [ [ 'sss', 'bars' ],  [ 'ttt', 'foo' ] ]
 *
 *      R.partition(R.contains('s'), { a: 'sss', b: 'ttt', foo: 'bars' });
 *      // => [ { a: 'sss', foo: 'bars' }, { b: 'ttt' }  ]
 */
var partition = /*#__PURE__*/juxt([filter, reject]);

/**
 * Similar to `pick` except that this one includes a `key: undefined` pair for
 * properties that don't exist.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.pick
 * @example
 *
 *      R.pickAll(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pickAll(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, e: undefined, f: undefined}
 */
var pickAll = /*#__PURE__*/_curry2(function pickAll(names, obj) {
  var result = {};
  var idx = 0;
  var len = names.length;
  while (idx < len) {
    var name = names[idx];
    result[name] = obj[name];
    idx += 1;
  }
  return result;
});

/**
 * Multiplies together all the elements of a list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Math
 * @sig [Number] -> Number
 * @param {Array} list An array of numbers
 * @return {Number} The product of all the numbers in the list.
 * @see R.reduce
 * @example
 *
 *      R.product([2,4,6,8,100,1]); //=> 38400
 */
var product = /*#__PURE__*/reduce(multiply, 1);

/**
 * Accepts a function `fn` and a list of transformer functions and returns a
 * new curried function. When the new function is invoked, it calls the
 * function `fn` with parameters consisting of the result of calling each
 * supplied handler on successive arguments to the new function.
 *
 * If more arguments are passed to the returned function than transformer
 * functions, those arguments are passed directly to `fn` as additional
 * parameters. If you expect additional arguments that don't need to be
 * transformed, although you can ignore them, it's best to pass an identity
 * function so that the new function reports the correct arity.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((x1, x2, ...) -> z) -> [(a -> x1), (b -> x2), ...] -> (a -> b -> ... -> z)
 * @param {Function} fn The function to wrap.
 * @param {Array} transformers A list of transformer functions
 * @return {Function} The wrapped function.
 * @see R.converge
 * @example
 *
 *      R.useWith(Math.pow, [R.identity, R.identity])(3, 4); //=> 81
 *      R.useWith(Math.pow, [R.identity, R.identity])(3)(4); //=> 81
 *      R.useWith(Math.pow, [R.dec, R.inc])(3, 4); //=> 32
 *      R.useWith(Math.pow, [R.dec, R.inc])(3)(4); //=> 32
 * @symb R.useWith(f, [g, h])(a, b) = f(g(a), h(b))
 */
var useWith = /*#__PURE__*/_curry2(function useWith(fn, transformers) {
  return curryN(transformers.length, function () {
    var args = [];
    var idx = 0;
    while (idx < transformers.length) {
      args.push(transformers[idx].call(this, arguments[idx]));
      idx += 1;
    }
    return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
  });
});

/**
 * Reasonable analog to SQL `select` statement.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @category Relation
 * @sig [k] -> [{k: v}] -> [{k: v}]
 * @param {Array} props The property names to project
 * @param {Array} objs The objects to query
 * @return {Array} An array of objects with just the `props` properties.
 * @example
 *
 *      var abby = {name: 'Abby', age: 7, hair: 'blond', grade: 2};
 *      var fred = {name: 'Fred', age: 12, hair: 'brown', grade: 7};
 *      var kids = [abby, fred];
 *      R.project(['name', 'grade'], kids); //=> [{name: 'Abby', grade: 2}, {name: 'Fred', grade: 7}]
 */
var project = /*#__PURE__*/useWith(_map, [pickAll, identity]); // passing `identity` gives correct arity

/**
 * Returns a copy of the list, sorted according to the comparator function,
 * which should accept two values at a time and return a negative number if the
 * first value is smaller, a positive number if it's larger, and zero if they
 * are equal. Please note that this is a **copy** of the list. It does not
 * modify the original.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, a) -> Number) -> [a] -> [a]
 * @param {Function} comparator A sorting function :: a -> b -> Int
 * @param {Array} list The list to sort
 * @return {Array} a new array with its elements sorted by the comparator function.
 * @example
 *
 *      var diff = function(a, b) { return a - b; };
 *      R.sort(diff, [4,2,7,5]); //=> [2, 4, 5, 7]
 */
var sort = /*#__PURE__*/_curry2(function sort(comparator, list) {
  return Array.prototype.slice.call(list, 0).sort(comparator);
});

/**
 * Splits a string into an array of strings based on the given
 * separator.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category String
 * @sig (String | RegExp) -> String -> [String]
 * @param {String|RegExp} sep The pattern.
 * @param {String} str The string to separate into an array.
 * @return {Array} The array of strings from `str` separated by `str`.
 * @see R.join
 * @example
 *
 *      var pathComponents = R.split('/');
 *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
 *
 *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
 */
var split = /*#__PURE__*/invoker(1, 'split');

/**
 * The lower case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to lower case.
 * @return {String} The lower case version of `str`.
 * @see R.toUpper
 * @example
 *
 *      R.toLower('XYZ'); //=> 'xyz'
 */
var toLower = /*#__PURE__*/invoker(0, 'toLowerCase');

/**
 * Converts an object into an array of key, value arrays. Only the object's
 * own properties are used.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.4.0
 * @category Object
 * @sig {String: *} -> [[String,*]]
 * @param {Object} obj The object to extract from
 * @return {Array} An array of key, value arrays from the object's own properties.
 * @see R.fromPairs
 * @example
 *
 *      R.toPairs({a: 1, b: 2, c: 3}); //=> [['a', 1], ['b', 2], ['c', 3]]
 */
var toPairs = /*#__PURE__*/_curry1(function toPairs(obj) {
  var pairs = [];
  for (var prop in obj) {
    if (_has(prop, obj)) {
      pairs[pairs.length] = [prop, obj[prop]];
    }
  }
  return pairs;
});

/**
 * The upper case version of a string.
 *
 * @func
 * @memberOf R
 * @since v0.9.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to upper case.
 * @return {String} The upper case version of `str`.
 * @see R.toLower
 * @example
 *
 *      R.toUpper('abc'); //=> 'ABC'
 */
var toUpper = /*#__PURE__*/invoker(0, 'toUpperCase');

/**
 * Initializes a transducer using supplied iterator function. Returns a single
 * item by iterating through the list, successively calling the transformed
 * iterator function and passing it an accumulator value and the current value
 * from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It will be
 * wrapped as a transformer to initialize the transducer. A transformer can be
 * passed directly in place of an iterator function. In both cases, iteration
 * may be stopped early with the [`R.reduced`](#reduced) function.
 *
 * A transducer is a function that accepts a transformer and returns a
 * transformer and can be composed directly.
 *
 * A transformer is an an object that provides a 2-arity reducing iterator
 * function, step, 0-arity initial value function, init, and 1-arity result
 * extraction function, result. The step function is used as the iterator
 * function in reduce. The result function is used to convert the final
 * accumulator into the return type and in most cases is
 * [`R.identity`](#identity). The init function can be used to provide an
 * initial accumulator, but is ignored by transduce.
 *
 * The iteration is performed with [`R.reduce`](#reduce) after initializing the transducer.
 *
 * @func
 * @memberOf R
 * @since v0.12.0
 * @category List
 * @sig (c -> c) -> ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} xf The transducer function. Receives a transformer and returns a transformer.
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array. Wrapped as transformer, if necessary, and used to
 *        initialize the transducer
 * @param {*} acc The initial accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduce, R.reduced, R.into
 * @example
 *
 *      var numbers = [1, 2, 3, 4];
 *      var transducer = R.compose(R.map(R.add(1)), R.take(2));
 *      R.transduce(transducer, R.flip(R.append), [], numbers); //=> [2, 3]
 *
 *      var isOdd = (x) => x % 2 === 1;
 *      var firstOddTransducer = R.compose(R.filter(isOdd), R.take(1));
 *      R.transduce(firstOddTransducer, R.flip(R.append), [], R.range(0, 100)); //=> [1]
 */
var transduce = /*#__PURE__*/curryN(4, function transduce(xf, fn, acc, list) {
  return _reduce(xf(typeof fn === 'function' ? _xwrap(fn) : fn), acc, list);
});

var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' + '\u2029\uFEFF';
var zeroWidth = '\u200b';
var hasProtoTrim = typeof String.prototype.trim === 'function';
/**
 * Removes (strips) whitespace from both ends of the string.
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category String
 * @sig String -> String
 * @param {String} str The string to trim.
 * @return {String} Trimmed version of `str`.
 * @example
 *
 *      R.trim('   xyz  '); //=> 'xyz'
 *      R.map(R.trim, R.split(',', 'x, y, z')); //=> ['x', 'y', 'z']
 */
var _trim = !hasProtoTrim || /*#__PURE__*/ws.trim() || ! /*#__PURE__*/zeroWidth.trim() ? function trim(str) {
  var beginRx = new RegExp('^[' + ws + '][' + ws + ']*');
  var endRx = new RegExp('[' + ws + '][' + ws + ']*$');
  return str.replace(beginRx, '').replace(endRx, '');
} : function trim(str) {
  return str.trim();
};

/**
 * Combines two lists into a set (i.e. no duplicates) composed of the elements
 * of each list.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} as The first list.
 * @param {Array} bs The second list.
 * @return {Array} The first and second lists concatenated, with
 *         duplicates removed.
 * @example
 *
 *      R.union([1, 2, 3], [2, 3, 4]); //=> [1, 2, 3, 4]
 */
var union = /*#__PURE__*/_curry2( /*#__PURE__*/compose(uniq, _concat));

/**
 * Shorthand for `R.chain(R.identity)`, which removes one level of nesting from
 * any [Chain](https://github.com/fantasyland/fantasy-land#chain).
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category List
 * @sig Chain c => c (c a) -> c a
 * @param {*} list
 * @return {*}
 * @see R.flatten, R.chain
 * @example
 *
 *      R.unnest([1, [2], [[3]]]); //=> [1, 2, [3]]
 *      R.unnest([[1, 2], [3, 4], [5, 6]]); //=> [1, 2, 3, 4, 5, 6]
 */
var unnest = /*#__PURE__*/chain(_identity);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};













var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};







var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

// urlEncode :: Object -> String
var urlEncode = pipe(filter(function (x) {
  return x !== undefined;
}), toPairs, map(function (_ref) {
  var _ref2 = slicedToArray(_ref, 2),
      k = _ref2[0],
      v = _ref2[1];

  return k + '=' + encodeURIComponent(v);
}), join('&'));

// appendQueryParam :: String -> String -> String -> String
var appendQueryParam = function appendQueryParam(key, value, url) {
  var separator = contains$1('?', url) ? '&' : '?';
  return url + separator + urlEncode(defineProperty({}, key, value));
};

var extractQueryParams = function extractQueryParams(url) {
  return contains$1('?', url) ? queryStringToObj(split('?', url)[1]) : {};
};

var queryStringToObj = pipe(split('&'), map(split('=')), fromPairs);

var typeCheck = function typeCheck(name, expectedType, value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  if (type !== expectedType) {
    throw new TypeError('expected ' + name + ' to be of type ' + expectedType + ' but was of type ' + type);
  }
};

// checks that all of an arrays elements are of the given type
var typeCheckArr = function typeCheckArr(name, expectedType, arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('expected ' + name + ' to be an array');
  }
  arr.forEach(function (value, i) {
    return typeCheck(name + '[' + i + ']', expectedType, value);
  });
};

// checks that all of an objects values are of the given type
var typeCheckObj = function typeCheckObj(name, expectedType, obj) {
  typeCheck(name, 'object', obj);
  forEachObjIndexed(function (value, key) {
    return typeCheck(key, expectedType, value);
  }, obj);
};

var checkOneOf = function checkOneOf(name, values, value) {
  if (!contains$1(value, values)) {
    throw new TypeError('expected ' + name + ' to be one of ' + values + ' but was ' + value);
  }
};

var unixSeconds = function unixSeconds() {
  return Math.floor(Date.now() / 1000);
};

// pointfree debugging

var TokenProvider =
// TODO authContext
function TokenProvider() {
  var _this = this;

  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      url = _ref.url;

  classCallCheck(this, TokenProvider);

  this.fetchToken = function () {
    return !_this.cacheIsStale() ? Promise.resolve(_this.cachedToken) : _this.fetchFreshToken().then(function (_ref2) {
      var token = _ref2.token,
          expiresIn = _ref2.expiresIn;

      _this.cache(token, expiresIn);
      return token;
    });
  };

  this.fetchFreshToken = function () {
    return pusherPlatform_4({
      method: 'POST',
      url: appendQueryParam('user_id', _this.userId, _this.url),
      body: urlEncode({ grant_type: 'client_credentials' }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(function (res) {
      var _JSON$parse = JSON.parse(res),
          token = _JSON$parse.access_token,
          expiresIn = _JSON$parse.expires_in;

      return { token: token, expiresIn: expiresIn };
    });
  };

  this.cacheIsStale = function () {
    return !_this.cachedToken || unixSeconds() > _this.cacheExpiresAt;
  };

  this.cache = function (token, expiresIn) {
    _this.cachedToken = token;
    _this.cacheExpiresAt = unixSeconds() + expiresIn;
  };

  this.clearCache = function () {
    _this.cachedToken = undefined;
    _this.cacheExpiresAt = undefined;
  };

  this.setUserId = function (userId) {
    _this.clearCache();
    _this.userId = userId;
  };

  typeCheck('url', 'string', url);
  this.url = url;
};

var parseBasicRoom = function parseBasicRoom(data) {
  return {
    createdAt: data.created_at,
    createdByUserId: data.created_by_id,
    deletedAt: data.deletedAt,
    id: data.id,
    isPrivate: data.private,
    name: data.name,
    updatedAt: data.updated_at,
    userIds: data.member_user_ids
  };
};

var parseUser = function parseUser(data) {
  return {
    avatarURL: data.avatar_url,
    createdAt: data.created_at,
    customData: data.custom_data,
    id: data.id,
    name: data.name,
    updatedAt: data.updated_at
  };
};

var parsePresence = function parsePresence(data) {
  return {
    lastSeenAt: data.last_seen_at,
    state: contains$1(data.state, ['online', 'offline']) ? data.state : 'unknown',
    userId: data.user_id
  };
};

var parseBasicMessage = function parseBasicMessage(data) {
  return {
    id: data.id,
    senderId: data.user_id,
    roomId: data.room_id,
    text: data.text,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    attachment: data.attachment && parseMessageAttachment(data.attachment)
  };
};

var parseFetchedAttachment = function parseFetchedAttachment(data) {
  return {
    file: {
      name: data.file.name,
      bytes: data.file.bytes,
      lastModified: data.file.last_modified
    },
    link: data.resource_link,
    ttl: data.ttl
  };
};

var parseMessageAttachment = function parseMessageAttachment(data) {
  return {
    link: data.resource_link,
    type: data.type,
    fetchRequired: extractQueryParams(data.resource_link).chatkit_link === 'true'
  };
};

var Store = function Store() {
  var _this = this;

  classCallCheck(this, Store);
  this.pendingSets = [];
  this.pendingGets = [];

  this.initialize = function (initialStore) {
    _this.store = clone(initialStore);
    forEach(function (_ref) {
      var key = _ref.key,
          value = _ref.value,
          resolve = _ref.resolve;

      resolve(_this.store[key] = value);
    }, _this.pendingSets);
    forEach(function (_ref2) {
      var key = _ref2.key,
          resolve = _ref2.resolve;

      resolve(_this.store[key]);
    }, _this.pendingGets);
  };

  this.set = function (key, value) {
    if (_this.store) {
      return Promise.resolve(_this.store[key] = value);
    } else {
      return new Promise(function (resolve) {
        _this.pendingSets.push({ key: key, value: value, resolve: resolve });
      });
    }
  };

  this.get = function (key) {
    if (_this.store) {
      return Promise.resolve(_this.store[key]);
    } else {
      return new Promise(function (resolve) {
        _this.pendingGets.push({ key: key, resolve: resolve });
      });
    }
  };

  this.pop = function (key) {
    return _this.get(key).then(function (value) {
      delete _this.store[key];
      return value;
    });
  };

  this.snapshot = function () {
    return _this.store || {};
  };

  this.getSync = function (key) {
    return _this.store ? _this.store[key] : undefined;
  };
};

var UserStore = function UserStore(_ref) {
  var _this = this;

  var instance = _ref.instance,
      presenceStore = _ref.presenceStore,
      logger = _ref.logger;
  classCallCheck(this, UserStore);
  this.store = new Store();
  this.initialize = this.store.initialize;
  this.set = this.store.set;

  this.get = function (userId) {
    return Promise.all([_this.store.get(userId).then(function (user) {
      return user || _this.fetchBasicUser(userId);
    }), _this.presenceStore.get(userId)]).then(function (_ref2) {
      var _ref3 = slicedToArray(_ref2, 2),
          user = _ref3[0],
          presence = _ref3[1];

      return _extends({}, user, { presence: presence });
    });
  };

  this.fetchBasicUser = function (userId) {
    return _this.instance.request({
      method: 'GET',
      path: '/users/' + encodeURIComponent(userId)
    }).then(function (res) {
      var user = parseUser(JSON.parse(res));
      _this.set(userId, user);
      return user;
    }).catch(function (err) {
      _this.logger.warn('error fetching user information:', err);
      throw err;
    });
  };

  this.fetchMissingUsers = function (userIds) {
    var missing = difference(userIds, map(prop('id'), values(_this.store.snapshot())));
    if (length(missing) === 0) {
      return Promise.resolve();
    }
    // TODO don't make simulatneous requests for the same users (question: what
    // will actually cause this situation to arise? Receiving lots of messages
    // in a room from a user who is no longer a member of said room?)
    return _this.instance.request({
      method: 'GET',
      path: appendQueryParam('user_ids', join(',', missing), '/users_by_ids')
    }).then(pipe(JSON.parse, map(parseUser), forEach(function (user) {
      return _this.set(user.id, user);
    }))).catch(function (err) {
      _this.logger.warn('error fetching missing users:', err);
      throw err;
    });
  };

  this.snapshot = function () {
    return map(_this.decorate, _this.store.snapshot());
  };

  this.getSync = function (userId) {
    return _this.decorate(_this.store.getSync(userId));
  };

  this.decorate = function (user) {
    return user ? _extends({}, user, { presence: _this.presenceStore.getSync(user.id) }) : undefined;
  };

  this.instance = instance;
  this.presenceStore = presenceStore;
  this.logger = logger;
};

var Room = function () {
  function Room(basicRoom, userStore) {
    classCallCheck(this, Room);

    this.createdAt = basicRoom.createdAt;
    this.createdByUserId = basicRoom.createdByUserId;
    this.deletedAt = basicRoom.deletedAt;
    this.id = basicRoom.id;
    this.isPrivate = basicRoom.isPrivate;
    this.name = basicRoom.name;
    this.updatedAt = basicRoom.updatedAt;
    this.userIds = basicRoom.userIds;
    this.userStore = userStore;
  }

  createClass(Room, [{
    key: 'users',
    get: function get$$1() {
      var _this = this;

      return filter(function (user) {
        return contains$1(user.id, _this.userIds);
      }, values(this.userStore.snapshot()));
    }
  }]);
  return Room;
}();

var RoomStore = function RoomStore(_ref) {
  var _this = this;

  var instance = _ref.instance,
      userStore = _ref.userStore,
      logger = _ref.logger;
  classCallCheck(this, RoomStore);
  this.store = new Store();
  this.initialize = this.store.initialize;
  this.set = curry(function (roomId, basicRoom) {
    return _this.store.set(roomId, basicRoom).then(_this.decorate).then(function (room) {
      return _this.userStore.fetchMissingUsers(room.userIds).then(function () {
        return room;
      });
    });
  });

  this.get = function (roomId) {
    return _this.store.get(roomId).then(function (basicRoom) {
      return basicRoom || _this.fetchBasicRoom(roomId).then(_this.set(roomId));
    }).then(_this.decorate);
  };

  this.pop = function (roomId) {
    return _this.store.pop(roomId).then(function (basicRoom) {
      return basicRoom || _this.fetchBasicRoom(roomId);
    }).then(_this.decorate);
  };

  this.addUserToRoom = function (roomId, userId) {
    return _this.pop(roomId).then(function (r) {
      return _this.set(roomId, _extends({}, r, { userIds: uniq(append(userId, r.userIds)) }));
    });
  };

  this.removeUserFromRoom = function (roomId, userId) {
    return _this.pop(roomId).then(function (r) {
      return _this.set(roomId, _extends({}, r, { userIds: filter(function (id) {
          return id !== userId;
        }, r.userIds) }));
    });
  };

  this.update = function (roomId, updates) {
    return _this.store.pop(roomId).then(function (r) {
      return _this.set(roomId, mergeWith(function (x, y) {
        return y || x;
      }, r, updates));
    });
  };

  this.fetchBasicRoom = function (roomId) {
    return _this.instance.request({
      method: 'GET',
      path: '/rooms/' + roomId
    }).then(pipe(JSON.parse, parseBasicRoom)).catch(function (err) {
      _this.logger.warn('error fetching details for room ' + roomId + ':', err);
    });
  };

  this.snapshot = function () {
    return map(_this.decorate, _this.store.snapshot());
  };

  this.getSync = function (roomId) {
    return _this.decorate(_this.store.getSync(roomId));
  };

  this.decorate = function (basicRoom) {
    return basicRoom ? new Room(basicRoom, _this.userStore) : undefined;
  };

  this.instance = instance;
  this.userStore = userStore;
  this.logger = logger;
};

var TYPING_INDICATOR_TTL = 1500;
var TYPING_INDICATOR_LEEWAY = 500;

var TypingIndicators = function TypingIndicators(_ref) {
  var _this = this;

  var userId = _ref.userId,
      instance = _ref.instance,
      logger = _ref.logger;
  classCallCheck(this, TypingIndicators);

  this.sendThrottledRequest = function (roomId) {
    var now = Date.now();
    var sent = _this.lastSentRequests[roomId];
    if (sent && now - sent < TYPING_INDICATOR_TTL - TYPING_INDICATOR_LEEWAY) {
      return Promise.resolve();
    }
    _this.lastSentRequests[roomId] = now;
    return _this.instance.request({
      method: 'POST',
      path: '/rooms/' + roomId + '/events',
      json: {
        name: 'typing_start', // soon to be 'is_typing'
        user_id: _this.userId
      }
    }).catch(function (err) {
      delete _this.typingRequestSent[roomId];
      _this.logger.warn('Error sending is_typing event in room ' + roomId, err);
      throw err;
    });
  };

  this.onIsTyping = function (room, user, hooks, roomHooks) {
    if (!_this.timers[room.id]) {
      _this.timers[room.id] = {};
    }
    if (_this.timers[room.id][user.id]) {
      clearTimeout(_this.timers[room.id][user.id]);
    } else {
      _this.onStarted(room, user, hooks, roomHooks);
    }
    _this.timers[room.id][user.id] = setTimeout(function () {
      _this.onStopped(room, user, hooks, roomHooks);
      delete _this.timers[room.id][user.id];
    }, TYPING_INDICATOR_TTL);
  };

  this.onStarted = function (room, user, hooks, roomHooks) {
    if (hooks.userStartedTyping) {
      hooks.userStartedTyping(room, user);
    }
    if (roomHooks[room.id] && roomHooks[room.id].userStartedTyping) {
      roomHooks[room.id].userStartedTyping(user);
    }
  };

  this.onStopped = function (room, user, hooks, roomHooks) {
    if (hooks.userStoppedTyping) {
      hooks.userStoppedTyping(room, user);
    }
    if (roomHooks[room.id] && roomHooks[room.id].userStoppedTyping) {
      roomHooks[room.id].userStoppedTyping(user);
    }
  };

  this.userId = userId;
  this.instance = instance;
  this.logger = logger;
  this.lastSentRequests = {};
  this.timers = {};
};

var UserSubscription = function () {
  function UserSubscription(options) {
    var _this = this;

    classCallCheck(this, UserSubscription);

    this.onEvent = function (_ref) {
      var body = _ref.body;

      switch (body.event_name) {
        case 'initial_state':
          _this.onInitialState(body.data);
          break;
        case 'added_to_room':
          _this.onAddedToRoom(body.data);
          break;
        case 'removed_from_room':
          _this.onRemovedFromRoom(body.data);
          break;
        case 'user_joined':
          _this.onUserJoined(body.data);
          break;
        case 'user_left':
          _this.onUserLeft(body.data);
          break;
        case 'room_updated':
          _this.onRoomUpdated(body.data);
          break;
        case 'room_deleted':
          _this.onRoomDeleted(body.data);
          break;
        case 'typing_start':
          // soon to be 'is_typing'
          _this.onIsTyping(body.data);
          break;
      }
    };

    this.onInitialState = function (_ref2) {
      var userData = _ref2.current_user,
          roomsData = _ref2.rooms;

      _this.hooks.subscriptionEstablished({
        user: parseUser(userData),
        basicRooms: map(parseBasicRoom, roomsData)
      });
    };

    this.onAddedToRoom = function (_ref3) {
      var roomData = _ref3.room;

      var basicRoom = parseBasicRoom(roomData);
      _this.roomStore.set(basicRoom.id, basicRoom).then(function (room) {
        if (_this.hooks.addedToRoom) {
          _this.hooks.addedToRoom(room);
        }
      });
    };

    this.onRemovedFromRoom = function (_ref4) {
      var roomId = _ref4.room_id;

      _this.roomStore.pop(roomId).then(function (room) {
        // room will be undefined if we left with leaveRoom
        if (room && _this.hooks.removedFromRoom) {
          _this.hooks.removedFromRoom(room);
        }
      });
    };

    this.onUserJoined = function (_ref5) {
      var roomId = _ref5.room_id,
          userId = _ref5.user_id;

      _this.roomStore.addUserToRoom(roomId, userId).then(function (room) {
        _this.userStore.get(userId).then(function (user) {
          if (_this.hooks.userJoinedRoom) {
            _this.hooks.userJoinedRoom(room, user);
          }
          if (_this.roomSubscriptions[roomId] && _this.roomSubscriptions[roomId].hooks.userJoined) {
            _this.roomSubscriptions[roomId].hooks.userJoined(user);
          }
        });
      });
    };

    this.onUserLeft = function (_ref6) {
      var roomId = _ref6.room_id,
          userId = _ref6.user_id;

      _this.roomStore.removeUserFromRoom(roomId, userId).then(function (room) {
        _this.userStore.get(userId).then(function (user) {
          if (_this.hooks.userLeftRoom) {
            _this.hooks.userLeftRoom(room, user);
          }
          if (_this.roomSubscriptions[roomId] && _this.roomSubscriptions[roomId].hooks.userLeft) {
            _this.roomSubscriptions[roomId].hooks.userLeft(user);
          }
        });
      });
    };

    this.onRoomUpdated = function (_ref7) {
      var roomData = _ref7.room;

      var updates = parseBasicRoom(roomData);
      _this.roomStore.update(updates.id, updates).then(function (room) {
        if (_this.hooks.roomUpdated) {
          _this.hooks.roomUpdated(room);
        }
      });
    };

    this.onRoomDeleted = function (_ref8) {
      var roomId = _ref8.room_id;

      _this.roomStore.pop(roomId).then(function (room) {
        if (room && _this.hooks.roomDeleted) {
          _this.hooks.roomDeleted(room);
        }
      });
    };

    this.onIsTyping = function (_ref9) {
      var roomId = _ref9.room_id,
          userId = _ref9.user_id;

      Promise.all([_this.roomStore.get(roomId), _this.userStore.get(userId)]).then(function (_ref10) {
        var _ref11 = slicedToArray(_ref10, 2),
            room = _ref11[0],
            user = _ref11[1];

        return _this.typingIndicators.onIsTyping(room, user, _this.hooks, map(prop('hooks'), _this.roomSubscriptions));
      });
    };

    this.userId = options.userId;
    this.hooks = options.hooks;
    this.instance = options.instance;
    this.userStore = options.userStore;
    this.roomStore = options.roomStore;
    this.typingIndicators = options.typingIndicators;
    this.roomSubscriptions = options.roomSubscriptions;
  }

  createClass(UserSubscription, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.hooks = _extends({}, _this2.hooks, { subscriptionEstablished: resolve });
        _this2.instance.subscribeNonResuming({
          path: '/users',
          listeners: {
            onError: reject,
            onEvent: _this2.onEvent
          }
        });
      });
    }
  }]);
  return UserSubscription;
}();

var PresenceSubscription = function () {
  function PresenceSubscription(options) {
    var _this = this;

    classCallCheck(this, PresenceSubscription);

    this.onEvent = function (_ref) {
      var body = _ref.body;

      switch (body.event_name) {
        case 'initial_state':
          _this.onInitialState(body.data);
          break;
        case 'presence_update':
          _this.onPresenceUpdate(body.data);
          break;
        case 'join_room_presence_update':
          _this.onJoinRoomPresenceUpdate(body.data);
          break;
      }
    };

    this.onInitialState = function (_ref2) {
      var userStates = _ref2.user_states;

      _this.presenceStore.initialize(indexBy(prop('userId'), map(parsePresence, userStates)));
      _this.hooks.subscriptionEstablished();
    };

    this.onPresenceUpdate = function (data) {
      var presence = parsePresence(data);
      _this.presenceStore.set(presence.userId, presence).then(function (p) {
        return _this.userStore.get(p.userId).then(function (user) {
          switch (p.state) {
            case 'online':
              _this.onCameOnline(user);
              break;
            case 'offline':
              _this.onWentOffline(user);
              break;
          }
        });
      });
    };

    this.onJoinRoomPresenceUpdate = function (_ref3) {
      var userStates = _ref3.user_states;
      return forEach(function (presence) {
        return _this.presenceStore.set(presence.userId, presence);
      }, map(parsePresence, userStates));
    };

    this.onCameOnline = function (user) {
      return _this.callRelevantHooks('userCameOnline', user);
    };

    this.onWentOffline = function (user) {
      return _this.callRelevantHooks('userWentOffline', user);
    };

    this.callRelevantHooks = function (hookName, user) {
      if (_this.hooks[hookName]) {
        _this.hooks[hookName](user);
      }
      compose(forEach(function (sub) {
        return _this.roomStore.get(sub.roomId).then(function (room) {
          if (contains$1(user.id, room.userIds)) {
            sub.hooks[hookName](user);
          }
        });
      }), filter(function (sub) {
        return sub.hooks[hookName] !== undefined;
      }), values)(_this.roomSubscriptions);
    };

    this.userId = options.userId;
    this.hooks = options.hooks;
    this.instance = options.instance;
    this.userStore = options.userStore;
    this.roomStore = options.roomStore;
    this.presenceStore = options.presenceStore;
    this.roomSubscriptions = options.roomSubscriptions;
  }

  createClass(PresenceSubscription, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.hooks = _extends({}, _this2.hooks, { subscriptionEstablished: resolve });
        _this2.instance.subscribeNonResuming({
          path: '/users/' + encodeURIComponent(_this2.userId) + '/presence',
          listeners: {
            onError: reject,
            onEvent: _this2.onEvent
          }
        });
      });
    }
  }]);
  return PresenceSubscription;
}();

var Message = function () {
  function Message(basicMessage, userStore, roomStore) {
    classCallCheck(this, Message);

    this.id = basicMessage.id;
    this.senderId = basicMessage.senderId;
    this.roomId = basicMessage.roomId;
    this.text = basicMessage.text;
    this.attachment = basicMessage.attachment;
    this.createdAt = basicMessage.createdAt;
    this.updatedAt = basicMessage.updatedAt;
    this.userStore = userStore;
    this.roomStore = roomStore;
  }

  createClass(Message, [{
    key: "sender",
    get: function get$$1() {
      return this.userStore.getSync(this.senderId);
    }
  }, {
    key: "room",
    get: function get$$1() {
      return this.roomStore.getSync(this.roomId);
    }
  }]);
  return Message;
}();

var RoomSubscription = function () {
  function RoomSubscription(options) {
    var _this = this;

    classCallCheck(this, RoomSubscription);

    this.onEvent = function (_ref) {
      var body = _ref.body;

      switch (body.event_name) {
        case 'new_message':
          _this.onNewMessage(body.data);
          break;
      }
    };

    this.onNewMessage = function (data) {
      var pending = {
        message: new Message(parseBasicMessage(data), _this.userStore, _this.roomStore),
        ready: false
      };
      _this.messageBuffer.push(pending);
      _this.userStore.fetchMissingUsers([pending.message.senderId]).catch(function (err) {
        _this.logger.error('error fetching missing user information:', err);
      }).then(function () {
        pending.ready = true;
        _this.flushBuffer();
      });
    };

    this.flushBuffer = function () {
      while (!isEmpty(_this.messageBuffer) && head(_this.messageBuffer).ready) {
        var message = _this.messageBuffer.shift().message;
        if (_this.hooks.newMessage) {
          _this.hooks.newMessage(message);
        }
      }
    };

    this.roomId = options.roomId;
    this.hooks = options.hooks;
    this.messageLimit = options.messageLimit;
    this.userId = options.userId;
    this.instance = options.instance;
    this.userStore = options.userStore;
    this.roomStore = options.roomStore;
    this.messageBuffer = []; // { message, ready }
  }

  createClass(RoomSubscription, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.instance.subscribeNonResuming({
          path: '/rooms/' + _this2.roomId + '?' + urlEncode({
            message_limit: _this2.messageLimit
          }),
          listeners: {
            onOpen: resolve,
            onError: reject,
            onEvent: _this2.onEvent
          }
        });
      });
    }
  }]);
  return RoomSubscription;
}();

var CurrentUser = function () {
  function CurrentUser(_ref) {
    var _this = this;

    var id = _ref.id,
        apiInstance = _ref.apiInstance,
        filesInstance = _ref.filesInstance;
    classCallCheck(this, CurrentUser);

    this.isTypingIn = function (roomId) {
      typeCheck('roomId', 'number', roomId);
      return _this.typingIndicators.sendThrottledRequest(roomId);
    };

    this.createRoom = function () {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var name = _ref2.name,
          addUserIds = _ref2.addUserIds,
          rest = objectWithoutProperties(_ref2, ['name', 'addUserIds']);

      name && typeCheck('name', 'string', name);
      addUserIds && typeCheckArr('addUserIds', 'string', addUserIds);
      return _this.apiInstance.request({
        method: 'POST',
        path: '/rooms',
        json: {
          created_by_id: _this.id,
          name: name,
          private: !!rest.private, // private is a reserved word in strict mode!
          user_ids: addUserIds
        }
      }).then(function (res) {
        var basicRoom = parseBasicRoom(JSON.parse(res));
        return _this.roomStore.set(basicRoom.id, basicRoom);
      }).catch(function (err) {
        _this.logger.warn('error creating room:', err);
        throw err;
      });
    };

    this.getJoinableRooms = function () {
      return _this.apiInstance.request({
        method: 'GET',
        path: '/users/' + _this.encodedId + '/rooms?joinable=true'
      }).then(pipe(JSON.parse, map(parseBasicRoom))).catch(function (err) {
        _this.logger.warn('error getting joinable rooms:', err);
        throw err;
      });
    };

    this.getAllRooms = function () {
      return _this.getJoinableRooms().then(concat(_this.rooms));
    };

    this.joinRoom = function (roomId) {
      typeCheck('roomId', 'number', roomId);
      if (_this.isMemberOf(roomId)) {
        return _this.roomStore.get(roomId);
      }
      return _this.apiInstance.request({
        method: 'POST',
        path: '/users/' + _this.encodedId + '/rooms/' + roomId + '/join'
      }).then(function (res) {
        var basicRoom = parseBasicRoom(JSON.parse(res));
        return _this.roomStore.set(basicRoom.id, basicRoom);
      }).catch(function (err) {
        _this.logger.warn('error joining room ' + roomId + ':', err);
        throw err;
      });
    };

    this.leaveRoom = function (roomId) {
      typeCheck('roomId', 'number', roomId);
      return _this.apiInstance.request({
        method: 'POST',
        path: '/users/' + _this.encodedId + '/rooms/' + roomId + '/leave'
      }).then(function () {
        return _this.roomStore.pop(roomId);
      }).catch(function (err) {
        _this.logger.warn('error leaving room ' + roomId + ':', err);
        throw err;
      });
    };

    this.addUser = function (userId, roomId) {
      typeCheck('userId', 'string', userId);
      typeCheck('roomId', 'number', roomId);
      return _this.apiInstance.request({
        method: 'PUT',
        path: '/rooms/' + roomId + '/users/add',
        json: {
          user_ids: [userId]
        }
      }).then(function () {
        return _this.roomStore.addUserToRoom(roomId, userId);
      }).catch(function (err) {
        _this.logger.warn('error adding user ' + userId + ' to room ' + roomId + ':', err);
        throw err;
      });
    };

    this.removeUser = function (userId, roomId) {
      typeCheck('userId', 'string', userId);
      typeCheck('roomId', 'number', roomId);
      return _this.apiInstance.request({
        method: 'PUT',
        path: '/rooms/' + roomId + '/users/remove',
        json: {
          user_ids: [userId]
        }
      }).then(function () {
        return _this.roomStore.removeUserFromRoom(roomId, userId);
      }).catch(function (err) {
        _this.logger.warn('error removing user ' + userId + ' from room ' + roomId + ':', err);
        throw err;
      });
    };

    this.sendMessage = function (_ref3) {
      var text = _ref3.text,
          roomId = _ref3.roomId,
          attachment = _ref3.attachment;

      typeCheck('text', 'string', text);
      typeCheck('roomId', 'number', roomId);
      return new Promise(function (resolve, reject) {
        if (attachment !== undefined && isDataAttachment(attachment)) {
          resolve(_this.uploadDataAttachment(roomId, attachment));
        } else if (attachment !== undefined && isLinkAttachment(attachment)) {
          resolve({ resource_link: attachment.link, type: attachment.type });
        } else if (attachment !== undefined) {
          reject(new TypeError('attachment was malformed'));
        } else {
          resolve();
        }
      }).then(function (attachment) {
        return _this.apiInstance.request({
          method: 'POST',
          path: '/rooms/' + roomId + '/messages',
          json: { text: text, attachment: attachment }
        });
      }).then(pipe(JSON.parse, prop('message_id'))).catch(function (err) {
        _this.logger.warn('error sending message to room ' + roomId + ':', err);
        throw err;
      });
    };

    this.fetchMessages = function (roomId) {
      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          initialId = _ref4.initialId,
          limit = _ref4.limit,
          direction = _ref4.direction;

      typeCheck('roomId', 'number', roomId);
      initialId && typeCheck('initialId', 'number', initialId);
      limit && typeCheck('limit', 'number', limit);
      direction && checkOneOf('direction', ['older', 'newer'], direction);
      return _this.apiInstance.request({
        method: 'GET',
        path: '/rooms/' + roomId + '/messages?' + urlEncode({
          initial_id: initialId,
          limit: limit,
          direction: direction
        })
      }).then(function (res) {
        var messages = map(compose(_this.decorateMessage, parseBasicMessage), JSON.parse(res));
        return _this.userStore.fetchMissingUsers(uniq(map(prop('senderId'), messages))).then(function () {
          return sort(function (x, y) {
            return x.id - y.id;
          }, messages);
        });
      }).catch(function (err) {
        _this.logger.warn('error fetching messages from room ' + roomId + ':', err);
        throw err;
      });
    };

    this.subscribeToRoom = function (roomId) {
      var hooks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var messageLimit = arguments[2];

      typeCheck('roomId', 'number', roomId);
      typeCheckObj('hooks', 'function', hooks);
      messageLimit && typeCheck('messageLimit', 'number', messageLimit);
      // TODO what is the desired behaviour if there is already a subscription to
      // this room? Close the old one? Throw an error? Merge the hooks?
      _this.roomSubscriptions[roomId] = new RoomSubscription({
        roomId: roomId,
        hooks: hooks,
        messageLimit: messageLimit,
        userId: _this.id,
        instance: _this.apiInstance,
        userStore: _this.userStore,
        roomStore: _this.roomStore,
        logger: _this.logger
      });
      return _this.joinRoom(roomId).then(function (room) {
        return _this.roomSubscriptions[roomId].connect().then(function () {
          return room;
        });
      }).catch(function (err) {
        _this.logger.warn('error subscribing to room ' + roomId + ':', err);
        throw err;
      });
    };

    this.fetchAttachment = function (url) {
      return _this.filesInstance.tokenProvider.fetchToken().then(function (token) {
        return pusherPlatform_4({
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
          url: url
        });
      }).then(pipe(JSON.parse, parseFetchedAttachment)).catch(function (err) {
        _this.logger.warn('error fetching attachment:', err);
        throw err;
      });
    };

    this.uploadDataAttachment = function (roomId, _ref5) {
      var file = _ref5.file,
          name = _ref5.name;

      // TODO some validation on allowed file names?
      // TODO polyfill FormData?
      var body = new FormData(); // eslint-disable-line no-undef
      body.append('file', file, name);
      return _this.filesInstance.request({
        method: 'POST',
        path: '/rooms/' + roomId + '/files/' + name,
        body: body
      }).then(JSON.parse);
    };

    this.isMemberOf = function (roomId) {
      return contains$1(roomId, map(prop('id'), _this.rooms));
    };

    this.decorateMessage = function (basicMessage) {
      return new Message(basicMessage, _this.userStore, _this.roomStore);
    };

    this.establishUserSubscription = function (hooks) {
      _this.userSubscription = new UserSubscription({
        hooks: hooks,
        userId: _this.id,
        instance: _this.apiInstance,
        userStore: _this.userStore,
        roomStore: _this.roomStore,
        typingIndicators: _this.typingIndicators,
        roomSubscriptions: _this.roomSubscriptions
      });
      return _this.userSubscription.connect().then(function (_ref6) {
        var user = _ref6.user,
            basicRooms = _ref6.basicRooms;

        _this.avatarURL = user.avatarURL;
        _this.createdAt = user.createdAt;
        _this.customData = user.customData;
        _this.name = user.name;
        _this.updatedAt = user.updatedAt;
        _this.roomStore.initialize(indexBy(prop('id'), basicRooms));
      }).then(_this.initializeUserStore);
    };

    this.establishPresenceSubscription = function (hooks) {
      _this.presenceSubscription = new PresenceSubscription({
        hooks: hooks,
        userId: _this.id,
        instance: _this.apiInstance,
        userStore: _this.userStore,
        roomStore: _this.roomStore,
        presenceStore: _this.presenceStore,
        roomSubscriptions: _this.roomSubscriptions
      });
      return _this.presenceSubscription.connect();
    };

    this.initializeUserStore = function () {
      return _this.userStore.fetchMissingUsers(uniq(chain(prop('userIds'), _this.rooms))).catch(function (err) {
        _this.logger.warn('error fetching initial user information:', err);
      }).then(function () {
        _this.userStore.initialize({});
      });
    };

    this.id = id;
    this.encodedId = encodeURIComponent(this.id);
    this.apiInstance = apiInstance;
    this.filesInstance = filesInstance;
    this.logger = apiInstance.logger;
    this.presenceStore = new Store();
    this.userStore = new UserStore({
      instance: this.apiInstance,
      presenceStore: this.presenceStore,
      logger: this.logger
    });
    this.roomStore = new RoomStore({
      instance: this.apiInstance,
      userStore: this.userStore,
      logger: this.logger
    });
    this.typingIndicators = new TypingIndicators({
      userId: this.id,
      instance: this.apiInstance,
      logger: this.logger
    });
    this.roomSubscriptions = {};
  }

  /* public */

  createClass(CurrentUser, [{
    key: 'rooms',
    get: function get$$1() {
      return values(this.roomStore.snapshot());
    }
  }, {
    key: 'users',
    get: function get$$1() {
      return values(this.userStore.snapshot());
    }

    /* internal */

  }]);
  return CurrentUser;
}();

var isDataAttachment = function isDataAttachment(_ref7) {
  var file = _ref7.file,
      name = _ref7.name;

  if (file === undefined || name === undefined) {
    return false;
  }
  typeCheck('attachment.file', 'object', file);
  typeCheck('attachment.name', 'string', name);
  return true;
};

var isLinkAttachment = function isLinkAttachment(_ref8) {
  var link = _ref8.link,
      type = _ref8.type;

  if (link === undefined || type === undefined) {
    return false;
  }
  typeCheck('attachment.link', 'string', link);
  typeCheck('attachment.type', 'string', type);
  return true;
};

var ChatManager = function ChatManager() {
  var _this = this;

  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var instanceLocator = _ref.instanceLocator,
      tokenProvider = _ref.tokenProvider,
      userId = _ref.userId,
      options = objectWithoutProperties(_ref, ['instanceLocator', 'tokenProvider', 'userId']);
  classCallCheck(this, ChatManager);

  this.connect = function () {
    var hooks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    typeCheckObj('hooks', 'function', hooks);
    var currentUser = new CurrentUser({
      id: _this.userId,
      apiInstance: _this.apiInstance,
      filesInstance: _this.filesInstance
    });
    return Promise.all([currentUser.establishUserSubscription(hooks), currentUser.establishPresenceSubscription(hooks)
    // currentUser.initializeCursorStore()
    ]).then(function () {
      return currentUser;
    });
  };

  typeCheck('instanceLocator', 'string', instanceLocator);
  typeCheck('tokenProvider', 'object', tokenProvider);
  typeCheck('tokenProvider.fetchToken', 'function', tokenProvider.fetchToken);
  typeCheck('userId', 'string', userId);
  var cluster = split(':', instanceLocator)[1];
  if (cluster === undefined) {
    throw new TypeError('expected instanceLocator to be of the format x:y:z, but was ' + instanceLocator);
  }
  var baseClient = options.baseClient || new pusherPlatform_1({
    host: cluster + '.' + pusherPlatform_2,
    logger: options.logger
  });
  if (typeof tokenProvider.setUserId === 'function') {
    tokenProvider.setUserId(userId);
  }
  var instanceOptions = {
    client: baseClient,
    locator: instanceLocator,
    logger: options.logger,
    tokenProvider: tokenProvider
  };
  this.apiInstance = new pusherPlatform_3(_extends({
    serviceName: 'chatkit',
    serviceVersion: 'v1'
  }, instanceOptions));
  this.filesInstance = new pusherPlatform_3(_extends({
    serviceName: 'chatkit_files',
    serviceVersion: 'v1'
  }, instanceOptions));
  this.cursorsInstance = new pusherPlatform_3(_extends({
    serviceName: 'chatkit_cursors',
    serviceVersion: 'v1'
  }, instanceOptions));
  this.userId = userId;
};

var main = { TokenProvider: TokenProvider, ChatManager: ChatManager };

return main;

})));
