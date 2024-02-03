'use strict';

var $TypeError = require('es-errors/type');

var Type = require('./Type');

// https://262.ecma-international.org/6.0/#sec-createiterresultobject

module.exports = function CreateIterResultObject(value, done) {
	if (Type(done) !== 'Boolean') {
		throw new $TypeError('Assertion failed: Type(done) is not Boolean');
	}
	return {
		value: value,
		done: done
	};
};
