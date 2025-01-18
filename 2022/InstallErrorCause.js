'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var CreateNonEnumerableDataPropertyOrThrow = require('./CreateNonEnumerableDataPropertyOrThrow');
var Get = require('./Get');
var HasProperty = require('./HasProperty');

// https://262.ecma-international.org/13.0/#sec-installerrorcause

/** @type {(O: Parameters<typeof CreateNonEnumerableDataPropertyOrThrow>[0], options?: { cause?: unknown }) => void} */
module.exports = function InstallErrorCause(O, options) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}

	if (isObject(options) && HasProperty(options, 'cause')) {
		var cause = Get(options, 'cause');
		CreateNonEnumerableDataPropertyOrThrow(O, 'cause', cause);
	}
};
