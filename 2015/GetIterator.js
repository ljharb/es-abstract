'use strict';

var $TypeError = require('es-errors/type');

var getIteratorMethod = require('../helpers/getIteratorMethod');
var AdvanceStringIndex = require('./AdvanceStringIndex');
var Call = require('./Call');
var GetMethod = require('./GetMethod');

var isObject = require('es-object-atoms/isObject');

/** @type {import('../helpers/types').esSubset<unknown>} */
var ES = {
	AdvanceStringIndex: AdvanceStringIndex,
	GetMethod: GetMethod
};

// https://262.ecma-international.org/6.0/#sec-getiterator

/** @type {<T>(obj: Partial<Iterable<T>>, method?: (this: Iterable<T>) => Iterator<T>) => Iterator<T>} */
module.exports = function GetIterator(obj, method) {
	/** @typedef {import('../types').InferIterableType<Required<typeof obj>>} T */

	var actualMethod = method;
	if (arguments.length < 2) {
		actualMethod = getIteratorMethod(ES, obj);
	}
	// @ts-expect-error it's fine if this throws
	var iterator = Call(actualMethod, obj);
	if (!isObject(iterator)) {
		throw new $TypeError('iterator must return an object');
	}

	return iterator;
};
