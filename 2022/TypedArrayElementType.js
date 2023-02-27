'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/13.0/#sec-typedarrayelementtype

var tableTAO = require('./tables/typed-array-objects');

/** @typedef {import('../types').TypedArray} TypedArray */
/** @typedef {import('../types').TypedArrayName} TypedArrayName */
/** @typedef {typeof tableTAO.name[`\$${TypedArrayName}`]} TypedArrayType */

/** @type {<T extends TypedArray>(O: T) => TypedArrayType} */
module.exports = function TypedArrayElementType(O) {
	var type = whichTypedArray(O);
	if (!type) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray');
	}
	// eslint-disable-next-line no-extra-parens
	var result = tableTAO.name[/** @type {`$${TypedArrayName}`} */ ('$' + type)];

	if (typeof result !== 'string') {
		throw new $SyntaxError('Assertion failed: Unknown TypedArray type `' + type + '`');
	}

	return result;
};
