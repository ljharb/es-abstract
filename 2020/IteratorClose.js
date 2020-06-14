'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var Call = require('./Call');
var CompletionRecord = require('./CompletionRecord');
var GetMethod = require('./GetMethod');
var IsCallable = require('./IsCallable');
var Type = require('./Type');

var assertRecord = require('../helpers/assertRecord');

// https://262.ecma-international.org/9.0/#sec-iteratorclose

module.exports = function IteratorClose(iteratorRecord, completion) {
	assertRecord(Type, 'Iterator Record', 'iteratorRecord', iteratorRecord);
	if (Type(iteratorRecord['[[Iterator]]']) !== 'Object') {
		throw new $TypeError('Assertion failed: iteratorRecord.[[Iterator]] must be an Object'); // step 1
	}

	if (!IsCallable(completion) && !(completion instanceof CompletionRecord)) { // step 2
		throw new $TypeError('Assertion failed: completion is not a thunk representing a Completion Record, nor a Completion Record instance');
	}
	var completionThunk = completion instanceof CompletionRecord ? function () { return completion['?'](); } : completion;

	var iterator = iteratorRecord['[[Iterator]]']; // step 3

	var iteratorReturn = GetMethod(iterator, 'return'); // step 4

	if (typeof iteratorReturn === 'undefined') {
		return completionThunk(); // step 5
	}

	var completionRecord;
	try {
		var innerResult = Call(iteratorReturn, iterator, []);
	} catch (e) {
		// if we hit here, then "e" is the innerResult completion that needs re-throwing

		// if the completion is of type "throw", this will throw.
		completionThunk();
		completionThunk = null; // ensure it's not called twice.

		// if not, then return the innerResult completion
		throw e;
	}
	completionRecord = completionThunk(); // if innerResult worked, then throw if the completion does
	completionThunk = null; // ensure it's not called twice.

	if (Type(innerResult) !== 'Object') {
		throw new $TypeError('iterator .return must return an object'); // step 9
	}

	return completionRecord; // step 10
};
