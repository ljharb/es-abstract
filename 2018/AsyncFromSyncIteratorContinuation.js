'use strict';

var GetIntrinsic = require('../GetIntrinsic.js');
var callBound = require('../helpers/callBound.js');

var Call = require('./Call.js');
var CreateIterResultObject = require('./CreateIterResultObject.js');
var IteratorComplete = require('./IteratorComplete.js');
var IteratorValue = require('./IteratorValue.js');

var PromiseResolve = require('./PromiseResolve.js');

var $Promise = GetIntrinsic('%Promise%', true);
var PerformPromiseThen = callBound('%Promise.prototype.then%', true);

// https://www.ecma-international.org/ecma-262/10.0/#sec-asyncfromsynciteratorcontinuation

module.exports = function AsyncFromSyncIteratorContinuation(result, promiseCapability) {
	try {
		var done = IteratorComplete(result);
		var value = IteratorValue(result);
		var valueWrapper = PromiseResolve($Promise, value);

		PerformPromiseThen(
			valueWrapper,
			function onFulfilled(unwrappedValue) {
				Call(promiseCapability['[[Resolve]]'], undefined, [
					CreateIterResultObject(unwrappedValue, done)
				]);
			},
			promiseCapability['[[Reject]]']
		);
	} catch (error) {
		Call(promiseCapability['[[Reject]]'], undefined, [error]);
	}
	return promiseCapability['[[Promise]]'];
};
