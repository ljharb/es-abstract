// @ts-nocheck

'use strict';

var IteratorComplete = require('./IteratorComplete');
var IteratorNext = require('./IteratorNext');

// https://262.ecma-international.org/6.0/#sec-iteratorstep

/** @type {<T>(iterator: Iterator<T>) => false | Partial<IteratorResult<T>>} */
module.exports = function IteratorStep(iterator) {
	var result = IteratorNext(iterator);
	var done = IteratorComplete(result);
	return done === true ? false : result;
};

