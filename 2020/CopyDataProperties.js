'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var callBound = require('call-bound');
var OwnPropertyKeys = require('own-keys');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var CreateDataPropertyOrThrow = require('./CreateDataPropertyOrThrow');
var Get = require('./Get');
var IsInteger = require('./IsInteger');
var isPropertyKey = require('../helpers/isPropertyKey');
var SameValue = require('./SameValue');
var ToNumber = require('./ToNumber');
var ToObject = require('./ToObject');

var every = require('../helpers/every');
var forEach = require('../helpers/forEach');
var IsArray = require('../helpers/IsArray');

// https://262.ecma-international.org/11.0/#sec-copydataproperties

module.exports = function CopyDataProperties(target, source, excludedItems) {
	if (!isObject(target)) {
		throw new $TypeError('Assertion failed: "target" must be an Object');
	}

	if (!IsArray(excludedItems) || !every(excludedItems, isPropertyKey)) {
		throw new $TypeError('Assertion failed: "excludedItems" must be a List of Property Keys');
	}

	if (typeof source === 'undefined' || source === null) {
		return target;
	}

	var from = ToObject(source); // step 4

	var keys = OwnPropertyKeys(from); // step 5

	forEach(keys, function (nextKey) { // step 6
		var excluded = false; // step 6.a

		forEach(excludedItems, function (e) { // step 6.b
			if (SameValue(e, nextKey) === true) { // step 6.b.i
				excluded = true; // step 6.b.i.1
			}
		});

		var enumerable = $isEnumerable(from, nextKey) || (
			// this is to handle string keys being non-enumerable in older engines
			typeof source === 'string'
			&& nextKey >= 0
			&& IsInteger(ToNumber(nextKey))
		);
		if (excluded === false && enumerable) { // step 6.c, kinda
			var propValue = Get(from, nextKey);
			CreateDataPropertyOrThrow(target, nextKey, propValue); // step 6.c.ii.2
		}
	});

	return target; // step 7
};
