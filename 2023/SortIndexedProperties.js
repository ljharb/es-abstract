'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bind/callBound');

var $TypeError = GetIntrinsic('%TypeError%');

var Get = require('./Get');
var HasProperty = require('./HasProperty');
var IsIntegralNumber = require('./IsIntegralNumber');
var ToString = require('./ToString');
var Type = require('./Type');

var isAbstractClosure = require('../helpers/isAbstractClosure');

var $push = callBound('Array.prototype.push');
var $sort = callBound('Array.prototype.sort');

// https://262.ecma-international.org/14.0/#sec-sortindexedproperties

module.exports = function SortIndexedProperties(obj, len, SortCompare, skipHoles) {
	if (Type(obj) !== 'Object') {
		throw new $TypeError('Assertion failed: Type(obj) is not Object');
	}
	if (!IsIntegralNumber(len) || len < 0) {
		throw new $TypeError('Assertion failed: `len` must be an integer >= 0');
	}
	if (!isAbstractClosure(SortCompare) || SortCompare.length !== 2) {
		throw new $TypeError('Assertion failed: `SortCompare` must be an abstract closure taking 2 arguments');
	}
	if (Type(skipHoles) !== 'Boolean') {
		throw new $TypeError('Assertion failed: `skipHoles` must be a Boolean');
	}

	var items = []; // step 1

	var k = 0; // step 2

	while (k < len) { // step 3
		var Pk = ToString(k);
		var kRead = skipHoles ? HasProperty(obj, Pk) : true; // step 3.b - 3.c
		if (kRead) { // step 3.d
			var kValue = Get(obj, Pk);
			$push(items, kValue);
		}
		k += 1; // step 3.e
	}

	$sort(items, SortCompare); // step 4

	return items; // step 5
};
