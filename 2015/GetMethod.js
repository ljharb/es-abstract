'use strict';

var $TypeError = require('es-errors/type');

var GetV = require('./GetV');
var IsCallable = require('./IsCallable');
var isPropertyKey = require('../helpers/isPropertyKey');

var inspect = require('object-inspect');

// https://262.ecma-international.org/6.0/#sec-getmethod

/** @typedef {import('../types').Func} Func */

/** @type {<P extends import('../types').PropertyKey>(O: Record<P, Func | null | undefined>, P: P) => undefined | Func} */
module.exports = function GetMethod(O, P) {
	// 7.3.9.1
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key');
	}

	// 7.3.9.2
	// @ts-expect-error TODO, figure out the deal here with P
	var func = /** @type {Func | null | undefined} */ (GetV(O, P));

	// 7.3.9.4
	if (func == null) {
		return void 0;
	}

	// 7.3.9.5
	if (!IsCallable(func)) {
		throw new $TypeError(inspect(P) + ' is not a function: ' + inspect(func));
	}

	// 7.3.9.6
	return func;
};
