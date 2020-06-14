'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');
var $asyncIterator = GetIntrinsic('%Symbol.asyncIterator%', true);

var inspect = require('object-inspect');
var hasSymbols = require('has-symbols')();

var AdvanceStringIndex = require('./AdvanceStringIndex');
var Call = require('./Call');
var CreateAsyncFromSyncIterator = require('./CreateAsyncFromSyncIterator');
var GetMethod = require('./GetMethod');
var GetV = require('./GetV');
var IsArray = require('./IsArray');
var Type = require('./Type');

var getIteratorMethod = require('../helpers/getIteratorMethod');

// https://262.ecma-international.org/9.0/#sec-getiterator

module.exports = function GetIterator(obj) {
	var hint = arguments.length > 1 ? arguments[1] : 'sync'; // step 1
	if (hint !== 'sync' && hint !== 'async') {
		throw new $TypeError("Assertion failed: `hint` must be one of 'sync' or 'async', got " + inspect(hint));
	}

	var method;
	if (arguments.length < 3) { // step 2
		if (hint === 'async' && hasSymbols && $asyncIterator) {
			method = GetMethod(obj, $asyncIterator); // step 2.a.i
		}
		if (typeof method === 'undefined') {
			// var syncMethod = GetMethod(obj, $iterator); // step 2.a.ii.1
			var syncMethod = getIteratorMethod(
				{
					AdvanceStringIndex: AdvanceStringIndex,
					GetMethod: GetMethod,
					IsArray: IsArray
				},
				obj
			);
			if (hint === 'async') {
				var syncIteratorRecord = GetIterator(obj, 'sync', syncMethod); // step 2.a.ii.2
				return CreateAsyncFromSyncIterator(syncIteratorRecord); // step 2.a.ii.3
			}
			method = syncMethod; // step 2.b
		}
	} else {
		method = arguments[2];
	}
	var iterator = Call(method, obj); // step 3
	if (Type(iterator) !== 'Object') {
		throw new $TypeError('iterator must return an object'); // step 4
	}

	var nextMethod = GetV(iterator, 'next'); // step 5
	return { // steps 6-7
		'[[Iterator]]': iterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};
};
