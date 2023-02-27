'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/13.0/#sec-typedarrayelementsize

var tableTAO = require('./tables/typed-array-objects');

/** @typedef {import('../types').TypedArrayName} TypedArrayName */
/** @typedef {typeof tableTAO.name[`\$${TypedArrayName}`]} TypedArrayType */
/** @typedef {Exclude<typeof tableTAO.size[keyof typeof tableTAO.size], null>} TypedArrayElementSizeValue */

/** @type {(O: import('../types').TypedArray) => TypedArrayElementSizeValue} */
module.exports = function TypedArrayElementSize(O) {
	var type = whichTypedArray(O);
	if (!type) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray');
	}
	// eslint-disable-next-line no-extra-parens
	var size = tableTAO.size[/** @type {`\$${TypedArrayType}`} */ ('$' + tableTAO.name[/** @type {`\$${TypedArrayName}`} */ ('$' + type)])];

	if (!isInteger(size) || size < 0) {
		throw new $SyntaxError('Assertion failed: Unknown TypedArray type `' + type + '`');
	}

	return size;
};
