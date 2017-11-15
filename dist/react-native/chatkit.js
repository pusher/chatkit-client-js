module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var current_user_1 = __webpack_require__(9);
var presence_state_1 = __webpack_require__(3);
var room_1 = __webpack_require__(13);
var user_1 = __webpack_require__(17);
var PayloadDeserializer = (function () {
    function PayloadDeserializer() {
    }
    PayloadDeserializer.createUserFromPayload = function (userPayload) {
        var basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);
        return new user_1.default({
            id: basicUser.id,
            createdAt: basicUser.createdAt,
            updatedAt: basicUser.updatedAt,
            name: userPayload.name,
            avatarURL: userPayload.avatar_url,
            customData: userPayload.custom_data,
        });
    };
    PayloadDeserializer.createCurrentUserFromPayload = function (userPayload, instance, userStore) {
        var basicUser = PayloadDeserializer.createBasicUserFromPayload(userPayload);
        return new current_user_1.default({
            id: basicUser.id,
            createdAt: basicUser.createdAt,
            updatedAt: basicUser.updatedAt,
            name: userPayload.name,
            avatarURL: userPayload.avatar_url,
            customData: userPayload.custom_data,
            instance: instance,
            userStore: userStore,
        });
    };
    PayloadDeserializer.createRoomFromPayload = function (roomPayload) {
        var requiredFieldsWithTypes = {
            id: 'number',
            name: 'string',
            private: 'boolean',
            created_by_id: 'string',
            created_at: 'string',
            updated_at: 'string',
        };
        Object.keys(requiredFieldsWithTypes).forEach(function (key) {
            if (roomPayload[key] === undefined) {
                throw new Error("Payload missing key: " + key);
            }
            var receivedType = typeof roomPayload[key];
            var expectedType = requiredFieldsWithTypes[key];
            if (receivedType !== expectedType) {
                throw new Error("Value for key: " + key + " in payload was " + receivedType + ", expected " + expectedType);
            }
        });
        var memberUserIds;
        if (roomPayload.member_user_ids) {
            memberUserIds = roomPayload.member_user_ids;
        }
        return new room_1.default({
            id: roomPayload.id,
            name: roomPayload.name,
            isPrivate: roomPayload.private,
            createdByUserId: roomPayload.created_by_id,
            createdAt: roomPayload.created_at,
            updatedAt: roomPayload.updated_at,
            deletedAt: roomPayload.deleted_at,
            userIds: memberUserIds,
        });
    };
    PayloadDeserializer.createBasicMessageFromPayload = function (messagePayload) {
        var requiredFieldsWithTypes = {
            id: 'number',
            user_id: 'string',
            room_id: 'number',
            text: 'string',
            created_at: 'string',
            updated_at: 'string',
        };
        Object.keys(requiredFieldsWithTypes).forEach(function (key) {
            if (messagePayload[key] === undefined) {
                throw new Error("Payload missing key: " + key);
            }
            var receivedType = typeof messagePayload[key];
            var expectedType = requiredFieldsWithTypes[key];
            if (receivedType !== expectedType) {
                throw new Error("Value for key: " + key + " in payload was " + receivedType + ", expected " + expectedType);
            }
        });
        return {
            id: messagePayload.id,
            senderId: messagePayload.user_id,
            roomId: messagePayload.id,
            text: messagePayload.text,
            createdAt: messagePayload.created_at,
            updatedAt: messagePayload.updated_at,
        };
    };
    PayloadDeserializer.createPresencePayloadFromPayload = function (payload) {
        var requiredFieldsWithTypes = {
            user_id: 'string',
            state: 'string',
        };
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
        var state = new presence_state_1.default(payload.state);
        return {
            userId: payload.user_id,
            state: state,
            lastSeenAt: payload.last_seen_at,
        };
    };
    PayloadDeserializer.createBasicUserFromPayload = function (payload) {
        var requiredFieldsWithTypes = {
            id: 'string',
            created_at: 'string',
            updated_at: 'string',
        };
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
        return {
            id: payload.id,
            createdAt: payload.created_at,
            updatedAt: payload.updated_at,
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
        .join("&");
}
exports.urlEncode = urlEncode;
function queryString(data) {
    var encodedData = urlEncode(data);
    return encodedData ? "?" + encodedData : "";
}
exports.queryString = queryString;
var querylessUrlAndQueryObjectFromFullUrl = function (urlString) {
    if (urlString.indexOf('?') === -1) {
        return {
            querylessUrl: urlString,
            queryObject: {},
        };
    }
    var splitUrl = urlString.split("?");
    var querylessUrl = splitUrl[0];
    var queryString = splitUrl.slice(1).join("&");
    return {
        querylessUrl: querylessUrl,
        queryObject: queryParamObject(queryString),
    };
};
var queryParamObject = function (queryParamString) {
    return queryParamString
        .split("&")
        .map(function (str) {
        var _a = str.split('='), key = _a[0], value = _a[1];
        return _b = {}, _b[key] = decodeURI(value), _b;
        var _b;
    })
        .reduce(function (prev, curr) { return Object.assign(prev, curr); });
};
exports.mergeQueryParamsIntoUrl = function (urlString, queryParams) {
    var _a = querylessUrlAndQueryObjectFromFullUrl(urlString), querylessUrl = _a.querylessUrl, queryObject = _a.queryObject;
    var fullQueryString = queryString(Object.assign(queryObject, queryParams));
    var t = "" + querylessUrl + fullQueryString;
    return t;
};
function allPromisesSettled(promises) {
    return Promise.all(promises.map(function (p) { return Promise.resolve(p).then(function (v) { return ({
        state: 'fulfilled',
        value: v,
    }); }, function (r) { return ({
        state: 'rejected',
        reason: r,
    }); }); }));
}
exports.allPromisesSettled = allPromisesSettled;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(20);


/***/ }),
/* 3 */
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
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
var global_user_store_1 = __webpack_require__(10);
var user_subscription_1 = __webpack_require__(18);
var ChatManager = (function () {
    function ChatManager(options) {
        this.tokenProvider = options.tokenProvider;
        this.instance = new pusher_platform_1.Instance({
            locator: options.instanceLocator,
            serviceName: 'chatkit',
            serviceVersion: 'v1',
            tokenProvider: options.tokenProvider,
            client: options.baseClient,
            logger: options.logger,
        });
        this.userStore = new global_user_store_1.default({ instance: this.instance });
    }
    ChatManager.prototype.connect = function (options) {
        this.userSubscription = new user_subscription_1.default({
            delegate: options.delegate,
            instance: this.instance,
            userStore: this.userStore,
            connectCompletionHandler: function (currentUser, error) {
                if (currentUser) {
                    options.onSuccess(currentUser);
                }
                else {
                    options.onError(error);
                }
            }
        });
        this.instance.subscribeNonResuming({
            path: '/users',
            listeners: {
                onEvent: this.userSubscription.handleEvent.bind(this.userSubscription),
            }
        });
    };
    return ChatManager;
}());
exports.default = ChatManager;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
Object.defineProperty(exports, "__esModule", { value: true });
var PCancelable = __webpack_require__(7);
var utils_1 = __webpack_require__(1);
var TokenProvider = (function () {
    function TokenProvider(options) {
        this.url = options.url;
        this.userId = options.userId;
        this.authContext = options.authContext || {};
    }
    TokenProvider.prototype.fetchToken = function (tokenParams) {
        return this.makeAuthRequest().then(function (responseBody) {
            return responseBody.access_token;
        });
    };
    TokenProvider.prototype.clearToken = function (token) {
    };
    TokenProvider.prototype.makeAuthRequest = function () {
        var _this = this;
        return new PCancelable(function (onCancel, resolve, reject) {
            var xhr = new global.XMLHttpRequest();
            var url;
            if (_this.userId === undefined) {
                url = utils_1.mergeQueryParamsIntoUrl(_this.url, _this.authContext.queryParams);
            }
            else {
                var authContextWithUserId = Object.assign({}, _this.authContext.queryParams, { user_id: _this.userId });
                url = utils_1.mergeQueryParamsIntoUrl(_this.url, authContextWithUserId);
            }
            xhr.open("POST", url);
            if (_this.authContext.headers !== undefined) {
                Object.keys(_this.authContext.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, _this.authContext.headers[key]);
                });
            }
            xhr.timeout = 30 * 1000;
            xhr.onload = function () {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
                else {
                    reject(new Error("Couldn't fetch token from " + _this.url + "; got " + xhr.status + " " + xhr.statusText + "."));
                }
            };
            xhr.ontimeout = function () {
                reject(new Error("Request timed out while fetching token from " + _this.url));
            };
            xhr.onerror = function (error) {
                reject(error);
            };
            xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            xhr.send(utils_1.urlEncode({
                grant_type: "client_credentials",
            }));
        });
    };
    TokenProvider.prototype.unixTimeNow = function () {
        return Math.floor(Date.now() / 1000);
    };
    return TokenProvider;
}());
exports.default = TokenProvider;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(19)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class CancelError extends Error {
	constructor() {
		super('Promise was canceled');
		this.name = 'CancelError';
	}
}

