'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/6.0/#sec-createiterresultobject

/** @type {<T>(value: T, done: true | false) => IteratorResult<T>} */
module.exports = function CreateIterResultObject(value, done) {
	if (typeof done !== 'boolean') {
		throw new $TypeError('Assertion failed: Type(done) is not Boolean');
	}
	return {
		value: value,
		done: done
	};
};
