(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Chatkit"] = factory();
	else
		root["Chatkit"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var current_user_1 = __webpack_require__(10);
var presence_state_1 = __webpack_require__(4);
var room_1 = __webpack_require__(17);
var user_1 = __webpack_require__(19);
var utils_1 = __webpack_require__(1);
var checkPresenceAndTypeOfFieldsInPayload = function (requiredFieldsWithTypes, payload) {
    Object.keys(requiredFieldsWithTypes).forEach(function (key) {
        if (payload[key] === undefined) {
            throw new Error("Payload missing key: " + key);
        }
        var receivedType = typeof payload[key];
        var expectedType = requiredFieldsWithTypes[key];
        if (receivedType !== expectedType) {
            throw new Error("Value for key: " + key + " in payload was " + receivedType + ", expected " + expectedType);
        }
    });
};
var PayloadDeserializer = (function () {
    function PayloadDeserializer() {
    }
    PayloadDeserializer.createUserFromPayload = function (userPayload) {
        var basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);
        return new user_1.default({
            avatarURL: userPayload.avatar_url,
            createdAt: basicUser.createdAt,
            customData: userPayload.custom_data,
            id: basicUser.id,
            name: userPayload.name,
            updatedAt: basicUser.updatedAt,
        });
    };
    PayloadDeserializer.createCurrentUserFromPayload = function (userPayload, apiInstance, filesInstance, cursorsInstance, userStore) {
        var basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);
        return new current_user_1.default({
            apiInstance: apiInstance,
            avatarURL: userPayload.avatar_url,
            createdAt: basicUser.createdAt,
            cursorsInstance: cursorsInstance,
            customData: userPayload.custom_data,
            filesInstance: filesInstance,
            id: basicUser.id,
            name: userPayload.name,
            updatedAt: basicUser.updatedAt,
            userStore: userStore,
        });
    };
    PayloadDeserializer.createRoomFromPayload = function (roomPayload) {
        var requiredFieldsWithTypes = {
            created_at: 'string',
            created_by_id: 'string',
            id: 'number',
            name: 'string',
            private: 'boolean',
            updated_at: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, roomPayload);
        var memberUserIds = [];
        if (roomPayload.member_user_ids) {
            memberUserIds = roomPayload.member_user_ids;
        }
        return new room_1.default({
            createdAt: roomPayload.created_at,
            createdByUserId: roomPayload.created_by_id,
            deletedAt: roomPayload.deleted_at,
            id: roomPayload.id,
            isPrivate: roomPayload.private,
            name: roomPayload.name,
            updatedAt: roomPayload.updated_at,
            userIds: memberUserIds,
        });
    };
    PayloadDeserializer.createBasicMessageFromPayload = function (messagePayload) {
        var requiredFieldsWithTypes = {
            created_at: 'string',
            id: 'number',
            room_id: 'number',
            text: 'string',
            updated_at: 'string',
            user_id: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, messagePayload);
        var attachment = this.createAttachmentFromPayload(messagePayload.attachment);
        return {
            attachment: attachment,
            createdAt: messagePayload.created_at,
            id: messagePayload.id,
            roomId: messagePayload.room_id,
            senderId: messagePayload.user_id,
            text: messagePayload.text,
            updatedAt: messagePayload.updated_at,
        };
    };
    PayloadDeserializer.createBasicCursorFromPayload = function (payload) {
        var requiredFieldsWithTypes = {
            cursor_type: 'number',
            position: 'number',
            room_id: 'number',
            updated_at: 'string',
            user_id: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, payload);
        return {
            cursorType: payload.cursor_type,
            position: payload.position,
            roomId: payload.room_id,
            updatedAt: payload.updated_at,
            userId: payload.user_id,
        };
    };
    PayloadDeserializer.createPresencePayloadFromPayload = function (payload) {
        var requiredFieldsWithTypes = {
            state: 'string',
            user_id: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, payload);
        var state = new presence_state_1.default(payload.state);
        return {
            lastSeenAt: payload.last_seen_at,
            state: state,
            userId: payload.user_id,
        };
    };
    PayloadDeserializer.createBasicUserFromPayload = function (payload) {
        var requiredFieldsWithTypes = {
            created_at: 'string',
            id: 'string',
            updated_at: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, payload);
        return {
            createdAt: payload.created_at,
            id: payload.id,
            updatedAt: payload.updated_at,
        };
    };
    PayloadDeserializer.createAttachmentFromPayload = function (payload) {
        if (payload === undefined) {
            return undefined;
        }
        var requiredFieldsWithTypes = {
            resource_link: 'string',
            type: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, payload);
        var linkQueryParams = utils_1.queryParamsFromFullUrl(payload.resource_link);
        var fetchRequired = linkQueryParams.chatkit_link !== undefined &&
            linkQueryParams.chatkit_link === 'true';
        return {
            fetchRequired: fetchRequired,
            link: payload.resource_link,
            type: payload.type,
        };
    };
    PayloadDeserializer.createFetchedAttachmentFromPayload = function (payload) {
        if (payload === undefined) {
            return undefined;
        }
        var requiredFieldsWithTypes = {
            file: 'object',
            resource_link: 'string',
            ttl: 'number',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypes, payload);
        var requiredFieldsWithTypesForFileField = {
            bytes: 'number',
            last_modified: 'number',
            name: 'string',
        };
        checkPresenceAndTypeOfFieldsInPayload(requiredFieldsWithTypesForFileField, payload.file);
        var file = payload.file;
        var bytes = file.bytes, name = file.name;
        return {
            file: {
                bytes: bytes,
                lastModified: file.last_modified,
                name: name,
            },
            link: payload.resource_link,
            ttl: payload.ttl,
        };
    };
    return PayloadDeserializer;
}());
exports.default = PayloadDeserializer;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function urlEncode(data) {
    return Object.keys(data)
        .filter(function (key) { return data[key] !== undefined; })
        .map(function (key) { return key + "=" + encodeURIComponent(data[key]); })
        .join('&');
}
exports.urlEncode = urlEncode;
function queryString(data) {
    var encodedData = urlEncode(data);
    return encodedData ? "?" + encodedData : '';
}
exports.queryString = queryString;
function queryParamsFromFullUrl(url) {
    if (url.indexOf('?') === -1) {
        return {};
    }
    var splitUrl = url.split('?');
    var queryStr = splitUrl.slice(1).join('&');
    return queryParamObject(queryStr);
}
exports.queryParamsFromFullUrl = queryParamsFromFullUrl;
function querylessUrlAndQueryObjectFromFullUrl(urlString) {
    if (urlString.indexOf('?') === -1) {
        return {
            queryObject: {},
            querylessUrl: urlString,
        };
    }
    var splitUrl = urlString.split('?');
    var querylessUrl = splitUrl[0];
    var queryStr = splitUrl.slice(1).join('&');
    return {
        queryObject: queryParamObject(queryStr),
        querylessUrl: querylessUrl,
    };
}
function queryParamObject(queryParamString) {
    return queryParamString
        .split('&')
        .map(function (str) {
        var _a = str.split('='), key = _a[0], value = _a[1];
        return _b = {}, _b[key] = decodeURI(value), _b;
        var _b;
    })
        .reduce(function (prev, curr) { return Object.assign(prev, curr); });
}
function mergeQueryParamsIntoUrl(urlString, queryParams) {
    var _a = querylessUrlAndQueryObjectFromFullUrl(urlString), querylessUrl = _a.querylessUrl, queryObject = _a.queryObject;
    var fullQueryString = queryString(Object.assign(queryObject, queryParams));
    return "" + querylessUrl + fullQueryString;
}
exports.mergeQueryParamsIntoUrl = mergeQueryParamsIntoUrl;
function allPromisesSettled(promises) {
    return Promise.all(promises.map(function (p) {
        return Promise.resolve(p).then(function (v) { return ({
            state: 'fulfilled',
            value: v,
        }); }, function (r) { return ({
            reason: r,
            state: 'rejected',
        }); });
    }));
}
exports.allPromisesSettled = allPromisesSettled;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["PusherPlatform"] = factory();
	else
		root["PusherPlatform"] = factory();
})(this, function() {
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

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

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
                    options.headers = (_a = {},
                        _a['Authorization'] = "Bearer " + token,
                        _a);
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

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransportStrategy = function (path, transport, logger) {
    return function (listeners, headers) { return transport.subscribe(path, listeners, headers); };
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HOST_BASE = 'pusherplatform.io';


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

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

"use strict";

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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPING_REQ_TTL = 1500;
exports.TYPING_REQ_LEEWAY = 500;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PresenceState = (function () {
    function PresenceState(state) {
        switch (state) {
            case 'online':
                this.stringValue = state;
                break;
            case 'offline':
                this.stringValue = state;
                break;
            default:
                this.stringValue = 'unknown';
                break;
        }
    }
    return PresenceState;
}());
exports.default = PresenceState;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var UserStoreCore = (function () {
    function UserStoreCore(users) {
        if (users === void 0) { users = new Array(); }
        this.users = users;
    }
    UserStoreCore.prototype.addOrMerge = function (user) {
        var existingUser = this.users.find(function (el) { return el.id === user.id; });
        if (existingUser) {
            existingUser.updateWithPropertiesOfUser(user);
            return existingUser;
        }
        else {
            this.users.push(user);
            return user;
        }
    };
    UserStoreCore.prototype.remove = function (id) {
        var indexOfUser = this.users.findIndex(function (el) { return el.id === id; });
        if (indexOfUser === -1) {
            return undefined;
        }
        var user = this.users[indexOfUser];
        this.users.splice(indexOfUser, 1);
        return user;
    };
    UserStoreCore.prototype.find = function (id) {
        return this.users.find(function (el) { return el.id === id; });
    };
    return UserStoreCore;
}());
exports.default = UserStoreCore;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(1);
var TokenProvider = (function () {
    function TokenProvider(options) {
        this.authContext = options.authContext || {};
        this.url = options.url;
    }
    Object.defineProperty(TokenProvider.prototype, "cacheIsStale", {
        get: function () {
            if (this.cachedAccessToken && this.cachedTokenExpiresAt) {
                return this.unixTimeNow() > this.cachedTokenExpiresAt;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    TokenProvider.prototype.fetchToken = function (tokenParams) {
        var _this = this;
        if (this.cacheIsStale) {
            return this.makeAuthRequest().then(function (responseBody) {
                var access_token = responseBody.access_token, expires_in = responseBody.expires_in;
                _this.cache(access_token, expires_in);
                return access_token;
            });
        }
        return new Promise(function (resolve, reject) {
            resolve(_this.cachedAccessToken);
        });
    };
    TokenProvider.prototype.clearToken = function (token) {
        this.cachedAccessToken = undefined;
        this.cachedTokenExpiresAt = undefined;
    };
    TokenProvider.prototype.makeAuthRequest = function () {
        var url;
        var authRequestQueryParams = (this.authContext || {}).queryParams || {};
        if (this.userId === undefined) {
            url = utils_1.mergeQueryParamsIntoUrl(this.url, authRequestQueryParams);
        }
        else {
            var authContextWithUserId = __assign({ user_id: this.userId }, authRequestQueryParams);
            url = utils_1.mergeQueryParamsIntoUrl(this.url, authContextWithUserId);
        }
        var authRequestHeaders = (this.authContext || {}).headers || {};
        var headers = __assign((_a = {}, _a['Content-Type'] = 'application/x-www-form-urlencoded', _a), authRequestHeaders);
        var body = utils_1.urlEncode({ grant_type: 'client_credentials' });
        return pusher_platform_1.sendRawRequest({
            body: body,
            headers: headers,
            method: 'POST',
            url: url,
        }).then(function (res) {
            return JSON.parse(res);
        });
        var _a;
    };
    TokenProvider.prototype.cache = function (accessToken, expiresIn) {
        this.cachedAccessToken = accessToken;
        this.cachedTokenExpiresAt = this.unixTimeNow() + expiresIn;
    };
    TokenProvider.prototype.unixTimeNow = function () {
        return Math.floor(Date.now() / 1000);
    };
    return TokenProvider;
}());
exports.default = TokenProvider;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
exports.BaseClient = pusher_platform_1.BaseClient;
var chat_manager_1 = __webpack_require__(8);
exports.ChatManager = chat_manager_1.default;
var token_provider_1 = __webpack_require__(6);
exports.TokenProvider = token_provider_1.default;
exports.default = {
    BaseClient: pusher_platform_1.BaseClient,
    ChatManager: chat_manager_1.default,
    TokenProvider: token_provider_1.default,
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
var global_user_store_1 = __webpack_require__(9);
var payload_deserializer_1 = __webpack_require__(0);
var token_provider_1 = __webpack_require__(6);
var user_subscription_1 = __webpack_require__(20);
var ChatManager = (function () {
    function ChatManager(options) {
        this.userId = options.userId;
        var splitInstanceLocator = options.instanceLocator.split(':');
        if (splitInstanceLocator.length !== 3) {
            throw new Error('The instanceLocator property is in the wrong format!');
        }
        var cluster = splitInstanceLocator[1];
        var baseClient = options.baseClient ||
            new pusher_platform_1.BaseClient({
                host: cluster + "." + pusher_platform_1.HOST_BASE,
                logger: options.logger,
            });
        if (options.tokenProvider instanceof token_provider_1.default) {
            options.tokenProvider.userId = this.userId;
        }
        var sharedInstanceOptions = {
            client: baseClient,
            locator: options.instanceLocator,
            logger: options.logger,
            tokenProvider: options.tokenProvider,
        };
        this.apiInstance = new pusher_platform_1.Instance(__assign({ serviceName: 'chatkit', serviceVersion: 'v1' }, sharedInstanceOptions));
        this.filesInstance = new pusher_platform_1.Instance(__assign({ serviceName: 'chatkit_files', serviceVersion: 'v1' }, sharedInstanceOptions));
        this.cursorsInstance = new pusher_platform_1.Instance(__assign({ serviceName: 'chatkit_cursors', serviceVersion: 'v1' }, sharedInstanceOptions));
        this.userStore = new global_user_store_1.default({ apiInstance: this.apiInstance });
    }
    ChatManager.prototype.connect = function (delegate) {
        var _this = this;
        var cursorsReq = this.cursorsInstance
            .request({
            method: 'GET',
            path: "/cursors/0/users/" + this.userId,
        })
            .then(function (res) {
            var cursors = JSON.parse(res);
            var cursorsByRoom = {};
            cursors.forEach(function (c) {
                cursorsByRoom[c.room_id] = payload_deserializer_1.default.createBasicCursorFromPayload(c);
            });
            return cursorsByRoom;
        });
        return new Promise(function (resolve, reject) {
            _this.userSubscription = new user_subscription_1.default({
                apiInstance: _this.apiInstance,
                connectCompletionHandler: function (currentUser, error) {
                    if (currentUser) {
                        currentUser.cursorsReq = cursorsReq
                            .then(function (cursors) {
                            currentUser.cursors = cursors;
                        })
                            .catch(function (err) {
                            _this.cursorsInstance.logger.verbose('Error getting cursors:', err);
                        });
                        resolve(currentUser);
                    }
                    else {
                        reject(error);
                    }
                },
                cursorsInstance: _this.cursorsInstance,
                delegate: delegate,
                filesInstance: _this.filesInstance,
                userStore: _this.userStore,
            });
            _this.apiInstance.subscribeNonResuming({
                listeners: {
                    onError: delegate.error,
                    onEvent: _this.userSubscription.handleEvent.bind(_this.userSubscription),
                },
                path: '/users',
            });
        });
    };
    return ChatManager;
}());
exports.default = ChatManager;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var user_store_core_1 = __webpack_require__(5);
var utils_1 = __webpack_require__(1);
var GlobalUserStore = (function () {
    function GlobalUserStore(options) {
        this.apiInstance = options.apiInstance;
        this.userStoreCore = options.userStoreCore || new user_store_core_1.default();
    }
    GlobalUserStore.prototype.addOrMerge = function (user) {
        return this.userStoreCore.addOrMerge(user);
    };
    GlobalUserStore.prototype.remove = function (id) {
        return this.userStoreCore.remove(id);
    };
    GlobalUserStore.prototype.user = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = this.userStoreCore.find(id);
                        if (user) {
                            return [2, user];
                        }
                        return [4, this.getUser(id)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    GlobalUserStore.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var res, userPayload, user, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'GET',
                                path: "/users/" + id,
                            })];
                    case 1:
                        res = _a.sent();
                        userPayload = JSON.parse(res);
                        user = payload_deserializer_1.default.createUserFromPayload(userPayload);
                        return [2, this.addOrMerge(user)];
                    case 2:
                        err_1 = _a.sent();
                        this.apiInstance.logger.verbose('Error fetching user information:', err_1);
                        throw err_1;
                    case 3: return [2];
                }
            });
        });
    };
    GlobalUserStore.prototype.handleInitialPresencePayloads = function (payloads) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var presencePayloadPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        presencePayloadPromises = payloads.map(function (payload) {
                            return _this.user(payload.userId)
                                .then(function (user) {
                                user.updatePresenceInfoIfAppropriate(payload);
                            })
                                .catch(function (err) {
                                _this.apiInstance.logger.verbose('Error fetching user information:', err);
                                throw err;
                            });
                        });
                        return [4, utils_1.allPromisesSettled(presencePayloadPromises)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    GlobalUserStore.prototype.fetchUsersWithIds = function (userIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var userIdsString, qs, res, usersPayload, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (userIds.length === 0) {
                            this.apiInstance.logger.verbose('Requested to fetch users for a list of user ids which was empty');
                            return [2, []];
                        }
                        userIdsString = userIds.join(',');
                        qs = utils_1.queryString({ user_ids: userIdsString });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.apiInstance.request({
                                method: 'GET',
                                path: "/users_by_ids" + qs,
                            })];
                    case 2:
                        res = _a.sent();
                        usersPayload = JSON.parse(res);
                        return [2, usersPayload.map(function (userPayload) {
                                var user = payload_deserializer_1.default.createUserFromPayload(userPayload);
                                var addedOrUpdatedUser = _this.userStoreCore.addOrMerge(user);
                                return addedOrUpdatedUser;
                            })];
                    case 3:
                        err_2 = _a.sent();
                        this.apiInstance.logger.verbose('Error fetching user information:', err_2);
                        throw err_2;
                    case 4: return [2];
                }
            });
        });
    };
    return GlobalUserStore;
}());
exports.default = GlobalUserStore;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
var basic_message_enricher_1 = __webpack_require__(11);
var cursor_subscription_1 = __webpack_require__(12);
var cursor_types_1 = __webpack_require__(13);
var payload_deserializer_1 = __webpack_require__(0);
var presence_subscription_1 = __webpack_require__(14);
var room_store_1 = __webpack_require__(15);
var room_subscription_1 = __webpack_require__(16);
var constants_1 = __webpack_require__(3);
var utils_1 = __webpack_require__(1);
var CurrentUser = (function () {
    function CurrentUser(options) {
        var rooms = options.rooms, id = options.id, apiInstance = options.apiInstance, filesInstance = options.filesInstance, cursorsInstance = options.cursorsInstance;
        var validRooms = rooms || [];
        this.id = id;
        this.createdAt = options.createdAt;
        this.cursors = {};
        this.updatedAt = options.updatedAt;
        this.name = options.name;
        this.avatarURL = options.avatarURL;
        this.customData = options.customData;
        this.roomStore = new room_store_1.default({ apiInstance: apiInstance, rooms: validRooms });
        this.apiInstance = apiInstance;
        this.filesInstance = filesInstance;
        this.cursorsInstance = cursorsInstance;
        this.userStore = options.userStore;
        this.pathFriendlyId = encodeURIComponent(id);
        this.typingRequestSent = {};
    }
    Object.defineProperty(CurrentUser.prototype, "rooms", {
        get: function () {
            return this.roomStore.rooms;
        },
        enumerable: true,
        configurable: true
    });
    CurrentUser.prototype.updateWithPropertiesOf = function (currentUser) {
        this.updatedAt = currentUser.updatedAt;
        this.name = currentUser.name;
        this.customData = currentUser.customData;
    };
    CurrentUser.prototype.setupPresenceSubscription = function (delegate) {
        this.presenceSubscription = new presence_subscription_1.default({
            apiInstance: this.apiInstance,
            delegate: delegate,
            roomStore: this.roomStore,
            userStore: this.userStore,
        });
        this.apiInstance.subscribeNonResuming({
            listeners: {
                onError: delegate && delegate.error,
                onEvent: this.presenceSubscription.handleEvent.bind(this.presenceSubscription),
            },
            path: "/users/" + this.id + "/presence",
        });
    };
    CurrentUser.prototype.createRoom = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var roomData, res, roomPayload, room, addedOrMergedRoom, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roomData = {
                            created_by_id: this.id,
                            name: options.name,
                            private: options.private || false,
                        };
                        if (options.addUserIds && options.addUserIds.length > 0) {
                            roomData['user_ids'] = options.addUserIds;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.apiInstance.request({
                                json: roomData,
                                method: 'POST',
                                path: '/rooms',
                            })];
                    case 2:
                        res = _a.sent();
                        roomPayload = JSON.parse(res);
                        room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
                        addedOrMergedRoom = this.roomStore.addOrMerge(room);
                        this.populateRoomUserStore(addedOrMergedRoom);
                        return [2, addedOrMergedRoom];
                    case 3:
                        err_1 = _a.sent();
                        this.apiInstance.logger.verbose('Error creating room:', err_1);
                        throw err_1;
                    case 4: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.populateRoomUserStore = function (room) {
        var _this = this;
        var userPromises = new Array();
        room.userIds.forEach(function (userId) {
            var userPromise = new Promise(function (resolve, reject) {
                _this.userStore
                    .user(userId)
                    .then(function (user) {
                    room.userStore.addOrMerge(user);
                    resolve();
                })
                    .catch(function (error) {
                    _this.apiInstance.logger.debug("Unable to add user with id " + userId + " to room (room.name): " + error);
                    reject();
                });
            });
            userPromises.push(userPromise);
        });
        utils_1.allPromisesSettled(userPromises).then(function () {
            if (room.subscription === undefined) {
                _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
            }
            else {
                if (room.subscription.delegate &&
                    room.subscription.delegate.usersUpdated) {
                    room.subscription.delegate.usersUpdated();
                }
            }
            _this.apiInstance.logger.verbose("Users updated in room " + room.name);
        });
    };
    CurrentUser.prototype.addUser = function (id, roomId) {
        return this.addOrRemoveUsers(roomId, [id], 'add');
    };
    CurrentUser.prototype.removeUser = function (id, roomId) {
        return this.addOrRemoveUsers(roomId, [id], 'remove');
    };
    CurrentUser.prototype.updateRoom = function (roomId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var roomPayload, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (options.name === undefined && options.isPrivate === undefined) {
                            return [2];
                        }
                        roomPayload = {};
                        if (options.name) {
                            roomPayload['name'] = options.name;
                        }
                        if (options.isPrivate) {
                            roomPayload['private'] = options.isPrivate;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.apiInstance.request({
                                json: roomPayload,
                                method: 'PUT',
                                path: "/rooms/" + roomId,
                            })];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        err_2 = _a.sent();
                        this.apiInstance.logger.verbose("Error updating room " + roomId + ":", err_2);
                        throw err_2;
                    case 4: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.deleteRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'DELETE',
                                path: "/rooms/" + roomId,
                            })];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        err_3 = _a.sent();
                        this.apiInstance.logger.verbose("Error deleting room " + roomId + ":", err_3);
                        throw err_3;
                    case 3: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.addOrRemoveUsers = function (roomId, userIds, membershipChange) {
        return __awaiter(this, void 0, void 0, function () {
            var usersPayload, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        usersPayload = {
                            user_ids: userIds,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.apiInstance.request({
                                json: usersPayload,
                                method: 'PUT',
                                path: "/rooms/" + roomId + "/users/" + membershipChange,
                            })];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        err_4 = _a.sent();
                        this.apiInstance.logger.verbose("Error when attempting to " + membershipChange + " users from room " + roomId + ":", err_4);
                        throw err_4;
                    case 4: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.joinRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var res, roomPayload, room, addedOrMergedRoom, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'POST',
                                path: "/users/" + this.pathFriendlyId + "/rooms/" + roomId + "/join",
                            })];
                    case 1:
                        res = _a.sent();
                        roomPayload = JSON.parse(res);
                        room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
                        addedOrMergedRoom = this.roomStore.addOrMerge(room);
                        this.populateRoomUserStore(addedOrMergedRoom);
                        return [2, addedOrMergedRoom];
                    case 2:
                        err_5 = _a.sent();
                        this.apiInstance.logger.verbose("Error joining room " + roomId + ":", err_5);
                        throw err_5;
                    case 3: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.leaveRoom = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'POST',
                                path: "/users/" + this.pathFriendlyId + "/rooms/" + roomId + "/leave",
                            })];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        err_6 = _a.sent();
                        this.apiInstance.logger.verbose("Error leaving room " + roomId + ":", err_6);
                        throw err_6;
                    case 3: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.getJoinedRooms = function () {
        return this.getUserRooms(false);
    };
    CurrentUser.prototype.getJoinableRooms = function () {
        return this.getUserRooms(true);
    };
    CurrentUser.prototype.getUserRooms = function (onlyJoinable) {
        var joinableQueryItemValue = onlyJoinable ? 'true' : 'false';
        return this.getRooms("/users/" + this.pathFriendlyId + "/rooms?joinable=" + joinableQueryItemValue);
    };
    CurrentUser.prototype.getAllRooms = function () {
        return this.getRooms('/rooms');
    };
    CurrentUser.prototype.isTypingIn = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, sent, eventName, eventPayload, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = Date.now();
                        sent = this.typingRequestSent[roomId];
                        eventName = 'typing_start';
                        eventPayload = {
                            name: 'typing_start',
                            user_id: this.id,
                        };
                        if (!(!sent || now - sent > constants_1.TYPING_REQ_TTL - constants_1.TYPING_REQ_LEEWAY)) return [3, 4];
                        this.typingRequestSent[roomId] = now;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.apiInstance.request({
                                json: eventPayload,
                                method: 'POST',
                                path: "/rooms/" + roomId + "/events",
                            })];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        err_7 = _a.sent();
                        delete this.typingRequestSent[roomId];
                        this.apiInstance.logger.verbose("Error sending " + eventName + " event in room " + roomId + ":", err_7);
                        throw err_7;
                    case 4: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.setCursor = function (position, room) {
        return __awaiter(this, void 0, void 0, function () {
            var err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.cursorsInstance.request({
                                json: { position: position },
                                method: 'PUT',
                                path: "/cursors/" + cursor_types_1.default.Read + "/rooms/" + room.id + "/users/" + this.id,
                            })];
                    case 1:
                        _a.sent();
                        return [3, 3];
                    case 2:
                        err_8 = _a.sent();
                        this.cursorsInstance.logger.verbose("Error setting cursor in room " + room.name + ":", err_8);
                        throw err_8;
                    case 3: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.sendMessage = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var attachment, rest, completeOptions, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        attachment = options.attachment, rest = __rest(options, ["attachment"]);
                        completeOptions = __assign({ user_id: this.id }, rest);
                        if (!(attachment !== undefined)) return [3, 3];
                        if (!this.isDataAttachment(attachment)) return [3, 2];
                        _a = this.sendMessageWithCompleteOptions;
                        _b = {};
                        return [4, this.uploadFile(attachment.file, attachment.name, options.roomId)];
                    case 1: return [2, _a.apply(this, [__assign.apply(void 0, [(_b.attachment = _c.sent(), _b), completeOptions])])];
                    case 2:
                        if (this.isLinkAttachment(attachment)) {
                            return [2, this.sendMessageWithCompleteOptions(__assign({ attachment: {
                                        resource_link: attachment.link,
                                        type: attachment.type,
                                    } }, completeOptions))];
                        }
                        else {
                            this.apiInstance.logger.debug('Message not sent: invalid attachment property provided: ', attachment);
                            throw TypeError('invalid attachment');
                        }
                        _c.label = 3;
                    case 3: return [2, this.sendMessageWithCompleteOptions(completeOptions)];
                }
            });
        });
    };
    CurrentUser.prototype.subscribeToRoom = function (room, roomDelegate, messageLimit) {
        if (messageLimit === void 0) { messageLimit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.cursorsReq];
                    case 1:
                        _a.sent();
                        room.subscription = new room_subscription_1.default({
                            basicMessageEnricher: new basic_message_enricher_1.default(this.userStore, room, this.apiInstance.logger),
                            delegate: roomDelegate,
                            logger: this.apiInstance.logger,
                        });
                        this.apiInstance.subscribeNonResuming({
                            listeners: {
                                onError: roomDelegate.error,
                                onEvent: room.subscription.handleEvent.bind(room.subscription),
                            },
                            path: "/rooms/" + room.id + "?message_limit=" + messageLimit,
                        });
                        this.subscribeToCursors(room, roomDelegate);
                        return [2];
                }
            });
        });
    };
    CurrentUser.prototype.fetchMessagesFromRoom = function (room, fetchOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var initialIdQueryParam, limitQueryParam, directionQueryParam, combinedQueryParams, res, messagesPayload, messages_1, basicMessages_1, messageUserIds, messageUserIdsSet, userIdsToFetch, users, messageEnricher_1, enrichmentPromises_1, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initialIdQueryParam = fetchOptions.initialId
                            ? "initial_id=" + fetchOptions.initialId
                            : '';
                        limitQueryParam = fetchOptions.limit
                            ? "limit=" + fetchOptions.limit
                            : '';
                        directionQueryParam = fetchOptions.direction
                            ? "direction=" + fetchOptions.direction
                            : 'direction=older';
                        combinedQueryParams = [
                            initialIdQueryParam,
                            limitQueryParam,
                            directionQueryParam,
                        ].join('&');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4, this.apiInstance.request({
                                method: 'GET',
                                path: "/rooms/" + room.id + "/messages?" + combinedQueryParams,
                            })];
                    case 2:
                        res = _a.sent();
                        messagesPayload = JSON.parse(res);
                        messages_1 = new Array();
                        basicMessages_1 = new Array();
                        messageUserIds = messagesPayload.map(function (messagePayload) {
                            var basicMessage = payload_deserializer_1.default.createBasicMessageFromPayload(messagePayload);
                            basicMessages_1.push(basicMessage);
                            return basicMessage.id;
                        });
                        messageUserIdsSet = new Set(messageUserIds);
                        userIdsToFetch = Array.from(messageUserIdsSet.values());
                        return [4, this.userStore.fetchUsersWithIds(userIdsToFetch)];
                    case 3:
                        users = _a.sent();
                        messageEnricher_1 = new basic_message_enricher_1.default(this.userStore, room, this.apiInstance.logger);
                        enrichmentPromises_1 = new Array();
                        basicMessages_1.forEach(function (basicMessage) {
                            var enrichmentPromise = new Promise(function (resolve, reject) {
                                messageEnricher_1.enrich(basicMessage, function (message) {
                                    messages_1.push(message);
                                    resolve();
                                }, function (error) {
                                    _this.apiInstance.logger.verbose("Unable to enrich basic mesage " + basicMessage.id + ": " + error);
                                    reject();
                                });
                            });
                            enrichmentPromises_1.push(enrichmentPromise);
                        });
                        return [4, utils_1.allPromisesSettled(enrichmentPromises_1)];
                    case 4:
                        _a.sent();
                        if (room.subscription === undefined) {
                            this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                        }
                        else if (room.subscription.delegate &&
                            room.subscription.delegate.usersUpdated) {
                            room.subscription.delegate.usersUpdated();
                        }
                        this.apiInstance.logger.verbose("Users updated in room " + room.name);
                        return [2, messages_1.sort(function (msgOne, msgTwo) { return msgOne.id - msgTwo.id; })];
                    case 5:
                        err_9 = _a.sent();
                        this.apiInstance.logger.verbose("Error fetching messages froom room " + room.name + ":", err_9);
                        throw err_9;
                    case 6: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.fetchAttachment = function (attachmentURL) {
        if (!this.apiInstance.tokenProvider) {
            return new Promise(function (resolve, reject) {
                reject(new Error('Token provider not set on apiInstance'));
            });
        }
        return this.apiInstance.tokenProvider.fetchToken().then(function (token) {
            return pusher_platform_1.sendRawRequest({
                headers: {
                    Authorization: "Bearer " + token,
                },
                method: 'GET',
                url: attachmentURL,
            }).then(function (res) {
                var attachmentPayload = JSON.parse(res);
                var fetchedAttachment = payload_deserializer_1.default.createFetchedAttachmentFromPayload(attachmentPayload);
                return fetchedAttachment;
            });
        });
    };
    CurrentUser.prototype.isDataAttachment = function (attachment) {
        return (attachment.file !== undefined &&
            attachment.name !== undefined);
    };
    CurrentUser.prototype.isLinkAttachment = function (attachment) {
        return (attachment.link !== undefined &&
            attachment.type !== undefined);
    };
    CurrentUser.prototype.uploadFile = function (file, fileName, roomId) {
        var data = new FormData();
        data.append('file', file, fileName);
        return this.filesInstance
            .request({
            body: data,
            method: 'POST',
            path: "/rooms/" + roomId + "/files/" + fileName,
        })
            .then(function (res) {
            return JSON.parse(res);
        });
    };
    CurrentUser.prototype.sendMessageWithCompleteOptions = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                json: options,
                                method: 'POST',
                                path: "/rooms/" + options.roomId + "/messages",
                            })];
                    case 1:
                        res = _a.sent();
                        return [2, JSON.parse(res).message_id];
                    case 2:
                        err_10 = _a.sent();
                        this.apiInstance.logger.verbose("Error sending message to room " + options.roomId + ":", err_10);
                        throw err_10;
                    case 3: return [2];
                }
            });
        });
    };
    CurrentUser.prototype.subscribeToCursors = function (room, roomDelegate) {
        var _this = this;
        room.cursorSubscription = new cursor_subscription_1.default({
            delegate: roomDelegate,
            handleCursorSetInternal: function (cursor) {
                if (cursor.userId === _this.id && _this.cursors !== undefined) {
                    _this.cursors[cursor.roomId] = cursor;
                }
            },
            logger: this.cursorsInstance.logger,
            room: room,
            userStore: this.userStore,
        });
        this.cursorsInstance.subscribeNonResuming({
            listeners: {
                onEvent: room.cursorSubscription.handleEvent.bind(room.cursorSubscription),
            },
            path: "/cursors/" + cursor_types_1.default.Read + "/rooms/" + room.id,
        });
    };
    CurrentUser.prototype.getRooms = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var res, roomsPayload, err_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'GET',
                                path: path,
                            })];
                    case 1:
                        res = _a.sent();
                        roomsPayload = JSON.parse(res);
                        return [2, roomsPayload.map(function (roomPayload) {
                                return payload_deserializer_1.default.createRoomFromPayload(roomPayload);
                            })];
                    case 2:
                        err_11 = _a.sent();
                        this.apiInstance.logger.verbose('Error when getting instance rooms:', err_11);
                        throw err_11;
                    case 3: return [2];
                }
            });
        });
    };
    return CurrentUser;
}());
exports.default = CurrentUser;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BasicMessageEnricher = (function () {
    function BasicMessageEnricher(userStore, room, logger) {
        this.completionOrderList = [];
        this.messageIdToCompletionHandlers = {};
        this.enrichedMessagesAwaitingCompletionCalls = {};
        this.userIdsBeingRetrieved = [];
        this.userIdsToBasicMessageIds = {};
        this.messagesAwaitingEnrichmentDependentOnUserRetrieval = {};
        this.userStore = userStore;
        this.room = room;
        this.logger = logger;
    }
    BasicMessageEnricher.prototype.enrich = function (basicMessage, onSuccess, onError) {
        var _this = this;
        var basicMessageId = basicMessage.id;
        var basicMessageSenderId = basicMessage.senderId;
        this.completionOrderList.push(basicMessageId);
        this.messageIdToCompletionHandlers[basicMessageId] = {
            onError: onError,
            onSuccess: onSuccess,
        };
        if (this.userIdsToBasicMessageIds[basicMessageSenderId] === undefined) {
            this.userIdsToBasicMessageIds[basicMessageSenderId] = [basicMessageId];
        }
        else {
            this.userIdsToBasicMessageIds[basicMessageSenderId].push(basicMessageId);
        }
        this.messagesAwaitingEnrichmentDependentOnUserRetrieval[basicMessageId] = basicMessage;
        if (this.userIdsBeingRetrieved.indexOf(basicMessageSenderId) > -1) {
            return;
        }
        else {
            this.userIdsBeingRetrieved.push(basicMessageSenderId);
        }
        this.userStore
            .user(basicMessageSenderId)
            .then(function (user) {
            var basicMessageIds = _this.userIdsToBasicMessageIds[basicMessageSenderId];
            if (basicMessageIds === undefined) {
                _this.logger.verbose("Fetched user information for user with id " + user.id + " but no messages needed information for this user");
                return;
            }
            var basicMessages = basicMessageIds
                .map(function (bmId) {
                return _this.messagesAwaitingEnrichmentDependentOnUserRetrieval[bmId];
            })
                .filter(function (el) { return el !== undefined; });
            _this.enrichMessagesWithUser(user, basicMessages);
            var indexToRemove = _this.userIdsBeingRetrieved.indexOf(basicMessageSenderId);
            if (indexToRemove > -1) {
                _this.userIdsBeingRetrieved.splice(indexToRemove, 1);
            }
        })
            .catch(function (error) {
            _this.logger.debug("Unable to find user with id " + basicMessage.senderId + ", associated with message " + basicMessageId + ". Error:", error);
            _this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(basicMessageId, error);
        });
    };
    BasicMessageEnricher.prototype.enrichMessagesWithUser = function (user, messages) {
        var _this = this;
        messages.forEach(function (basicMessage) {
            var message = {
                attachment: basicMessage.attachment,
                createdAt: basicMessage.createdAt,
                id: basicMessage.id,
                room: _this.room,
                sender: user,
                text: basicMessage.text,
                updatedAt: basicMessage.updatedAt,
            };
            _this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(basicMessage.id, message);
        });
    };
    BasicMessageEnricher.prototype.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo = function (id, result) {
        var nextIdToComplete = this.completionOrderList[0];
        if (nextIdToComplete === undefined) {
            return;
        }
        this.enrichedMessagesAwaitingCompletionCalls[id] = result;
        if (id !== nextIdToComplete) {
            this.logger.verbose("Waiting to call completion handler for message id " + id + " as there are other older messages still to be enriched");
            return;
        }
        do {
            var messageId = this.completionOrderList[0];
            var completionHandler = this.messageIdToCompletionHandlers[messageId];
            if (completionHandler === undefined) {
                this.logger.verbose("Completion handler not stored for message id " + messageId);
                return;
            }
            var res = this.enrichedMessagesAwaitingCompletionCalls[messageId];
            if (res === undefined) {
                this.logger.verbose("Enrichment result not stored for message id " + messageId);
                return;
            }
            if (res.sender !== undefined) {
                completionHandler.onSuccess(res);
            }
            else {
                completionHandler.onError(res);
            }
            this.completionOrderList.shift();
            delete this.messageIdToCompletionHandlers[messageId];
            delete this.enrichedMessagesAwaitingCompletionCalls[messageId];
        } while (this.completionOrderList[0] !== undefined &&
            this.enrichedMessagesAwaitingCompletionCalls[this.completionOrderList[0]] !== undefined);
    };
    return BasicMessageEnricher;
}());
exports.default = BasicMessageEnricher;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var CursorSubscription = (function () {
    function CursorSubscription(options) {
        this.delegate = options.delegate;
        this.logger = options.logger;
        this.room = options.room;
        this.userStore = options.userStore;
        this.handleCursorSetInternal = options.handleCursorSetInternal;
    }
    CursorSubscription.prototype.handleEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var body, eventId, headers, data, eventName, basicCursor, cursor, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.delegate || !this.delegate.cursorSet) {
                            return [2];
                        }
                        body = event.body, eventId = event.eventId, headers = event.headers;
                        data = body.data;
                        eventName = body.event_name;
                        if (eventName !== 'cursor_set') {
                            this.logger.verbose("Cursor subscription received event with type " + eventName + ", when 'cursor_set' was expected");
                            return [2];
                        }
                        this.logger.verbose("Received event name: " + eventName + ", and data: " + data);
                        basicCursor = payload_deserializer_1.default.createBasicCursorFromPayload(data);
                        this.logger.verbose("Room received cursor for: " + basicCursor.userId);
                        this.handleCursorSetInternal(basicCursor);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.enrich(basicCursor)];
                    case 2:
                        cursor = _a.sent();
                        if (this.delegate && this.delegate.cursorSet) {
                            this.delegate.cursorSet(cursor);
                        }
                        return [3, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.logger.debug('Error receiving cursor:', err_1);
                        return [3, 4];
                    case 4: return [2];
                }
            });
        });
    };
    CursorSubscription.prototype.enrich = function (basicCursor) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = {
                            cursorType: basicCursor.cursorType,
                            position: basicCursor.position,
                            room: this.room,
                            updatedAt: basicCursor.updatedAt
                        };
                        return [4, this.userStore.user(basicCursor.userId)];
                    case 1: return [2, (_a.user = _b.sent(),
                            _a)];
                    case 2:
                        err_2 = _b.sent();
                        this.logger.debug("Unable to find user with id " + basicCursor.userId + ". Error:", err_2);
                        throw err_2;
                    case 3: return [2];
                }
            });
        });
    };
    return CursorSubscription;
}());
exports.default = CursorSubscription;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CursorType;
(function (CursorType) {
    CursorType[CursorType["Read"] = 0] = "Read";
})(CursorType || (CursorType = {}));
exports.default = CursorType;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var PresenceSubscription = (function () {
    function PresenceSubscription(options) {
        this.apiInstance = options.apiInstance;
        this.userStore = options.userStore;
        this.roomStore = options.roomStore;
        this.delegate = options.delegate;
    }
    PresenceSubscription.prototype.handleEvent = function (event) {
        var body = event.body, eventId = event.eventId, headers = event.headers;
        var data = body.data;
        var eventName = body.event_name;
        this.apiInstance.logger.verbose("Received event type: " + eventName + ", and data: " + data);
        switch (eventName) {
            case 'initial_state':
                this.parseInitialStatePayload(eventName, data, this.userStore);
                break;
            case 'presence_update':
                this.parsePresenceUpdatePayload(eventName, data, this.userStore);
                break;
            case 'join_room_presence_update':
                this.parseJoinRoomPresenceUpdatePayload(eventName, data, this.userStore);
                break;
            default:
                this.apiInstance.logger.verbose("Unsupported event type received: " + eventName + ", and data: " + data);
                break;
        }
    };
    PresenceSubscription.prototype.end = function () {
    };
    PresenceSubscription.prototype.parseInitialStatePayload = function (eventName, data, userStore) {
        var _this = this;
        var userStatesPayload = data.user_states;
        if (userStatesPayload === undefined ||
            userStatesPayload.constructor !== Array) {
            this.apiInstance.logger.debug("'user_stats' value missing from " + eventName + " presence payload: " + data);
            return;
        }
        var userStates = userStatesPayload
            .map(function (userStatePayload) {
            return payload_deserializer_1.default.createPresencePayloadFromPayload(userStatePayload);
        })
            .filter(function (el) { return el !== undefined; });
        if (userStates.length === 0) {
            this.apiInstance.logger.verbose('No presence user states to process');
            return;
        }
        this.userStore.handleInitialPresencePayloads(userStates).then(function () {
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.usersUpdated) {
                        room.subscription.delegate.usersUpdated();
                    }
                }
                _this.apiInstance.logger.verbose("Users updated in room " + room.name);
            });
        });
    };
    PresenceSubscription.prototype.parsePresenceUpdatePayload = function (eventName, data, userStore) {
        var _this = this;
        var presencePayload = payload_deserializer_1.default.createPresencePayloadFromPayload(data);
        userStore.user(presencePayload.userId).then(function (user) {
            user.updatePresenceInfoIfAppropriate(presencePayload);
            switch (presencePayload.state.stringValue) {
                case 'online':
                    if (_this.delegate && _this.delegate.userCameOnline) {
                        _this.delegate.userCameOnline(user);
                    }
                    _this.apiInstance.logger.verbose(user.id + " came online");
                    break;
                case 'offline':
                    if (_this.delegate && _this.delegate.userWentOffline) {
                        _this.delegate.userWentOffline(user);
                    }
                    _this.apiInstance.logger.verbose(user.id + " went offline");
                    break;
                case 'unknown':
                    _this.apiInstance.logger.verbose("Somehow the presence state of user " + user.id + " is unknown");
                    break;
            }
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                    return;
                }
                if (room.userIds.indexOf(user.id) > -1) {
                    switch (presencePayload.state.stringValue) {
                        case 'online':
                            if (room.subscription.delegate &&
                                room.subscription.delegate.userCameOnlineInRoom) {
                                room.subscription.delegate.userCameOnlineInRoom(user);
                            }
                            break;
                        case 'offline':
                            if (room.subscription.delegate &&
                                room.subscription.delegate.userWentOfflineInRoom) {
                                room.subscription.delegate.userWentOfflineInRoom(user);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
        }, function (error) {
            _this.apiInstance.logger.debug("Error fetching user information for user with id " + presencePayload.userId + ":", error);
            return;
        });
    };
    PresenceSubscription.prototype.parseJoinRoomPresenceUpdatePayload = function (eventName, data, userStore) {
        var _this = this;
        var userStatesPayload = data.user_states;
        if (userStatesPayload === undefined ||
            userStatesPayload.constructor !== Array) {
            this.apiInstance.logger.debug("'user_stats' value missing from " + eventName + " presence payload: " + data);
            return;
        }
        var userStates = userStatesPayload
            .map(function (userStatePayload) {
            return payload_deserializer_1.default.createPresencePayloadFromPayload(userStatePayload);
        })
            .filter(function (el) { return el !== undefined; });
        if (userStates.length === 0) {
            this.apiInstance.logger.verbose('No presence user states to process');
            return;
        }
        this.userStore.handleInitialPresencePayloads(userStates).then(function () {
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.usersUpdated) {
                        room.subscription.delegate.usersUpdated();
                    }
                }
                _this.apiInstance.logger.verbose("Users updated in room " + room.name);
            });
        });
    };
    return PresenceSubscription;
}());
exports.default = PresenceSubscription;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var RoomStore = (function () {
    function RoomStore(options) {
        this.rooms = options.rooms;
        this.apiInstance = options.apiInstance;
    }
    RoomStore.prototype.room = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var room;
            return __generator(this, function (_a) {
                room = this.rooms.find(function (el) { return el.id === id; });
                if (room) {
                    return [2, room];
                }
                return [2, this.getRoom(id)];
            });
        });
    };
    RoomStore.prototype.addOrMerge = function (room) {
        var existingRoom = this.rooms.find(function (el) { return el.id === room.id; });
        if (existingRoom) {
            existingRoom.updateWithPropertiesOfRoom(room);
            return existingRoom;
        }
        else {
            this.rooms.push(room);
            return room;
        }
    };
    RoomStore.prototype.remove = function (id) {
        var indexOfRoom = this.rooms.findIndex(function (el) { return el.id === id; });
        if (indexOfRoom === -1) {
            return undefined;
        }
        var room = this.rooms[indexOfRoom];
        this.rooms.splice(indexOfRoom, 1);
        return room;
    };
    RoomStore.prototype.getRoom = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var res, roomPayload, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.apiInstance.request({
                                method: 'GET',
                                path: "/rooms/" + id,
                            })];
                    case 1:
                        res = _a.sent();
                        roomPayload = JSON.parse(res);
                        return [2, payload_deserializer_1.default.createRoomFromPayload(roomPayload)];
                    case 2:
                        err_1 = _a.sent();
                        this.apiInstance.logger.debug("Error fetching room " + id + ":", err_1);
                        throw err_1;
                    case 3: return [2];
                }
            });
        });
    };
    return RoomStore;
}());
exports.default = RoomStore;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var RoomSubscription = (function () {
    function RoomSubscription(options) {
        this.delegate = options.delegate;
        this.basicMessageEnricher = options.basicMessageEnricher;
        this.logger = options.logger;
    }
    RoomSubscription.prototype.handleEvent = function (event) {
        var _this = this;
        var body = event.body, eventId = event.eventId, headers = event.headers;
        var data = body.data;
        var eventName = body.event_name;
        if (eventName !== 'new_message') {
            this.logger.verbose("Room subscription received event with type " + eventName + ", when 'new_message' was expected");
            return;
        }
        this.logger.verbose("Received event name: " + eventName + ", and data:", data);
        var basicMessage = payload_deserializer_1.default.createBasicMessageFromPayload(data);
        this.basicMessageEnricher.enrich(basicMessage, function (message) {
            _this.logger.verbose("Room received new message: " + message.text);
            if (_this.delegate && _this.delegate.newMessage) {
                _this.delegate.newMessage(message);
            }
        }, function (error) {
            _this.logger.debug('Error receiving new message:', error);
        });
    };
    return RoomSubscription;
}());
exports.default = RoomSubscription;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var room_user_store_1 = __webpack_require__(18);
var Room = (function () {
    function Room(options) {
        this.id = options.id;
        this.name = options.name;
        this.isPrivate = options.isPrivate;
        this.createdByUserId = options.createdByUserId;
        this.createdAt = options.createdAt;
        this.updatedAt = options.updatedAt;
        this.deletedAt = options.deletedAt;
        this.userIds = options.userIds || [];
        this.userStore = new room_user_store_1.default();
    }
    Room.prototype.updateWithPropertiesOfRoom = function (room) {
        this.name = room.name;
        this.isPrivate = room.isPrivate;
        this.updatedAt = room.updatedAt;
        this.deletedAt = room.deletedAt;
        this.userIds = room.userIds;
    };
    return Room;
}());
exports.default = Room;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var user_store_core_1 = __webpack_require__(5);
var RoomUserStore = (function () {
    function RoomUserStore(userStoreCore) {
        if (userStoreCore === void 0) { userStoreCore = new user_store_core_1.default(); }
        this.userStoreCore = userStoreCore;
    }
    RoomUserStore.prototype.addOrMerge = function (user) {
        return this.userStoreCore.addOrMerge(user);
    };
    RoomUserStore.prototype.remove = function (id) {
        return this.userStoreCore.remove(id);
    };
    return RoomUserStore;
}());
exports.default = RoomUserStore;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var presence_state_1 = __webpack_require__(4);
var User = (function () {
    function User(options) {
        this.id = options.id;
        this.createdAt = options.createdAt;
        this.updatedAt = options.updatedAt;
        this.name = options.name;
        this.avatarURL = options.avatarURL;
        this.customData = options.customData;
        this.presenceState = new presence_state_1.default('unknown');
    }
    User.prototype.updateWithPropertiesOfUser = function (user) {
        if (user.presenceState.stringValue !== 'unknown') {
            this.presenceState = user.presenceState;
            this.lastSeenAt = user.lastSeenAt;
        }
        return this;
    };
    User.prototype.updatePresenceInfoIfAppropriate = function (newInfoPayload) {
        if (newInfoPayload.state.stringValue !== 'unknown') {
            this.presenceState = newInfoPayload.state;
            this.lastSeenAt = newInfoPayload.lastSeenAt;
        }
    };
    return User;
}());
exports.default = User;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(3);
var utils_1 = __webpack_require__(1);
var UserSubscription = (function () {
    function UserSubscription(options) {
        this.typingTimers = {};
        this.apiInstance = options.apiInstance;
        this.filesInstance = options.filesInstance;
        this.cursorsInstance = options.cursorsInstance;
        this.userStore = options.userStore;
        this.delegate = options.delegate;
        this.connectCompletionHandlers = [options.connectCompletionHandler];
    }
    UserSubscription.prototype.handleEvent = function (event) {
        var body = event.body, eventId = event.eventId, headers = event.headers;
        var data = body.data;
        var eventName = body.event_name;
        this.apiInstance.logger.verbose("Received event name: " + eventName + ", and data: " + data);
        switch (eventName) {
            case 'initial_state':
                this.parseInitialStatePayload(eventName, data, this.userStore);
                break;
            case 'added_to_room':
                this.parseAddedToRoomPayload(eventName, data);
                break;
            case 'removed_from_room':
                this.parseRemovedFromRoomPayload(eventName, data);
                break;
            case 'room_updated':
                this.parseRoomUpdatedPayload(eventName, data);
                break;
            case 'room_deleted':
                this.parseRoomDeletedPayload(eventName, data);
                break;
            case 'user_joined':
                this.parseUserJoinedPayload(eventName, data);
                break;
            case 'user_left':
                this.parseUserLeftPayload(eventName, data);
                break;
            case 'typing_start':
                this.parseIsTypingPayload(eventName, data, data.user_id);
                break;
            case 'typing_stop':
                break;
        }
    };
    UserSubscription.prototype.callConnectCompletionHandlers = function (currentUser, error) {
        this.connectCompletionHandlers.forEach(function (completionHandler) {
            completionHandler(currentUser, error);
        });
    };
    UserSubscription.prototype.parseInitialStatePayload = function (eventName, data, userStore) {
        var _this = this;
        var roomsPayload = data.rooms;
        var userPayload = data.current_user;
        var receivedCurrentUser = payload_deserializer_1.default.createCurrentUserFromPayload(userPayload, this.apiInstance, this.filesInstance, this.cursorsInstance, this.userStore);
        var wasExistingCurrentUser = this.currentUser !== undefined;
        if (this.currentUser) {
            this.currentUser.updateWithPropertiesOf(receivedCurrentUser);
        }
        else {
            this.currentUser = receivedCurrentUser;
        }
        var receivedRoomsConstructor = roomsPayload.constructor;
        if (receivedRoomsConstructor !== Array) {
            throw TypeError('`rooms` key of initial_state payload was of type `${receivedRoomsConstructor}`, expected `Array`');
        }
        if (roomsPayload.length === 0) {
            this.currentUser.setupPresenceSubscription(this.delegate);
            this.callConnectCompletionHandlers(this.currentUser);
            return;
        }
        var combinedRoomUserIds = new Set([]);
        var roomsFromConnection = [];
        roomsPayload.forEach(function (roomPayload) {
            var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            room.userIds.forEach(function (userId) {
                combinedRoomUserIds.add(userId);
            });
            roomsFromConnection.push(room);
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.roomStore.addOrMerge(room);
        });
        this.callConnectCompletionHandlers(this.currentUser);
        this.fetchInitialUserInformationForUserIds(combinedRoomUserIds, this.currentUser);
        if (wasExistingCurrentUser) {
            this.reconcileExistingRoomStoreWithRoomsReceivedOnConnection(roomsFromConnection);
        }
    };
    UserSubscription.prototype.fetchInitialUserInformationForUserIds = function (userIds, currentUser) {
        var _this = this;
        var userIdsArray = Array.from(userIds.values());
        this.userStore
            .fetchUsersWithIds(userIdsArray)
            .then(function (users) {
            var combinedRoomUsersPromises = new Array();
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.roomStore.rooms.forEach(function (room) {
                var roomPromise = new Promise(function (roomResolve, roomReject) {
                    var roomUsersPromises = new Array();
                    room.userIds.forEach(function (userId) {
                        var userPromise = new Promise(function (userResolve, userReject) {
                            _this.userStore
                                .user(userId)
                                .then(function (user) {
                                room.userStore.addOrMerge(user);
                                userResolve();
                            })
                                .catch(function (error) {
                                _this.apiInstance.logger.verbose("Unable to fetch information about user " + userId);
                                userReject();
                            });
                        });
                        roomUsersPromises.push(userPromise);
                    });
                    utils_1.allPromisesSettled(roomUsersPromises).then(function () {
                        if (room.subscription === undefined) {
                            _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                        }
                        else {
                            if (room.subscription.delegate &&
                                room.subscription.delegate.usersUpdated) {
                                room.subscription.delegate.usersUpdated();
                            }
                        }
                        _this.apiInstance.logger.verbose("Users updated in room " + room.name + "\"");
                        roomResolve();
                    });
                });
                combinedRoomUsersPromises.push(roomPromise);
            });
            utils_1.allPromisesSettled(combinedRoomUsersPromises).then(function () {
                if (!_this.currentUser) {
                    _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                    return;
                }
                _this.currentUser.setupPresenceSubscription(_this.delegate);
            });
        })
            .catch(function (error) {
            _this.apiInstance.logger.debug("Unable to fetch user information after successful connection: " + error);
            return;
        });
    };
    UserSubscription.prototype.reconcileExistingRoomStoreWithRoomsReceivedOnConnection = function (roomsFromConnection) {
        var _this = this;
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property of UserSubscription unset after successful connection');
            return;
        }
        var roomStoreRooms = this.currentUser.roomStore.rooms;
        var mostRecentConnectionRoomsSet = new Set(roomsFromConnection);
        var noLongerAMemberOfRooms = roomStoreRooms.filter(function (room) { return !mostRecentConnectionRoomsSet.has(room); });
        noLongerAMemberOfRooms.forEach(function (room) {
            if (_this.delegate && _this.delegate.removedFromRoom) {
                _this.delegate.removedFromRoom(room);
            }
        });
    };
    UserSubscription.prototype.parseAddedToRoomPayload = function (eventName, data) {
        var _this = this;
        var roomPayload = data.room;
        if (roomPayload === undefined || typeof roomPayload !== 'object') {
            this.apiInstance.logger.verbose("`room` key missing or invalid in `added_to_room` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
        var roomAdded = this.currentUser.roomStore.addOrMerge(room);
        if (this.delegate && this.delegate.addedToRoom) {
            this.delegate.addedToRoom(room);
        }
        this.apiInstance.logger.verbose("Added to room: " + room.name);
        var roomUsersPromises = new Array();
        roomAdded.userIds.forEach(function (userId) {
            var userPromise = new Promise(function (resolve, reject) {
                _this.userStore
                    .user(userId)
                    .then(function (user) {
                    _this.apiInstance.logger.verbose("Added user id " + userId + " to room " + room.name);
                    room.userStore.addOrMerge(user);
                    resolve();
                })
                    .catch(function (error) {
                    _this.apiInstance.logger.debug("Unable to add user with id " + userId + " to room " + room.name + ": " + error);
                    reject();
                });
            });
            roomUsersPromises.push(userPromise);
        });
        utils_1.allPromisesSettled(roomUsersPromises).then(function () {
            if (room.subscription === undefined) {
                _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
            }
            else {
                if (room.subscription.delegate &&
                    room.subscription.delegate.usersUpdated) {
                    room.subscription.delegate.usersUpdated();
                }
            }
            _this.apiInstance.logger.verbose("Users updated in room " + room.name);
        });
    };
    UserSubscription.prototype.parseRemovedFromRoomPayload = function (eventName, data) {
        var roomId = data.room_id;
        if (roomId === undefined || typeof roomId !== 'number') {
            this.apiInstance.logger.verbose("`room_id` key missing or invalid in `removed_from_room` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        var roomRemoved = this.currentUser.roomStore.remove(roomId);
        if (roomRemoved) {
            if (this.delegate && this.delegate.removedFromRoom) {
                this.delegate.removedFromRoom(roomRemoved);
            }
            this.apiInstance.logger.verbose("Removed from room: " + roomRemoved.name);
        }
        else {
            this.apiInstance.logger.verbose("Received `removed_from_room` API event but room with ID " + roomId + " not found in local store of joined rooms");
            return;
        }
    };
    UserSubscription.prototype.parseRoomUpdatedPayload = function (eventName, data) {
        var _this = this;
        var roomPayload = data.room;
        if (roomPayload === undefined || typeof roomPayload !== 'object') {
            this.apiInstance.logger.verbose("`room` key missing or invalid in `room_updated` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
        this.currentUser.roomStore
            .room(room.id)
            .then(function (roomToUpdate) {
            roomToUpdate.updateWithPropertiesOfRoom(room);
            if (_this.delegate && _this.delegate.roomUpdated) {
                _this.delegate.roomUpdated(roomToUpdate);
            }
            _this.apiInstance.logger.verbose("Room updated: " + room.name);
        })
            .catch(function (error) {
            _this.apiInstance.logger.debug("Error updating room " + room.id + ":", error);
        });
    };
    UserSubscription.prototype.parseRoomDeletedPayload = function (eventName, data) {
        var roomId = data.room_id;
        if (roomId === undefined || typeof roomId !== 'number') {
            this.apiInstance.logger.verbose("`room_id` key missing or invalid in `room_deleted` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        var deletedRoom = this.currentUser.roomStore.remove(roomId);
        if (deletedRoom) {
            if (this.delegate && this.delegate.roomDeleted) {
                this.delegate.roomDeleted(deletedRoom);
            }
            this.apiInstance.logger.verbose("Room deleted: " + deletedRoom.name);
        }
        else {
            this.apiInstance.logger.verbose("Received `room_deleted` API event but room with ID " + roomId + " not found in local store of joined rooms");
            return;
        }
    };
    UserSubscription.prototype.parseUserJoinedPayload = function (eventName, data) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || typeof roomId !== 'number') {
            this.apiInstance.logger.verbose("`room_id` key missing or invalid in `user_joined` payload: " + data);
            return;
        }
        var userId = data.user_id;
        if (userId === undefined || typeof userId !== 'string') {
            this.apiInstance.logger.verbose("`user_id` key missing or invalid in `user_joined` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        this.currentUser.roomStore
            .room(roomId)
            .then(function (room) {
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.userStore
                .user(userId)
                .then(function (user) {
                var addedOrMergedUser = room.userStore.addOrMerge(user);
                if (room.userIds.indexOf(addedOrMergedUser.id) === -1) {
                    room.userIds.push(addedOrMergedUser.id);
                }
                if (_this.delegate && _this.delegate.userJoinedRoom) {
                    _this.delegate.userJoinedRoom(room, addedOrMergedUser);
                }
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.userJoined) {
                        room.subscription.delegate.userJoined(addedOrMergedUser);
                    }
                }
                _this.apiInstance.logger.verbose("User " + user.id + " joined room: " + room.name);
            })
                .catch(function (error) {
                _this.apiInstance.logger.verbose("Error fetching user " + userId + ":", error);
                return;
            });
        })
            .catch(function (error) {
            _this.apiInstance.logger.verbose("User with id " + userId + " joined room with id " + roomId + " but no information about the room could be retrieved. Error was: " + error);
            return;
        });
    };
    UserSubscription.prototype.parseUserLeftPayload = function (eventName, data) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || typeof roomId !== 'number') {
            this.apiInstance.logger.verbose("`room_id` key missing or invalid in `user_left` payload: " + data);
            return;
        }
        var userId = data.user_id;
        if (userId === undefined || typeof userId !== 'string') {
            this.apiInstance.logger.verbose("`user_id` key missing or invalid in `user_left` payload: " + data);
            return;
        }
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        this.currentUser.roomStore
            .room(roomId)
            .then(function (room) {
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.userStore
                .user(userId)
                .then(function (user) {
                var roomUserIdIndex = room.userIds.indexOf(user.id);
                if (roomUserIdIndex > -1) {
                    room.userIds.splice(roomUserIdIndex, 1);
                }
                room.userStore.remove(user.id);
                if (_this.delegate && _this.delegate.userLeftRoom) {
                    _this.delegate.userLeftRoom(room, user);
                }
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.userLeft) {
                        room.subscription.delegate.userLeft(user);
                    }
                }
                _this.apiInstance.logger.verbose("User " + user.id + " left room " + room.name);
            })
                .catch(function (error) {
                _this.apiInstance.logger.verbose("User with id " + userId + " left room with id " + roomId + " but no information about the user could be retrieved. Error was: " + error);
                return;
            });
        })
            .catch(function (error) {
            _this.apiInstance.logger.verbose("User with id " + userId + " joined room with id " + roomId + " but no information about the room could be retrieved. Error was: " + error);
            return;
        });
    };
    UserSubscription.prototype.parseIsTypingPayload = function (eventName, data, userId) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || typeof roomId !== 'number') {
            this.apiInstance.logger.verbose("`room_id` key missing or invalid in `typing_start` payload: " + data);
            return;
        }
        if (!this.typingTimers[roomId]) {
            this.typingTimers[roomId] = {};
        }
        if (this.typingTimers[roomId][userId]) {
            clearTimeout(this.typingTimers[roomId][userId]);
        }
        else {
            this.startedTyping(roomId, userId);
        }
        this.typingTimers[roomId][userId] = setTimeout(function () {
            _this.stoppedTyping(roomId, userId);
            delete _this.typingTimers[roomId][userId];
        }, constants_1.TYPING_REQ_TTL);
    };
    UserSubscription.prototype.startedTyping = function (roomId, userId) {
        var _this = this;
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        this.currentUser.roomStore
            .room(roomId)
            .then(function (room) {
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.userStore
                .user(userId)
                .then(function (user) {
                if (_this.delegate && _this.delegate.userStartedTyping) {
                    _this.delegate.userStartedTyping(room, user);
                }
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.userStartedTyping) {
                        room.subscription.delegate.userStartedTyping(user);
                    }
                }
                _this.apiInstance.logger.verbose("User " + user.id + " started typing in room " + room.name);
            })
                .catch(function (error) {
                _this.apiInstance.logger.verbose("Error fetching information for user " + userId + ":", error);
                return;
            });
        })
            .catch(function (error) {
            _this.apiInstance.logger.verbose("Error fetching information for room " + roomId + ":", error);
            return;
        });
    };
    UserSubscription.prototype.stoppedTyping = function (roomId, userId) {
        var _this = this;
        if (!this.currentUser) {
            this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
            return;
        }
        this.currentUser.roomStore
            .room(roomId)
            .then(function (room) {
            if (!_this.currentUser) {
                _this.apiInstance.logger.verbose('currentUser property not set on UserSubscription');
                return;
            }
            _this.currentUser.userStore
                .user(userId)
                .then(function (user) {
                if (_this.delegate && _this.delegate.userStoppedTyping) {
                    _this.delegate.userStoppedTyping(room, user);
                }
                if (room.subscription === undefined) {
                    _this.apiInstance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate &&
                        room.subscription.delegate.userStoppedTyping) {
                        room.subscription.delegate.userStoppedTyping(user);
                    }
                }
                _this.apiInstance.logger.verbose("User " + user.id + " stopped typing in room " + room.name);
            })
                .catch(function (error) {
                _this.apiInstance.logger.debug("Error fetching information for user " + userId + ":", error);
                return;
            });
        })
            .catch(function (error) {
            _this.apiInstance.logger.debug("Error fetching information for room " + roomId + ":", error);
            return;
        });
    };
    return UserSubscription;
}());
exports.default = UserSubscription;


/***/ })
/******/ ]);
});