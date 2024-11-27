'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bind/callBound');
var $charAt = callBound('String.prototype.charAt');
var $stringToString = callBound('String.prototype.toString');

var CanonicalNumericIndexString = require('./CanonicalNumericIndexString');
var IsInteger = require('./IsInteger');
var IsPropertyKey = require('./IsPropertyKey');

var isObject = require('../helpers/isObject');

var isNegativeZero = require('is-negative-zero');

// https://262.ecma-international.org/8.0/#sec-stringgetownproperty

module.exports = function StringGetOwnProperty(S, P) {
	var str;
	if (isObject(S)) {
		try {
			str = $stringToString(S);
		} catch (e) { /**/ }
	}
	if (typeof str !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a boxed string object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError('Assertion failed: IsPropertyKey(P) is not true');
	}
	if (typeof P !== 'string') {
		return void undefined;
	}
	var index = CanonicalNumericIndexString(P);
	var len = str.length;
	if (typeof index === 'undefined' || !IsInteger(index) || isNegativeZero(index) || index < 0 || len <= index) {
		return void undefined;
	}
	var resultStr = $charAt(S, index);
	return {
		'[[Configurable]]': false,
		'[[Enumerable]]': true,
		'[[Value]]': resultStr,
		'[[Writable]]': false
	};
};
