'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var objectKeys = require('object-keys');
var safePushApply = require('safe-push-apply');
var callBound = require('call-bound');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var Enum = require('../helpers/enum');
var forEach = require('../helpers/forEach');

var keyEnum = Enum.define('key');
var valueEnum = Enum.define('value');
var keyValue = Enum.define('key+value');
var kinds = [keyEnum, valueEnum, keyValue];

// https://262.ecma-international.org/8.0/#sec-enumerableownproperties

module.exports = function EnumerableOwnPropertyNames(O, kind) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	var kindEnum = Enum.validate('kind', kinds, kind);

	var keys = objectKeys(O);
	if (kindEnum === keyEnum) {
		return keys;
	}
	if (kindEnum === valueEnum || kindEnum === keyValue) {
		var results = [];
		forEach(keys, function (key) {
			if ($isEnumerable(O, key)) {
				safePushApply(results, [
					kindEnum === valueEnum ? O[key] : [key, O[key]]
				]);
			}
		});
		return results;
	}
};
