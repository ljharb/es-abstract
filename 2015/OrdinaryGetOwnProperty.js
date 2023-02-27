'use strict';

var $gOPD = require('gopd');
var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var hasOwn = require('hasown');
var callBound = require('call-bound');

/** @type {(thisArg: ThisParameterType<typeof Object.prototype.propertyIsEnumerable>, ...args: Parameters<typeof Object.prototype.propertyIsEnumerable> => ReturnType<typeof Object.prototype.propertyIsEnumerable>)} */
var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

var IsArray = require('./IsArray');
var isPropertyKey = require('../helpers/isPropertyKey');
var IsRegExp = require('./IsRegExp');
var ToPropertyDescriptor = require('./ToPropertyDescriptor');

// https://262.ecma-international.org/6.0/#sec-ordinarygetownproperty

/** @type {<O extends object, K extends keyof O>(O: O, P: K) => undefined | import('../types').DataDescriptor<O[K]>} */
module.exports = function OrdinaryGetOwnProperty(O, P) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: O must be an Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P must be a Property Key');
	}
	if (!hasOwn(O, P)) {
		return void 0;
	}
	if (!$gOPD) {
		// ES3 / IE 8 fallback
		var arrayLength = IsArray(O) && P === 'length';
		var regexLastIndex = IsRegExp(O) && P === 'lastIndex';
		return {
			'[[Configurable]]': !(arrayLength || regexLastIndex),
			'[[Enumerable]]': $isEnumerable(O, P),
			'[[Value]]': O[P],
			'[[Writable]]': true
		};
	}

	return ToPropertyDescriptor(/** @type {PropertyDescriptor} */ ($gOPD(O, P)));
};
