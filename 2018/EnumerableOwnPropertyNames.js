'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var objectKeys = require('object-keys');
var safePushApply = require('safe-push-apply');
var callBound = require('call-bound');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var forEach = require('../helpers/forEach');
var specEnum = require('../helpers/specEnum');

var year = require('./year');

var KEY = specEnum(year, 'key');
var VALUE = specEnum(year, 'value');
var KEY_VALUE = specEnum(year, 'key+value');

// https://262.ecma-international.org/8.0/#sec-enumerableownproperties

module.exports = function EnumerableOwnPropertyNames(O, kind) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	var keys = objectKeys(O);
	if (kind === KEY) {
		return keys;
	}
	if (kind === VALUE || kind === KEY_VALUE) {
		var results = [];
		forEach(keys, function (key) {
			if ($isEnumerable(O, key)) {
				safePushApply(results, [
					kind === VALUE ? O[key] : [key, O[key]]
				]);
			}
		});
		return results;
	}
	throw new $TypeError('Assertion failed: "kind" is not `' + KEY + '`, `' + VALUE + '`, or `' + KEY_VALUE + '`: ' + kind);
};
