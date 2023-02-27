'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var callBound = require('call-bound');
var OwnPropertyKeys = require('own-keys');

var every = require('../helpers/every');
var forEach = require('../helpers/forEach');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var CreateDataPropertyOrThrow = require('./CreateDataPropertyOrThrow');
var Get = require('./Get');
var IsArray = require('./IsArray');
var IsInteger = require('./IsInteger');
var isPropertyKey = require('../helpers/isPropertyKey');
var SameValue = require('./SameValue');
var ToNumber = require('./ToNumber');
var ToObject = require('./ToObject');

// https://262.ecma-international.org/11.0/#sec-copydataproperties

/** @type {(target: Parameters<typeof CreateDataPropertyOrThrow>[0], source: unknown, excludedItems: unknown[]) => typeof target} */
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

	var from = ToObject(source);

	var sourceKeys = OwnPropertyKeys(from);
	forEach(sourceKeys, function (nextKey) {
		var excluded = false;

		forEach(excludedItems, function (e) {
			if (SameValue(e, nextKey) === true) {
				excluded = true;
			}
		});

		var enumerable = $isEnumerable(from, nextKey) || (
			// this is to handle string keys being non-enumerable in older engines
			typeof source === 'string'
			&& nextKey >= 0
			&& IsInteger(ToNumber(nextKey))
		);
		if (excluded === false && enumerable) {
			var propValue = Get(from, nextKey);
			CreateDataPropertyOrThrow(target, nextKey, propValue);
		}
	});

	return target;
};
