'use strict';

var GetIntrinsic = require('../GetIntrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var getIteratorMethod = require('../helpers/getIteratorMethod');
var AdvanceStringIndex = require('./AdvanceStringIndex');
var Call = require('./Call');
var CreateAsyncFromSyncIterator = require('./CreateAsyncFromSyncIterator');
var GetMethod = require('./GetMethod');
var GetV = require('./GetV');
var IsArray = require('./IsArray');
var Type = require('./Type');

// https://ecma-international.org/ecma-262/6.0/#sec-getiterator

module.exports = function GetIterator(obj) {
	var hint = arguments.length > 1 ? arguments[1] : 'sync';
	if (hint !== 'sync' && hint !== 'async') {
		throw new $TypeError('Assertion failed: `hint` must be either ~sync~ or ~async~');
	}
	var method;
	if (arguments.length < 3) {
		if (hint === 'async') {
			method = GetMethod(obj, Symbol.asyncIterator);
			if (typeof method !== 'undefined') {
				var syncMethod = getIteratorMethod(
					{
						AdvanceStringIndex: AdvanceStringIndex,
						GetMethod: GetMethod,
						IsArray: IsArray,
						Type: Type
					},
					obj
				);
				var syncIteratorRecord = GetIterator(obj, 'sync', syncMethod);
				return CreateAsyncFromSyncIterator(syncIteratorRecord);
			}
		} else {
			method = getIteratorMethod(
				{
					AdvanceStringIndex: AdvanceStringIndex,
					GetMethod: GetMethod,
					IsArray: IsArray,
					Type: Type
				},
				obj
			);
		}
	}
	var iterator = Call(method, obj);
	if (Type(iterator) !== 'Object') {
		throw new $TypeError('iterator must return an object');
	}

	var nextMethod = GetV(iterator, 'next');

	var iteratorRecord = {
		'[[Iterator]]': iterator,
		'[[NextMethod]]': nextMethod,
		'[[Done]]': false
	};

	return iteratorRecord;
};
