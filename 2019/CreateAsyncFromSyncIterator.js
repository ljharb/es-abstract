'use strict';

var internalSlot = require('internal-slot');
var GetIntrinsic = require('../GetIntrinsic.js');

var AsyncFromSyncIteratorContinuation = require('./AsyncFromSyncIteratorContinuation.js');
var Call = require('./Call.js');
var CreateIterResultObject = require('./CreateIterResultObject.js');
var CreateMethodProperty = require('./CreateMethodProperty.js');
var DefinePropertyOrThrow = require('./DefinePropertyOrThrow.js');
var Get = require('./Get.js');
var GetMethod = require('./GetMethod.js');
var IteratorNext = require('./IteratorNext.js');
var OrdinaryObjectCreate = require('./ObjectCreate.js');
var Type = require('./Type.js');

var $asyncIterator = GetIntrinsic('%Symbol.asyncIterator%', true);
var $toStringTag = GetIntrinsic('%Symbol.toStringTag%', true);
var $TypeError = GetIntrinsic('%TypeError%');

// TODO: Use %AsyncIterator.from% once it's in ECMA-262

var AsyncIteratorPrototype
	= GetIntrinsic('%AsyncIteratorPrototype%', true)
	|| (function () {
		var result = {};
		if ($toStringTag) {
			DefinePropertyOrThrow(result, $toStringTag, {
				'[[Writable]]': false,
				'[[Enumerable]]': false,
				'[[Configurable]]': true,
				'[[Value]]': 'AsyncIterator'
			});
		}
		if ($asyncIterator) {
			var method = {
				'[Symbol.asyncIterator]': function () {
					return this;
				}
			}['[Symbol.asyncIterator]'];
			CreateMethodProperty(result, $asyncIterator, method);
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

		// eslint-disable-next-line no-shadow
		var AsyncFromSyncIteratorPrototype = OrdinaryObjectCreate(AsyncIteratorPrototype);
		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'next', function next(value) {
			// eslint-disable-next-line no-invalid-this
			var O = this;
			var promiseCapability = {};
			promiseCapability['[[Promise]]'] = new $Promise(function (resolve, reject) {
				promiseCapability['[[Resolve]]'] = resolve;
				promiseCapability['[[Reject]]'] = reject;
			});

			if (Type(O) !== 'Object' || !internalSlot.has(O, '[[SyncIteratorRecord]]')) {
				Call(promiseCapability['[[Reject]]'], undefined, [
					new $TypeError('%AsyncFromSyncIteratorPrototype%.next called on invalid receiver')
				]);
				return promiseCapability['[[Promise]]'];
			}

			var result;
			try {
				var syncIteratorRecord = internalSlot.get(O, '[[SyncIteratorRecord]]');
				result = IteratorNext(syncIteratorRecord, value);
			} catch (error) {
				Call(promiseCapability['[[Reject]]'], undefined, [error]);
				return promiseCapability['[[Promise]]'];
			}
			return AsyncFromSyncIteratorContinuation(result, promiseCapability);
		});

		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'return', function (value) {
			// eslint-disable-next-line no-invalid-this
			var O = this;
			var promiseCapability = {};
			promiseCapability['[[Promise]]'] = new $Promise(function (resolve, reject) {
				promiseCapability['[[Resolve]]'] = resolve;
				promiseCapability['[[Reject]]'] = reject;
			});

			if (Type(O) !== 'Object' || !internalSlot.has(O, '[[SyncIteratorRecord]]')) {
				Call(promiseCapability['[[Reject]]'], undefined, [
					new $TypeError('%AsyncFromSyncIteratorPrototype%.return called on invalid receiver')
				]);
				return promiseCapability['[[Promise]]'];
			}

			var syncIterator = internalSlot.get(O, '[[SyncIteratorRecord]]')['[[SyncIterator]]'];
			var result;
			try {
				var returnMethod = GetMethod(syncIterator, 'return');
				if (returnMethod === undefined) {
					var iterResult = CreateIterResultObject(value, true);
					Call(promiseCapability['[[Resolve]]'], undefined, [iterResult]);
					return promiseCapability['[[Promise]]'];
				}

				result = Call(returnMethod, syncIterator, [value]);
				if (Type(result) !== 'Object') {
					Call(promiseCapability['[[Reject]]'], undefined, [
						new $TypeError('iterator return must return an object')
					]);
					return promiseCapability['[[Promise]]'];
				}
			} catch (error) {
				Call(promiseCapability['[[Reject]]'], undefined, [error]);
				return promiseCapability['[[Promise]]'];
			}
			return AsyncFromSyncIteratorContinuation(result, promiseCapability);
		});

		CreateMethodProperty(AsyncFromSyncIteratorPrototype, 'throw', function (value) {
			// eslint-disable-next-line no-invalid-this
			var O = this;
			var promiseCapability = {};
			promiseCapability['[[Promise]]'] = new $Promise(function (resolve, reject) {
				promiseCapability['[[Resolve]]'] = resolve;
				promiseCapability['[[Reject]]'] = reject;
			});

			if (Type(O) !== 'Object' || !internalSlot.has(O, '[[SyncIteratorRecord]]')) {
				Call(promiseCapability['[[Reject]]'], undefined, [
					new $TypeError('%AsyncFromSyncIteratorPrototype%.return called on invalid receiver')
				]);
				return promiseCapability['[[Promise]]'];
			}

			var syncIterator = internalSlot.get(O, '[[SyncIteratorRecord]]')['[[SyncIterator]]'];
			var result;
			try {
				var throwMethod = GetMethod(syncIterator, 'throw');
				if (throwMethod === undefined) {
					var iterResult = CreateIterResultObject(value, true);
					Call(promiseCapability['[[Reject]]'], undefined, [iterResult]);
					return promiseCapability['[[Promise]]'];
				}

				result = Call(throwMethod, syncIterator, [value]);
				if (Type(result) !== 'Object') {
					Call(promiseCapability['[[Reject]]'], undefined, [
						new $TypeError('iterator throw must return an object')
					]);
					return promiseCapability['[[Promise]]'];
				}
			} catch (error) {
				Call(promiseCapability['[[Reject]]'], undefined, [error]);
				return promiseCapability['[[Promise]]'];
			}
			return AsyncFromSyncIteratorContinuation(result, promiseCapability);
		});

		// eslint-disable-next-line consistent-return
		return AsyncFromSyncIteratorPrototype;
	}());

// https://www.ecma-international.org/ecma-262/9.0/#sec-createasyncfromsynciterator

module.exports = function CreateAsyncFromSyncIterator(syncIteratorRecord) {
	if (!AsyncFromSyncIteratorPrototype) {
		throw new SyntaxError('This environment does not support Promises.');
	}

	var asyncIterator = OrdinaryObjectCreate(AsyncFromSyncIteratorPrototype);
	internalSlot.set(asyncIterator, '[[SyncIteratorRecord]]', syncIteratorRecord);
	var nextMethod = Get(asyncIterator, 'next');
	return {
		'[[Iterator]]': asyncIterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
};