class PCancelable {
	static fn(fn) {
		return function () {
			const args = [].slice.apply(arguments);
			return new PCancelable((onCancel, resolve, reject) => {
				args.unshift(onCancel);
				fn.apply(null, args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._pending = true;
		this._canceled = false;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			return executor(
				fn => {
					this._cancel = fn;
				},
				val => {
					this._pending = false;
					resolve(val);
				},
				err => {
					this._pending = false;
					reject(err);
				}
			);
		});
	}

	then() {
		return this._promise.then.apply(this._promise, arguments);
	}

	catch() {
		return this._promise.catch.apply(this._promise, arguments);
	}

	cancel() {
		if (!this._pending || this._canceled) {
			return;
		}

		if (typeof this._cancel === 'function') {
			try {
				this._cancel();
			} catch (err) {
				this._reject(err);
			}
		}

		this._canceled = true;
		this._reject(new CancelError());
	}

	get canceled() {
		return this._canceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.CancelError = CancelError;


/***/ }),
/* 8 */
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
            onSuccess: onSuccess,
            onError: onError,
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
        this.userStore.user(basicMessageSenderId, function (user) {
            var basicMessageIds = _this.userIdsToBasicMessageIds[basicMessageSenderId];
            if (basicMessageIds === undefined) {
                _this.logger.verbose("Fetched user information for user with id " + user.id + " but no messages needed information for this user");
                return;
            }
            var basicMessages = basicMessageIds.map(function (bmId) {
                return _this.messagesAwaitingEnrichmentDependentOnUserRetrieval[bmId];
            }).filter(function (el) { return el !== undefined; });
            _this.enrichMessagesWithUser(user, basicMessages);
            var indexToRemove = _this.userIdsBeingRetrieved.indexOf(basicMessageSenderId);
            if (indexToRemove > -1) {
                _this.userIdsBeingRetrieved.splice(indexToRemove, 1);
            }
        }, function (error) {
            _this.logger.debug("Unable to find user with id " + basicMessage.senderId + ", associated with message " + basicMessageId + ". Error: " + error);
            _this.callCompletionHandlersForEnrichedMessagesWithIdsLessThanOrEqualTo(basicMessageId, error);
        });
    };
    BasicMessageEnricher.prototype.enrichMessagesWithUser = function (user, messages) {
        var _this = this;
        messages.forEach(function (basicMessage) {
            var message = {
                id: basicMessage.id,
                text: basicMessage.text,
                createdAt: basicMessage.createdAt,
                updatedAt: basicMessage.updatedAt,
                sender: user,
                room: _this.room,
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
            var result_1 = this.enrichedMessagesAwaitingCompletionCalls[messageId];
            if (result_1 === undefined) {
                this.logger.verbose("Enrichment result not stored for message id " + messageId);
                return;
            }
            if (result_1['sender'] !== undefined) {
                completionHandler.onSuccess(result_1);
            }
            else {
                completionHandler.onError(result_1);
            }
            this.completionOrderList.shift();
            this.messageIdToCompletionHandlers[messageId] = undefined;
            this.enrichedMessagesAwaitingCompletionCalls[messageId] = undefined;
        } while (this.completionOrderList[0] !== undefined && this.enrichedMessagesAwaitingCompletionCalls[this.completionOrderList[0]] !== undefined);
    };
    return BasicMessageEnricher;
}());
exports.default = BasicMessageEnricher;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var basic_message_enricher_1 = __webpack_require__(8);
var payload_deserializer_1 = __webpack_require__(0);
var presence_subscription_1 = __webpack_require__(12);
var room_store_1 = __webpack_require__(14);
var room_subscription_1 = __webpack_require__(15);
var utils_1 = __webpack_require__(1);
var CurrentUser = (function () {
    function CurrentUser(options) {
        var rooms = options.rooms, id = options.id, instance = options.instance;
        var validRooms = rooms || [];
        this.id = id;
        this.createdAt = options.createdAt;
        this.updatedAt = options.updatedAt;
        this.name = options.name;
        this.avatarURL = options.avatarURL;
        this.customData = options.customData;
        this.roomStore = new room_store_1.default({ instance: instance, rooms: validRooms });
        this.instance = instance;
        this.userStore = options.userStore;
        this.pathFriendlyId = encodeURIComponent(id);
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
            instance: this.instance,
            userStore: this.userStore,
            roomStore: this.roomStore,
            delegate: delegate,
        });
        this.instance.subscribeNonResuming({
            path: "/users/" + this.id + "/presence",
            listeners: {
                onEvent: this.presenceSubscription.handleEvent.bind(this.presenceSubscription),
            }
        });
    };
    CurrentUser.prototype.createRoom = function (options, onSuccess, onError) {
        var _this = this;
        var roomData = {
            name: options.name,
            created_by_id: this.id,
            private: options.private || false,
        };
        if (options.addUserIds && options.addUserIds.length > 0) {
            roomData['user_ids'] = options.addUserIds;
        }
        this.instance.request({
            method: 'POST',
            path: '/rooms',
            body: roomData,
        }).then(function (res) {
            var roomPayload = JSON.parse(res);
            var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            var addedOrMergedRoom = _this.roomStore.addOrMerge(room);
            _this.populateRoomUserStore(addedOrMergedRoom);
            onSuccess(addedOrMergedRoom);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error creating room: " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.populateRoomUserStore = function (room) {
        var _this = this;
        var userPromises = new Array();
        room.userIds.forEach(function (userId) {
            var userPromise = new Promise(function (resolve, reject) {
                _this.userStore.user(userId, function (user) {
                    room.userStore.addOrMerge(user);
                    resolve();
                }, function (error) {
                    _this.instance.logger.debug("Unable to add user with id " + userId + " to room (room.name):: " + error);
                    reject();
                });
            });
            userPromises.push(userPromise);
        });
        utils_1.allPromisesSettled(userPromises).then(function () {
            if (room.subscription === undefined) {
                _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
            }
            else {
                if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                    room.subscription.delegate.usersUpdated();
                }
            }
            _this.instance.logger.verbose("Users updated in room " + room.name);
        });
    };
    CurrentUser.prototype.addUser = function (id, roomId, onSuccess, onError) {
        this.addOrRemoveUsers(roomId, [id], 'add', onSuccess, onError);
    };
    CurrentUser.prototype.removeUser = function (id, roomId, onSuccess, onError) {
        this.addOrRemoveUsers(roomId, [id], 'remove', onSuccess, onError);
    };
    CurrentUser.prototype.updateRoom = function (roomId, options, onSuccess, onError) {
        var _this = this;
        if (options.name === undefined && options.isPrivate === undefined) {
            onSuccess();
            return;
        }
        var roomPayload = {};
        if (options.name) {
            roomPayload['name'] = options.name;
        }
        if (options.isPrivate) {
            roomPayload['private'] = options.isPrivate;
        }
        this.instance.request({
            method: 'PUT',
            path: "/rooms/" + roomId,
            body: roomPayload,
        }).then(function (res) {
            onSuccess();
        }).catch(function (error) {
            _this.instance.logger.verbose("Error updating room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.deleteRoom = function (roomId, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: 'DELETE',
            path: "/rooms/" + roomId,
        }).then(function (res) {
            onSuccess();
        }).catch(function (error) {
            _this.instance.logger.verbose("Error deleting room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.addOrRemoveUsers = function (roomId, userIds, membershipChange, onSuccess, onError) {
        var _this = this;
        var usersPayload = {
            user_ids: userIds,
        };
        this.instance.request({
            method: 'PUT',
            path: "/rooms/" + roomId + "/users/" + membershipChange,
            body: usersPayload,
        }).then(function (res) {
            onSuccess();
        }).catch(function (error) {
            _this.instance.logger.verbose("Error when attempting to " + membershipChange + " users from room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.joinRoom = function (roomId, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: 'POST',
            path: "/users/" + this.pathFriendlyId + "/rooms/" + roomId + "/join",
        }).then(function (res) {
            var roomPayload = JSON.parse(res);
            var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            var addedOrMergedRoom = _this.roomStore.addOrMerge(room);
            _this.populateRoomUserStore(addedOrMergedRoom);
            onSuccess(addedOrMergedRoom);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error joining room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.leaveRoom = function (roomId, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: 'POST',
            path: "/users/" + this.pathFriendlyId + "/rooms/" + roomId + "/leave",
        }).then(function (res) {
            onSuccess();
        }).catch(function (error) {
            _this.instance.logger.verbose("Error leaving room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.getJoinedRooms = function (onSuccess, onError) {
        this.getUserRooms(false, onSuccess, onError);
    };
    CurrentUser.prototype.getJoinableRooms = function (onSuccess, onError) {
        this.getUserRooms(true, onSuccess, onError);
    };
    CurrentUser.prototype.getUserRooms = function (onlyJoinable, onSuccess, onError) {
        var joinableQueryItemValue = onlyJoinable ? 'true' : 'false';
        this.getRooms("/users/" + this.pathFriendlyId + "/rooms?joinable=" + joinableQueryItemValue, onSuccess, onError);
    };
    CurrentUser.prototype.getAllRooms = function (onSuccess, onError) {
        this.getRooms('/rooms', onSuccess, onError);
    };
    CurrentUser.prototype.getRooms = function (path, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: 'GET',
            path: path,
        }).then(function (res) {
            var roomsPayload = JSON.parse(res);
            var rooms = roomsPayload.map(function (roomPayload) {
                return payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            });
            onSuccess(rooms);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error when getting instance rooms: " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.typingStateChange = function (eventPayload, roomId, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: 'POST',
            path: "/rooms/" + roomId + "/events",
            body: eventPayload,
        }).then(function (res) {
            onSuccess();
        }).catch(function (error) {
            _this.instance.logger.verbose("Error sending typing state change in room " + roomId + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.startedTypingIn = function (roomId, onSuccess, onError) {
        var eventPayload = {
            name: 'typing_start',
            user_id: this.id,
        };
        this.typingStateChange(eventPayload, roomId, onSuccess, onError);
    };
    CurrentUser.prototype.stoppedTypingIn = function (roomId, onSuccess, onError) {
        var eventPayload = {
            name: 'typing_stop',
            user_id: this.id,
        };
        this.typingStateChange(eventPayload, roomId, onSuccess, onError);
    };
    CurrentUser.prototype.addMessage = function (text, room, onSuccess, onError) {
        var _this = this;
        var messageObject = {
            text: text,
            user_id: this.id,
        };
        this.instance.request({
            method: 'POST',
            path: "/rooms/" + room.id + "/messages",
            body: messageObject,
        }).then(function (res) {
            var messageIdPayload = JSON.parse(res);
            var messageId = messageIdPayload.message_id;
            onSuccess(messageId);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error adding message to room " + room.name + ": " + error);
            onError(error);
        });
    };
    CurrentUser.prototype.subscribeToRoom = function (room, roomDelegate, messageLimit) {
        if (messageLimit === void 0) { messageLimit = 20; }
        room.subscription = new room_subscription_1.default({
            delegate: roomDelegate,
            basicMessageEnricher: new basic_message_enricher_1.default(this.userStore, room, this.instance.logger),
            logger: this.instance.logger
        });
        this.instance.subscribeNonResuming({
            path: "/rooms/" + room.id + "?message_limit=" + messageLimit,
            listeners: {
                onEvent: room.subscription.handleEvent.bind(room.subscription),
            }
        });
    };
    CurrentUser.prototype.fetchMessagesFromRoom = function (room, fetchOptions, onSuccess, onError) {
        var _this = this;
        var initialIdQueryParam = fetchOptions.initialId ? "initial_id=" + fetchOptions.initialId : '';
        var limitQueryParam = fetchOptions.limit ? "limit=" + fetchOptions.limit : '';
        var directionQueryParam = fetchOptions.direction ? "direction=" + fetchOptions.direction : 'direction=older';
        var combinedQueryParams = [
            initialIdQueryParam,
            limitQueryParam,
            directionQueryParam,
        ].join('&');
        this.instance.request({
            method: 'GET',
            path: "/rooms/" + room.id + "/messages",
        }).then(function (res) {
            var messagesPayload = JSON.parse(res);
            var messages = new Array();
            var basicMessages = new Array();
            var messageUserIds = messagesPayload.map(function (messagePayload) {
                var basicMessage = payload_deserializer_1.default.createBasicMessageFromPayload(messagePayload);
                basicMessages.push(basicMessage);
                return basicMessage.id;
            });
            var messageUserIdsSet = new Set(messageUserIds);
            var userIdsToFetch = Array.from(messageUserIdsSet.values());
            _this.userStore.fetchUsersWithIds(userIdsToFetch, function (users) {
                var messageEnricher = new basic_message_enricher_1.default(_this.userStore, room, _this.instance.logger);
                var enrichmentPromises = new Array();
                basicMessages.forEach(function (basicMessage) {
                    var enrichmentPromise = new Promise(function (resolve, reject) {
                        messageEnricher.enrich(basicMessage, function (message) {
                            messages.push(message);
                            resolve();
                        }, function (error) {
                            _this.instance.logger.verbose("Unable to enrich basic mesage " + basicMessage.id + ": " + error);
                            reject();
                        });
                    });
                    enrichmentPromises.push(enrichmentPromise);
                });
                utils_1.allPromisesSettled(enrichmentPromises).then(function () {
                    if (room.subscription === undefined) {
                        _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                    }
                    else {
                        if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                            room.subscription.delegate.usersUpdated();
                        }
                    }
                    _this.instance.logger.verbose("Users updated in room " + room.name);
                    onSuccess(messages.sort(function (msgOne, msgTwo) { return msgOne.id - msgTwo.id; }));
                });
            }, function (error) {
                _this.instance.logger.verbose("Error fetching users with ids " + userIdsToFetch + ": " + error);
            });
        }).catch(function (error) {
            _this.instance.logger.verbose("Error fetching messages froom room " + room.name + ": " + error);
            onError(error);
        });
    };
    return CurrentUser;
}());
exports.default = CurrentUser;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var user_store_core_1 = __webpack_require__(4);
var utils_1 = __webpack_require__(1);
var GlobalUserStore = (function () {
    function GlobalUserStore(options) {
        this.instance = options.instance;
        this.userStoreCore = options.userStoreCore || new user_store_core_1.default();
    }
    GlobalUserStore.prototype.addOrMerge = function (user) {
        return this.userStoreCore.addOrMerge(user);
    };
    GlobalUserStore.prototype.remove = function (id) {
        return this.userStoreCore.remove(id);
    };
    GlobalUserStore.prototype.user = function (id, onSuccess, onError) {
        this.findOrGetUser(id, onSuccess, onError);
    };
    GlobalUserStore.prototype.findOrGetUser = function (id, onSuccess, onError) {
        var user = this.userStoreCore.find(id);
        if (user) {
            onSuccess(user);
            return;
        }
        this.getUser(id, onSuccess, onError);
    };
    GlobalUserStore.prototype.getUser = function (id, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: "GET",
            path: "/users/" + id,
        }).then(function (res) {
            var userPayload = JSON.parse(res);
            var user = payload_deserializer_1.default.createUserFromPayload(userPayload);
            var userToReturn = _this.addOrMerge(user);
            onSuccess(userToReturn);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error fetching user information: " + error);
            onError(error);
        });
    };
    GlobalUserStore.prototype.handleInitialPresencePayloadsAfterRoomJoin = function (payloads, onComplete) {
        this.handleInitialPresencePayloads(payloads, onComplete);
    };
    GlobalUserStore.prototype.handleInitialPresencePayloads = function (payloads, onComplete) {
        var _this = this;
        var presencePayloadPromises = new Array();
        payloads.forEach(function (payload) {
            var presencePromise = new Promise(function (resolve, reject) {
                _this.user(payload.userId, function (user) {
                    user.updatePresenceInfoIfAppropriate(payload);
                    resolve();
                }, function (error) {
                    _this.instance.logger.verbose("Error fetching user information: " + error);
                    reject();
                });
            });
            presencePayloadPromises.push(presencePromise);
        });
        utils_1.allPromisesSettled(presencePayloadPromises).then(function () {
            onComplete();
        });
    };
    GlobalUserStore.prototype.fetchUsersWithIds = function (userIds, onSuccess, onError) {
        var _this = this;
        if (userIds.length === 0) {
            this.instance.logger.verbose('Requested to fetch users for a list of user ids which was empty');
            onSuccess([]);
            return;
        }
        var userIdsString = userIds.join(',');
        var qs = utils_1.queryString({ user_ids: userIdsString });
        this.instance.request({
            method: "GET",
            path: "/users_by_ids" + qs,
        }).then(function (res) {
            var usersPayload = JSON.parse(res);
            var users = usersPayload.map(function (userPayload) {
                var user = payload_deserializer_1.default.createUserFromPayload(userPayload);
                var addedOrUpdatedUser = _this.userStoreCore.addOrMerge(user);
                return addedOrUpdatedUser;
            });
            onSuccess(users);
        }).catch(function (error) {
            _this.instance.logger.verbose("Error fetching user information: " + error);
            onError(error);
        });
    };
    GlobalUserStore.prototype.initialFetchOfUsersWithIds = function (userIds, onSuccess, onError) {
        this.fetchUsersWithIds(userIds, onSuccess, onError);
    };
    return GlobalUserStore;
}());
exports.default = GlobalUserStore;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var pusher_platform_1 = __webpack_require__(2);
exports.BaseClient = pusher_platform_1.BaseClient;
var chat_manager_1 = __webpack_require__(5);
exports.ChatManager = chat_manager_1.default;
var token_provider_1 = __webpack_require__(6);
exports.TokenProvider = token_provider_1.default;
exports.default = {
    ChatManager: chat_manager_1.default,
    TokenProvider: token_provider_1.default,
    BaseClient: pusher_platform_1.BaseClient,
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var PresenceSubscription = (function () {
    function PresenceSubscription(options) {
        this.instance = options.instance;
        this.userStore = options.userStore;
        this.roomStore = options.roomStore;
        this.delegate = options.delegate;
    }
    PresenceSubscription.prototype.handleEvent = function (event) {
        var body = event.body, eventId = event.eventId, headers = event.headers;
        var data = body.data;
        var eventName = body.event_name;
        this.instance.logger.verbose("Received event type: " + eventName + ", and data: " + data);
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
                this.instance.logger.verbose("Unsupported event type received: " + eventName + ", and data: " + data);
                break;
        }
    };
    PresenceSubscription.prototype.end = function () {
    };
    PresenceSubscription.prototype.parseInitialStatePayload = function (eventName, data, userStore) {
        var _this = this;
        var userStatesPayload = data.user_states;
        if (userStatesPayload === undefined || userStatesPayload.constructor !== Array) {
            this.instance.logger.debug("'user_stats' value missing from " + eventName + " presence payload: " + data);
            return;
        }
        var userStates = userStatesPayload.map(function (userStatePayload) {
            return payload_deserializer_1.default.createPresencePayloadFromPayload(userStatePayload);
        }).filter(function (el) { return el !== undefined; });
        if (userStates.length === 0) {
            this.instance.logger.verbose('No presence user states to process');
            return;
        }
        this.userStore.handleInitialPresencePayloads(userStates, function () {
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                        room.subscription.delegate.usersUpdated();
                    }
                }
                _this.instance.logger.verbose("Users updated in room " + room.name);
            });
        });
    };
    PresenceSubscription.prototype.parsePresenceUpdatePayload = function (eventName, data, userStore) {
        var _this = this;
        var presencePayload = payload_deserializer_1.default.createPresencePayloadFromPayload(data);
        userStore.user(presencePayload.userId, function (user) {
            user.updatePresenceInfoIfAppropriate(presencePayload);
            switch (presencePayload.state.stringValue) {
                case 'online':
                    if (_this.delegate.userCameOnline) {
                        _this.delegate.userCameOnline(user);
                    }
                    _this.instance.logger.verbose(user.id + " came online");
                    break;
                case 'offline':
                    if (_this.delegate.userWentOffline) {
                        _this.delegate.userWentOffline(user);
                    }
                    _this.instance.logger.verbose(user.id + " went offline");
                    break;
                case 'unknown':
                    _this.instance.logger.verbose("Somehow the presence state of user " + user.id + " is unknown");
                    break;
            }
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                    return;
                }
                if (room.userIds.indexOf(user.id) > -1) {
                    switch (presencePayload.state.stringValue) {
                        case 'online':
                            if (room.subscription.delegate && room.subscription.delegate.userCameOnlineInRoom) {
                                room.subscription.delegate.userCameOnlineInRoom(user);
                            }
                            break;
                        case 'offline':
                            if (room.subscription.delegate && room.subscription.delegate.userWentOfflineInRoom) {
                                room.subscription.delegate.userWentOfflineInRoom(user);
                            }
                            break;
                        default:
                            break;
                    }
                }
            });
        }, function (error) {
            _this.instance.logger.debug("Error fetching user information for user with id " + presencePayload.userId + ": " + error);
            return;
        });
    };
    PresenceSubscription.prototype.parseJoinRoomPresenceUpdatePayload = function (eventName, data, userStore) {
        var _this = this;
        var userStatesPayload = data.user_states;
        if (userStatesPayload === undefined || userStatesPayload.constructor !== Array) {
            this.instance.logger.debug("'user_stats' value missing from " + eventName + " presence payload: " + data);
            return;
        }
        var userStates = userStatesPayload.map(function (userStatePayload) {
            return payload_deserializer_1.default.createPresencePayloadFromPayload(userStatePayload);
        }).filter(function (el) { return el !== undefined; });
        if (userStates.length === 0) {
            this.instance.logger.verbose('No presence user states to process');
            return;
        }
        this.userStore.handleInitialPresencePayloads(userStates, function () {
            _this.roomStore.rooms.forEach(function (room) {
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                        room.subscription.delegate.usersUpdated();
                    }
                }
                _this.instance.logger.verbose("Users updated in room " + room.name);
            });
        });
    };
    return PresenceSubscription;
}());
exports.default = PresenceSubscription;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var room_user_store_1 = __webpack_require__(16);
var Room = (function () {
    function Room(options) {
        this.id = options.id;
        this.name = options.name;
        this.isPrivate = options.isPrivate;
        this.createdByUserId = options.createdByUserId;
        this.createdAt = options.createdAt;
        this.updatedAt = options.updatedAt;
        this.deletedAt = options.deletedAt;
        this.userIds = options.userIds;
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var RoomStore = (function () {
    function RoomStore(options) {
        this.rooms = options.rooms;
        this.instance = options.instance;
    }
    RoomStore.prototype.room = function (id, onSuccess, onError) {
        this.findOrGetRoom(id, onSuccess, onError);
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
    RoomStore.prototype.findOrGetRoom = function (id, onSuccess, onError) {
        var room = this.rooms.find(function (el) { return el.id === id; });
        if (room) {
            onSuccess(room);
        }
        else {
            this.getRoom(id, onSuccess, onError);
        }
    };
    RoomStore.prototype.getRoom = function (id, onSuccess, onError) {
        var _this = this;
        this.instance.request({
            method: "GET",
            path: "/rooms/" + id,
        }).then(function (res) {
            var roomPayload = JSON.parse(res);
            var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            onSuccess(room);
        }).catch(function (error) {
            _this.instance.logger.debug("Error fetching room " + id + ": " + error);
            onError(error);
        });
    };
    return RoomStore;
}());
exports.default = RoomStore;


/***/ }),
/* 15 */
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
        this.logger.verbose("Received event name: " + eventName + ", and data: " + data);
        var basicMessage = payload_deserializer_1.default.createBasicMessageFromPayload(data);
        this.basicMessageEnricher.enrich(basicMessage, function (message) {
            _this.logger.verbose("Room received new message: " + message.text);
            if (_this.delegate && _this.delegate.newMessage) {
                _this.delegate.newMessage(message);
            }
        }, function (error) {
            _this.logger.debug("Error receiving new message: " + error);
        });
    };
    return RoomSubscription;
}());
exports.default = RoomSubscription;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var user_store_core_1 = __webpack_require__(4);
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var presence_state_1 = __webpack_require__(3);
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payload_deserializer_1 = __webpack_require__(0);
var utils_1 = __webpack_require__(1);
var UserSubscription = (function () {
    function UserSubscription(options) {
        this.instance = options.instance;
        this.userStore = options.userStore;
        this.delegate = options.delegate;
        this.connectCompletionHandlers = [options.connectCompletionHandler];
    }
    UserSubscription.prototype.handleEvent = function (event) {
        var body = event.body, eventId = event.eventId, headers = event.headers;
        var data = body.data;
        var eventName = body.event_name;
        this.instance.logger.verbose("Received event name: " + eventName + ", and data: " + data);
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
                this.parseTypingStartPayload(eventName, data, data.user_id);
                break;
            case 'typing_stop':
                this.parseTypingStopPayload(eventName, data, data.user_id);
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
        var receivedCurrentUser = payload_deserializer_1.default.createCurrentUserFromPayload(userPayload, this.instance, this.userStore);
        var wasExistingCurrentUser = this.currentUser !== undefined;
        if (this.currentUser) {
            this.currentUser.updateWithPropertiesOf(receivedCurrentUser);
        }
        else {
            this.currentUser = receivedCurrentUser;
        }
        var receivedRoomsConstructor = roomsPayload.constructor;
        if (receivedRoomsConstructor !== Array) {
            throw TypeError("`rooms` key of initial_state payload was of type `${receivedRoomsConstructor}`, expected `Array`");
        }
        if (roomsPayload.length === 0) {
            this.currentUser.setupPresenceSubscription(this.delegate);
            this.callConnectCompletionHandlers(this.currentUser);
        }
        var combinedRoomUserIds = new Set([]);
        var roomsFromConnection = [];
        roomsPayload.forEach(function (roomPayload) {
            var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
            room.userIds.forEach(function (userId) {
                combinedRoomUserIds.add(userId);
            });
            roomsFromConnection.push(room);
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
        this.userStore.initialFetchOfUsersWithIds(userIdsArray, function (users) {
            var combinedRoomUsersPromises = new Array();
            _this.currentUser.roomStore.rooms.forEach(function (room) {
                var roomPromise = new Promise(function (roomResolve, roomReject) {
                    var roomUsersPromises = new Array();
                    room.userIds.forEach(function (userId) {
                        var userPromise = new Promise(function (userResolve, userReject) {
                            _this.userStore.user(userId, function (user) {
                                room.userStore.addOrMerge(user);
                                userResolve();
                            }, function (error) {
                                _this.instance.logger.verbose("Unable to fetch information about user " + userId);
                                userReject();
                            });
                        });
                        roomUsersPromises.push(userPromise);
                    });
                    utils_1.allPromisesSettled(roomUsersPromises).then(function () {
                        if (room.subscription === undefined) {
                            _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                        }
                        else {
                            if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                                room.subscription.delegate.usersUpdated();
                            }
                        }
                        _this.instance.logger.verbose("Users updated in room " + room.name + "\"");
                        roomResolve();
                    });
                });
                combinedRoomUsersPromises.push(roomPromise);
            });
            utils_1.allPromisesSettled(combinedRoomUsersPromises).then(function () {
                _this.currentUser.setupPresenceSubscription(_this.delegate);
            });
        }, function (error) {
            _this.instance.logger.debug("Unable to fetch user information after successful connection: " + error);
            return;
        });
    };
    UserSubscription.prototype.reconcileExistingRoomStoreWithRoomsReceivedOnConnection = function (roomsFromConnection) {
        var _this = this;
        if (!this.currentUser) {
            this.instance.logger.verbose('currentUser property of UserSubscription unset after successful connection');
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
        if (roomPayload === undefined || (typeof roomPayload) !== 'object') {
            this.instance.logger.verbose("`room` key missing or invalid in `added_to_room` payload: " + data);
            return;
        }
        var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
        var roomAdded = this.currentUser.roomStore.addOrMerge(room);
        if (this.delegate && this.delegate.addedToRoom) {
            this.delegate.addedToRoom(room);
        }
        this.instance.logger.verbose("Added to room: " + room.name);
        var roomUsersPromises = new Array();
        roomAdded.userIds.forEach(function (userId) {
            var userPromise = new Promise(function (resolve, reject) {
                _this.userStore.user(userId, function (user) {
                    _this.instance.logger.verbose("Added user id " + userId + " to room " + room.name);
                    room.userStore.addOrMerge(user);
                    resolve();
                }, function (error) {
                    _this.instance.logger.debug("Unable to add user with id " + userId + " to room " + room.name + ": " + error);
                    reject();
                });
            });
            roomUsersPromises.push(userPromise);
        });
        utils_1.allPromisesSettled(roomUsersPromises).then(function () {
            if (room.subscription === undefined) {
                _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
            }
            else {
                if (room.subscription.delegate && room.subscription.delegate.usersUpdated) {
                    room.subscription.delegate.usersUpdated();
                }
            }
            _this.instance.logger.verbose("Users updated in room " + room.name);
        });
    };
    UserSubscription.prototype.parseRemovedFromRoomPayload = function (eventName, data) {
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `removed_from_room` payload: " + data);
            return;
        }
        var roomRemoved = this.currentUser.roomStore.remove(roomId);
        if (roomRemoved) {
            if (this.delegate.removedFromRoom) {
                this.delegate.removedFromRoom(roomRemoved);
            }
            this.instance.logger.verbose("Removed from room: " + roomRemoved.name);
        }
        else {
            this.instance.logger.verbose("Received `removed_from_room` API event but room with ID " + roomId + " not found in local store of joined rooms");
            return;
        }
    };
    UserSubscription.prototype.parseRoomUpdatedPayload = function (eventName, data) {
        var _this = this;
        var roomPayload = data.room;
        if (roomPayload === undefined || (typeof roomPayload) !== 'object') {
            this.instance.logger.verbose("`room` key missing or invalid in `room_updated` payload: " + data);
            return;
        }
        var room = payload_deserializer_1.default.createRoomFromPayload(roomPayload);
        this.currentUser.roomStore.room(room.id, function (roomToUpdate) {
            roomToUpdate.updateWithPropertiesOfRoom(room);
            if (_this.delegate.roomUpdated) {
                _this.delegate.roomUpdated(roomToUpdate);
            }
            _this.instance.logger.verbose("Room updated: " + room.name);
        }, function (error) {
            _this.instance.logger.debug("Error updating room " + room.id + ": " + error);
        });
    };
    UserSubscription.prototype.parseRoomDeletedPayload = function (eventName, data) {
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `room_deleted` payload: " + data);
            return;
        }
        var deletedRoom = this.currentUser.roomStore.remove(roomId);
        if (deletedRoom) {
            if (this.delegate.roomDeleted) {
                this.delegate.roomDeleted(deletedRoom);
            }
            this.instance.logger.verbose("Room deleted: " + deletedRoom.name);
        }
        else {
            this.instance.logger.verbose("Received `room_deleted` API event but room with ID " + roomId + " not found in local store of joined rooms");
            return;
        }
    };
    UserSubscription.prototype.parseUserJoinedPayload = function (eventName, data) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `user_joined` payload: " + data);
            return;
        }
        var userId = data.user_id;
        if (userId === undefined || (typeof userId) !== 'string') {
            this.instance.logger.verbose("`user_id` key missing or invalid in `user_joined` payload: " + data);
            return;
        }
        this.currentUser.roomStore.room(roomId, function (room) {
            _this.currentUser.userStore.user(userId, function (user) {
                var addedOrMergedUser = room.userStore.addOrMerge(user);
                if (room.userIds.indexOf(addedOrMergedUser.id) === -1) {
                    room.userIds.push(addedOrMergedUser.id);
                }
                if (_this.delegate.userJoinedRoom) {
                    _this.delegate.userJoinedRoom(room, addedOrMergedUser);
                }
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.userJoined) {
                        room.subscription.delegate.userJoined(addedOrMergedUser);
                    }
                }
                _this.instance.logger.verbose("User " + user.id + " joined room: " + room.name);
            }, function (error) {
                _this.instance.logger.verbose("Error fetching user " + userId + ": " + error);
                return;
            });
        }, function (error) {
            _this.instance.logger.verbose("User with id " + userId + " joined room with id " + roomId + " but no information about the room could be retrieved. Error was: " + error);
            return;
        });
    };
    UserSubscription.prototype.parseUserLeftPayload = function (eventName, data) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `user_left` payload: " + data);
            return;
        }
        var userId = data.user_id;
        if (userId === undefined || (typeof userId) !== 'string') {
            this.instance.logger.verbose("`user_id` key missing or invalid in `user_left` payload: " + data);
            return;
        }
        this.currentUser.roomStore.room(roomId, function (room) {
            _this.currentUser.userStore.user(userId, function (user) {
                var roomUserIdIndex = room.userIds.indexOf(user.id);
                if (roomUserIdIndex > -1) {
                    room.userIds.splice(roomUserIdIndex, 1);
                }
                room.userStore.remove(user.id);
                if (_this.delegate.userLeftRoom) {
                    _this.delegate.userLeftRoom(room, user);
                }
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.userLeft) {
                        room.subscription.delegate.userLeft(user);
                    }
                }
                _this.instance.logger.verbose("User " + user.id + " left room " + room.name);
            }, function (error) {
                _this.instance.logger.verbose("User with id " + userId + " left room with id " + roomId + " but no information about the user could be retrieved. Error was: " + error);
                return;
            });
        }, function (error) {
            _this.instance.logger.verbose("User with id " + userId + " joined room with id " + roomId + " but no information about the room could be retrieved. Error was: " + error);
            return;
        });
    };
    UserSubscription.prototype.parseTypingStartPayload = function (eventName, data, userId) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `typing_start` payload: " + data);
            return;
        }
        this.currentUser.roomStore.room(roomId, function (room) {
            _this.currentUser.userStore.user(userId, function (user) {
                if (_this.delegate.userStartedTyping) {
                    _this.delegate.userStartedTyping(room, user);
                }
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.userStartedTyping) {
                        room.subscription.delegate.userStartedTyping(user);
                    }
                }
                _this.instance.logger.verbose("User " + user.id + " started typing in room " + room.name);
            }, function (error) {
                _this.instance.logger.verbose("Error fetching information for user " + userId + ": " + error);
                return;
            });
        }, function (error) {
            _this.instance.logger.verbose("Error fetching information for room " + roomId + ": " + error);
            return;
        });
    };
    UserSubscription.prototype.parseTypingStopPayload = function (eventName, data, userId) {
        var _this = this;
        var roomId = data.room_id;
        if (roomId === undefined || (typeof roomId) !== 'number') {
            this.instance.logger.verbose("`room_id` key missing or invalid in `typing_stop` payload: " + data);
            return;
        }
        this.currentUser.roomStore.room(roomId, function (room) {
            _this.currentUser.userStore.user(userId, function (user) {
                if (_this.delegate.userStoppedTyping) {
                    _this.delegate.userStoppedTyping(room, user);
                }
                if (room.subscription === undefined) {
                    _this.instance.logger.verbose("Room " + room.name + " has no subscription object set");
                }
                else {
                    if (room.subscription.delegate && room.subscription.delegate.userStoppedTyping) {
                        room.subscription.delegate.userStoppedTyping(user);
                    }
                }
                _this.instance.logger.verbose("User " + user.id + " stopped typing in room " + room.name);
            }, function (error) {
                _this.instance.logger.verbose("Error fetching information for user " + userId + ": " + error);
                return;
            });
        }, function (error) {
            _this.instance.logger.verbose("Error fetching information for room " + roomId + ": " + error);
            return;
        });
    };
    return UserSubscription;
}());
exports.default = UserSubscription;


