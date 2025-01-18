'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var objectKeys = require('object-keys');
var callBound = require('call-bound');
var safePushApply = require('safe-push-apply');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var forEach = require('../helpers/forEach');

// https://262.ecma-international.org/8.0/#sec-enumerableownproperties

/** @type {import('../types').EnumerableOwnPropertyNames} */
module.exports = function EnumerableOwnProperties(O, kind) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	/** @typedef {keyof typeof O} K */
	/** @typedef {typeof O[K]} V */
	/** @type {K[]} */
	var keys = objectKeys(O);
	if (kind === 'key') {
		return keys;
	}
	if (kind === 'value' || kind === 'key+value') {

		/** @type {(V | readonly [K, V])[]} */
		var results = [];
		forEach(keys, function (key) {
			if ($isEnumerable(O, key)) {
				/** @type {V} */
				var v = O[key];
				var result = kind === 'value' ? v : /** @type {const} */ ([key, v]);
				safePushApply(results, [result]);
			}
		});
		return results;
	}
	throw new $TypeError('Assertion failed: "kind" is not "key", "value", or "key+value": ' + kind);
};
