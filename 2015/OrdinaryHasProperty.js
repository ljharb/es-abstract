'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-ordinaryhasproperty

/** @type {<T extends (string | symbol) = (string | symbol), U = unknown>(O: Record<T, U>, P: T) => P is keyof O} */
module.exports = function OrdinaryHasProperty(O, P) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P must be a Property Key');
	}
	return P in O;
};
