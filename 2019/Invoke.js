// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');

var Call = require('./Call');
var IsArray = require('./IsArray');
var GetV = require('./GetV');
var isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-invoke

/** @type {(O: Record<import('../types').PropertyKey, import('../types').Func>, P: keyof typeof O, argumentsList?: unknown[]) => ReturnType<typeof O[P]>} */
module.exports = function Invoke(O, P) {
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P must be a Property Key');
	}
	var argumentsList = arguments.length > 2 ? arguments[2] : [];
	if (!IsArray(argumentsList)) {
		throw new $TypeError('Assertion failed: optional `argumentsList`, if provided, must be a List');
	}
	var func = GetV(O, P);

	return Call(func, O, argumentsList);
};
