'use strict';

var internalSlot = require('internal-slot');
var isCallable = require('is-callable');

var callBind = require('./callBind');
var callBound = require('./callBound');
var GetIntrinsic = require('../GetIntrinsic');
var $isNaN = require('./isNaN');

var $apply = GetIntrinsic('%Reflect.apply%', true) || callBound('%Function.prototype.apply%');
var $asyncIterator = GetIntrinsic('%Symbol.asyncIterator%', true);
var $toStringTag = GetIntrinsic('%Symbol.toStringTag%', true);
var $TypeError = GetIntrinsic('%TypeError%');

var undefined;

// TODO: Use %AsyncIterator.from% once it's in ECMA-262

/** @type {(o: object, p: string | symbol, Desc: import('es-abstract').PropertyDescriptor) => boolean} */
var DefineOwnProperty = callBind(
	require('./DefineOwnProperty'),
	undefined,
	function IsDataDescriptor(Desc) {
		return !('[[Get]]' in Desc) && !('[[Set]]' in Desc);
	},
	GetIntrinsic('%Object.is%', true) || function SameValue(x, y) {
		if (x === y) {
			// 0 === -0, but they are not identical.
			if (x === 0) {
				return 1 / x === 1 / y;
			}
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},
	function FromPropertyDescriptor(Desc) {
		var obj = {};
		if ('[[Value]]' in Desc) {
			obj.value = Desc['[[Value]]'];
		}
		if ('[[Writable]]' in Desc) {
			obj.writable = Desc['[[Writable]]'];
		}
		if ('[[Get]]' in Desc) {
			obj.get = Desc['[[Get]]'];
		}
		if ('[[Set]]' in Desc) {
			obj.set = Desc['[[Set]]'];
		}
		if ('[[Enumerable]]' in Desc) {
			obj.enumerable = Desc['[[Enumerable]]'];
		}
		if ('[[Configurable]]' in Desc) {
			obj.configurable = Desc['[[Configurable]]'];
		}
		return obj;
	}
);

var CreateMethodProperty = function CreateMethodProperty(O, P, V) {
	return DefineOwnProperty(O, P, {
		'[[Configurable]]': true,
		'[[Enumerable]]': false,
		'[[Writable]]': true,
		'[[Value]]': V
	});
};

var isObject = function (target) {
	return target !== null && (typeof target === 'object' || typeof target === 'function');
};

var AsyncIteratorPrototype
	= GetIntrinsic('%AsyncIteratorPrototype%', true)
	|| (function () {
		var result = {};
		if ($toStringTag) {
			DefineOwnProperty(result, $toStringTag, {
				'[[Writable]]': false,
				'[[Enumerable]]': false,
				'[[Configurable]]': true,
				'[[Value]]': 'AsyncIterator'
			});
		}
		if ($asyncIterator) {
			CreateMethodProperty(
				result,
				$asyncIterator,
				{
					'[Symbol.asyncIterator]': function () {
						return this;
					}
				}['[Symbol.asyncIterator]']
			);
		}
		return result;
	}());

var AsyncFromSyncIteratorPrototype
	= GetIntrinsic('%AsyncFromSyncIteratorPrototype%', true)
	// eslint-disable-next-line max-lines-per-function
	|| (function () {
		var $Promise = GetIntrinsic('%Promise%', true);
		if (!$Promise) {
			return;
		}

		var PromiseResolve = callBind(GetIntrinsic('%Promise.resolve%'));
		var promiseProtoThen = callBound('%Promise.prototype.then%');
		var AsyncFromSyncIteratorContinuation = function AsyncFromSyncIteratorContinuation(result, promiseCapability) {
			var done = !!result.done;
			var value = result.value;
			var valueWrapper = PromiseResolve($Promise, value);

			promiseProtoThen(
				valueWrapper,
				function onFulfilled(unwrappedValue) {
					$apply(
						promiseCapability['[[Resolve]]'],
						undefined,
						[{ value: unwrappedValue, done: done }]
					);
				},
				promiseCapability['[[Reject]]']
			);
		};

		var T = function T() {};
		T.prototype = AsyncIteratorPrototype;
		// eslint-disable-next-line no-shadow
		var AsyncFromSyncIteratorPrototype = new T();

		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'next', function next(value) {
			// eslint-disable-next-line no-invalid-this
			var O = this;
			return new Promise(function (resolve, reject) {
				internalSlot.assert(O, '[[SyncIteratorRecord]]');

				var syncIteratorRecord = internalSlot.get(O, '[[SyncIteratorRecord]]');
				var result = $apply(
					syncIteratorRecord['[[NextMethod]]'],
					syncIteratorRecord['[[Iterator]]'],
					[value]
				);

				if (!isObject(result)) {
					throw new $TypeError('iterator next must return an object');
				}

				return AsyncFromSyncIteratorContinuation(result, {
					'[[Resolve]]': resolve,
					'[[Reject]]': reject
				});
			});
		});

		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'return', {
			'return': function (value) {
				var O = this;
				return new Promise(function (resolve, reject) {
					internalSlot.assert(O, '[[SyncIteratorRecord]]');

					var syncIterator = internalSlot.get(O, '[[SyncIteratorRecord]]')['[[Iterator]]'];
					var returnMethod = syncIterator['return'];
					if (returnMethod != null) {
						if (!isCallable(returnMethod)) {
							throw new $TypeError('iterator return is not a function');
						}

						return resolve({
							value: value,
							done: true
						});
					}

					var result = $apply(returnMethod, syncIterator, [value]);
					if (!isObject(result)) {
						throw new $TypeError('iterator return must return an object');
					}

					return AsyncFromSyncIteratorContinuation(result, {
						'[[Resolve]]': resolve,
						'[[Reject]]': reject
					});
				});
			}
		}['return']);

		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'throw', {
			'throw': function (value) {
				var O = this;
				return new Promise(function (resolve, reject) {
					internalSlot.assert(O, '[[SyncIteratorRecord]]');

					var syncIterator = internalSlot.get(O, '[[SyncIteratorRecord]]')['[[Iterator]]'];
					var throwMethod = syncIterator['return'];
					if (throwMethod != null) {
						if (!isCallable(throwMethod)) {
							throw new $TypeError('iterator throw is not a function');
						}
						throw value;
					}

					var result = $apply(throwMethod, syncIterator, [value]);
					if (!isObject(result)) {
						throw new $TypeError('iterator throw must return an object');
					}

					return AsyncFromSyncIteratorContinuation(result, {
						'[[Resolve]]': resolve,
						'[[Reject]]': reject
					});
				});
			}
		}['throw']);

		// eslint-disable-next-line consistent-return
		return AsyncFromSyncIteratorPrototype;
	}());

var AsyncFromSyncIteratorConstructor;
if (AsyncFromSyncIteratorPrototype) {
	AsyncFromSyncIteratorConstructor = function AsyncFromSyncIterator(syncIteratorRecord) {
		internalSlot.set(this, '[[SyncIteratorRecord]]', syncIteratorRecord);
	};
	AsyncFromSyncIteratorConstructor.prototype = AsyncFromSyncIteratorPrototype;
}

module.exports = AsyncFromSyncIteratorConstructor;
