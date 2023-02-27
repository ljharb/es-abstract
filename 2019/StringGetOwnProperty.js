// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var callBound = require('call-bound');
/** @type {(thisArg: string, index: import('../types').integer) => string} */
var $charAt = callBound('String.prototype.charAt');
/** @type {(thisArg: string | String) => string} */
var $stringToString = callBound('String.prototype.toString');

var CanonicalNumericIndexString = require('./CanonicalNumericIndexString');
var IsInteger = require('./IsInteger');

var isPropertyKey = require('../helpers/isPropertyKey');

var isNegativeZero = require('math-intrinsics/isNegativeZero');

// https://262.ecma-international.org/8.0/#sec-stringgetownproperty

/** @type {(S: string | String, P: `${import('../types').integer}`) => import('../types').DataDescriptor<string> | undefined} */
module.exports = function StringGetOwnProperty(S, P) {
	/** @type {undefined | string} */
	var str;
	if (isObject(S)) {
		try {
			str = $stringToString(S);
		} catch (e) { /**/ }
	}
	if (typeof str !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a boxed string object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}
	if (typeof P !== 'string') {
		return void undefined;
	}
	var index = CanonicalNumericIndexString(P);
	var len = str.length;
	if (typeof index === 'undefined' || !IsInteger(index) || isNegativeZero(index) || index < 0 || len <= index) {
		return void undefined;
	}
	var resultStr = $charAt(str, index);
	return {
		'[[Configurable]]': false,
		'[[Enumerable]]': true,
		'[[Value]]': resultStr,
		'[[Writable]]': false
	};
};