/***/ }),
/* 19 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
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
        return new ErrorResponse(xhr.status, responseToHeadersObject(xhr.getAllResponseHeaders()), xhr.responseText);
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
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
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
        if (!global.console.group) {
            global.console.group = function (label) {
                groups.push(label);
                global.console.log('%c \nBEGIN GROUP: %c', hr, label);
            };
        }
        if (!global.console.groupEnd) {
            global.console.groupEnd = function () {
                global.console.log('END GROUP: %c\n%c', groups.pop(), hr);
            };
        }
    }
    ConsoleLogger.prototype.verbose = function (message, error) {
        this.log(global.console.log, LogLevel.VERBOSE, message, error);
    };
    ConsoleLogger.prototype.debug = function (message, error) {
        this.log(global.console.log, LogLevel.DEBUG, message, error);
    };
    ConsoleLogger.prototype.info = function (message, error) {
        this.log(global.console.info, LogLevel.INFO, message, error);
    };
    ConsoleLogger.prototype.warn = function (message, error) {
        this.log(global.console.warn, LogLevel.WARNING, message, error);
    };
    ConsoleLogger.prototype.error = function (message, error) {
        this.log(global.console.error, LogLevel.ERROR, message, error);
    };
    ConsoleLogger.prototype.log = function (logFunction, level, message, error) {
        if (level >= this.threshold) {
            var loggerSignature = "Logger." + LogLevel[level];
            if (error) {
                global.console.group();
                logFunction(loggerSignature + ": " + message);
                logFunction(error);
                global.console.groupEnd();
            }
            else {
                logFunction(loggerSignature + ": " + message);
            }
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class CancelError extends Error {
	constructor() {
		super('Promise was canceled');
		this.name = 'CancelError';
	}
}

class PCancelable {
	static fn(fn) {
		return function () {
			const args = [].slice.apply(arguments);
			return new PCancelable((onCancel, resolve, reject) => {
				args.unshift(onCancel);
				fn.apply(null, args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._pending = true;
		this._canceled = false;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			return executor(
				fn => {
					this._cancel = fn;
				},
				val => {
					this._pending = false;
					resolve(val);
				},
				err => {
					this._pending = false;
					reject(err);
				}
			);
		});
	}

	then() {
		return this._promise.then.apply(this._promise, arguments);
	}

	catch() {
		return this._promise.catch.apply(this._promise, arguments);
	}

	cancel() {
		if (!this._pending || this._canceled) {
			return;
		}

		if (typeof this._cancel === 'function') {
			try {
				this._cancel();
			} catch (err) {
				this._reject(err);
			}
		}

		this._canceled = true;
		this._reject(new CancelError());
	}

	get canceled() {
		return this._canceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

module.exports = PCancelable;
module.exports.CancelError = CancelError;


/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __webpack_require__(2);
var request_1 = __webpack_require__(6);
var resuming_subscription_1 = __webpack_require__(7);
var retrying_subscription_1 = __webpack_require__(8);
var subscribe_strategy_1 = __webpack_require__(12);
var subscription_1 = __webpack_require__(13);
var token_providing_subscription_1 = __webpack_require__(9);
var http_1 = __webpack_require__(14);
var websocket_1 = __webpack_require__(15);
var transports_1 = __webpack_require__(10);
var PCancelable = __webpack_require__(3);
var BaseClient = (function () {
    function BaseClient(options) {
        this.options = options;
        this.host = options.host.replace(/(\/)+$/, '');
        this.logger = options.logger || new logger_1.ConsoleLogger();
        this.websocketTransport = new websocket_1.default(this.host);
        this.httpTransport = new http_1.default(this.host);
    }
    BaseClient.prototype.request = function (options, tokenProvider, tokenParams) {
        var _this = this;
        if (tokenProvider) {
            return new PCancelable(function (onCancel, resolve, reject) {
                return tokenProvider
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
                    var reqPromise = request_1.executeNetworkRequest(function () { return _this.httpTransport.request(options); }, options);
                    onCancel(function () {
                        reqPromise.cancel();
                    });
                    resolve(reqPromise);
                    var _a;
                })
                    .catch(function (error) {
                    _this.logger.error(error);
                    reject(error);
                });
            });
        }
        else {
            return request_1.executeNetworkRequest(function () { return _this.httpTransport.request(options); }, options);
        }
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var PCancelable = __webpack_require__(3);
function executeNetworkRequest(createXhr, options) {
    var cancelablePromise = new PCancelable(function (onCancel, resolve, reject) {
        var xhr = createXhr();
        onCancel(function () {
            xhr.abort();
        });
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
        xhr.send(JSON.stringify(options.body));
    });
    return cancelablePromise;
}
exports.executeNetworkRequest = executeNetworkRequest;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var retry_strategy_1 = __webpack_require__(4);
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
                            _this.timeout = global.setTimeout(function () {
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
                    global.clearTimeout(this.timeout);
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var retry_strategy_1 = __webpack_require__(4);
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
                            _this.timeout = global.setTimeout(function () {
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
                    global.clearTimeout(this.timeout);
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var network_1 = __webpack_require__(0);
var PCancelable = __webpack_require__(3);
exports.createTokenProvidingStrategy = function (nextSubscribeStrategy, logger, tokenProvider) {
    if (tokenProvider) {
        return function (listeners, headers) {
            return new TokenProvidingSubscription(tokenProvider, logger, nextSubscribeStrategy, listeners, headers);
        };
    }
    else {
        return function (listeners, headers) { return nextSubscribeStrategy(listeners, headers); };
    }
};
var TokenProvidingSubscription = (function () {
    function TokenProvidingSubscription(tokenProvider, logger, nextSubscribeStrategy, listeners, headers) {
        var _this = this;
        this.unsubscribe = function () {
            _this.state.unsubscribe();
        };
        this.onTransition = function (newState) {
            _this.state = newState;
        };
        var TokenProvidingState = (function () {
            function TokenProvidingState(onTransition) {
                var _this = this;
                this.onTransition = onTransition;
                logger.verbose("TokenProvidingSubscription: transitioning to TokenProvidingState");
                var isTokenExpiredError = function (error) {
                    return (error instanceof network_1.ErrorResponse &&
                        error.statusCode === 401 &&
                        error.info === 'authentication/expired');
                };
                var fetchTokenAndExecuteSubscription = function () {
                    _this.tokenPromise = new PCancelable(function (onCancel, resolve, reject) {
                        return tokenProvider
                            .fetchToken()
                            .then(function (token) {
                            _this.putTokenIntoHeader(token);
                            _this.underlyingSubscription = nextSubscribeStrategy({
                                onEnd: function (error) {
                                    onTransition(new EndedSubscriptionState(error));
                                },
                                onError: function (error) {
                                    if (isTokenExpiredError(error)) {
                                        tokenProvider.clearToken(token);
                                        fetchTokenAndExecuteSubscription();
                                    }
                                    else {
                                        onTransition(new FailedSubscriptionState(error));
                                    }
                                },
                                onEvent: listeners.onEvent,
                                onOpen: function (headers) {
                                    onTransition(new OpenSubscriptionState(headers, _this.underlyingSubscription, onTransition));
                                },
                                onRetrying: listeners.onRetrying,
                            }, headers);
                        })
                            .catch(function (error) {
                            onTransition(new FailedSubscriptionState(error));
                        });
                    });
                };
                fetchTokenAndExecuteSubscription();
            }
            TokenProvidingState.prototype.unsubscribe = function () {
                if (this.tokenPromise) {
                    this.tokenPromise.cancel();
                }
                this.underlyingSubscription.unsubscribe();
                this.onTransition(new EndedSubscriptionState());
            };
            TokenProvidingState.prototype.putTokenIntoHeader = function (token) {
                if (token) {
                    headers['Authorization'] = "Bearer " + token;
                    logger.verbose("TokenProvidingSubscription: token fetched: " + token);
                }
            };
            return TokenProvidingState;
        }());
        var OpenSubscriptionState = (function () {
            function OpenSubscriptionState(headers, underlyingSubscription, onTransition) {
                this.headers = headers;
                this.underlyingSubscription = underlyingSubscription;
                this.onTransition = onTransition;
                logger.verbose("TokenProvidingSubscription: transitioning to OpenSubscriptionState");
                listeners.onOpen(headers);
            }
            OpenSubscriptionState.prototype.unsubscribe = function () {
                this.underlyingSubscription.unsubscribe();
                this.onTransition(new EndedSubscriptionState());
            };
            return OpenSubscriptionState;
        }());
        var FailedSubscriptionState = (function () {
            function FailedSubscriptionState(error) {
                logger.verbose("TokenProvidingSubscription: transitioning to FailedSubscriptionState", error);
                listeners.onError(error);
            }
            FailedSubscriptionState.prototype.unsubscribe = function () {
                throw new Error('Subscription has already ended');
            };
            return FailedSubscriptionState;
        }());
        var EndedSubscriptionState = (function () {
            function EndedSubscriptionState(error) {
                logger.verbose("TokenProvidingSubscription: transitioning to EndedSubscriptionState");
                listeners.onEnd(error);
            }
            EndedSubscriptionState.prototype.unsubscribe = function () {
                throw new Error('Subscription has already ended');
            };
            return EndedSubscriptionState;
        }());
        this.state = new TokenProvidingState(this.onTransition);
    }
    return TokenProvidingSubscription;
}());


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransportStrategy = function (path, transport, logger) {
    return function (listeners, headers) { return transport.subscribe(path, listeners, headers); };
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var base_client_1 = __webpack_require__(5);
exports.BaseClient = base_client_1.BaseClient;
var instance_1 = __webpack_require__(16);
exports.Instance = instance_1.default;
var logger_1 = __webpack_require__(2);
exports.ConsoleLogger = logger_1.ConsoleLogger;
exports.EmptyLogger = logger_1.EmptyLogger;
var network_1 = __webpack_require__(0);
exports.ErrorResponse = network_1.ErrorResponse;
exports.NetworkError = network_1.NetworkError;
exports.responseToHeadersObject = network_1.responseToHeadersObject;
exports.XhrReadyState = network_1.XhrReadyState;
var request_1 = __webpack_require__(6);
exports.executeNetworkRequest = request_1.executeNetworkRequest;
var resuming_subscription_1 = __webpack_require__(7);
exports.createResumingStrategy = resuming_subscription_1.createResumingStrategy;
var retry_strategy_1 = __webpack_require__(4);
exports.createRetryStrategyOptionsOrDefault = retry_strategy_1.createRetryStrategyOptionsOrDefault;
exports.DoNotRetry = retry_strategy_1.DoNotRetry;
exports.Retry = retry_strategy_1.Retry;
exports.RetryResolution = retry_strategy_1.RetryResolution;
var retrying_subscription_1 = __webpack_require__(8);
exports.createRetryingStrategy = retrying_subscription_1.createRetryingStrategy;
var token_providing_subscription_1 = __webpack_require__(9);
exports.createTokenProvidingStrategy = token_providing_subscription_1.createTokenProvidingStrategy;
var transports_1 = __webpack_require__(10);
exports.createTransportStrategy = transports_1.createTransportStrategy;
exports.default = {
    BaseClient: base_client_1.BaseClient,
    ConsoleLogger: logger_1.ConsoleLogger,
    EmptyLogger: logger_1.EmptyLogger,
    Instance: instance_1.default,
};


/***/ }),
/* 12 */
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
/* 13 */
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
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
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
                global.console.log(network_1.responseToHeadersObject(this.xhr.getAllResponseHeaders()));
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
            global.console.warn("Expected this.state to be one of [" + expectedStates + "] but it is " + actualState);
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
        this.baseURL = (encrypted !== false ? 'https' : 'http') + "://" + host;
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
        var xhr = new global.XMLHttpRequest();
        var path = options.path.replace(/^\/+/, '');
        var endpoint = baseURL + "/" + path;
        xhr.open(options.method.toUpperCase(), endpoint, true);
        if (options.body) {
            xhr.setRequestHeader('content-type', 'application/json');
        }
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
    return HttpTransport;
}());
exports.default = HttpTransport;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
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
        this.socket = new global.WebSocket(this.baseURL);
        this.socket.onopen = function (event) {
            var allPendingSubscriptions = _this.pendingSubscriptions.getAllAsArray();
            allPendingSubscriptions.forEach(function (subscription) {
                var subID = subscription.subID, path = subscription.path, listeners = subscription.listeners, headers = subscription.headers;
                _this.subscribePending(path, listeners, headers, subID);
            });
            _this.pendingSubscriptions.removeAll();
            _this.pingInterval = global.setInterval(function () {
                if (_this.pongTimeout) {
                    return;
                }
                var now = new Date().getTime();
                if (pingTimeoutMs > now - _this.lastMessageReceivedTimestamp) {
                    return;
                }
                _this.sendMessage(_this.getMessage(PingMessageType, now));
                _this.lastSentPingID = now;
                _this.pongTimeout = global.setTimeout(function () {
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
        if (!(this.socket instanceof global.WebSocket)) {
            return;
        }
        this.forcedClose = true;
        this.closedError = error;
        this.socket.close();
        global.clearTimeout(this.pingInterval);
        global.clearTimeout(this.pongTimeout);
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
            global.console.logger.debug("Subscription to path " + path + " has an undefined ID");
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
            return global.console.warn("Can't send in \"" + WSReadyState[this.socket.readyState] + "\" state");
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
        global.clearTimeout(this.pongTimeout);
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var base_client_1 = __webpack_require__(5);
var logger_1 = __webpack_require__(2);
var HOST_BASE = 'pusherplatform.io';
var Instance = (function () {
    function Instance(options) {
        if (!options.locator) {
            throw new Error('Expected `locator` property in Instance options!');
        }
        if (options.locator.split(':').length !== 3) {
            throw new Error('The locator property is in the wrong format!');
        }
        if (!options.serviceName) {
            throw new Error('Expected `serviceName` property in Instance options!');
        }
        if (!options.serviceVersion) {
            throw new Error('Expected `serviceVersion` property in Instance otpions!');
        }
        var splitLocator = options.locator.split(':');
        this.platformVersion = splitLocator[0];
        this.cluster = splitLocator[1];
        this.id = splitLocator[2];
        this.serviceName = options.serviceName;
        this.serviceVersion = options.serviceVersion;
        this.host = options.host || this.cluster + "." + HOST_BASE;
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
    Instance.prototype.request = function (options, tokenProvider, tokenParams) {
        options.path = this.absPath(options.path);
        if (options.headers == null || options.headers === undefined) {
            options.headers = {};
        }
        var tokenProviderToUse = tokenProvider || this.tokenProvider;
        return this.client.request(options, tokenProviderToUse, tokenParams);
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

/***/ })
/******/ ]);