'use strict';

var IteratorComplete = require('./IteratorComplete');
var IteratorNext = require('./IteratorNext');

// https://ecma-international.org/ecma-262/9.0/#sec-iteratorstep

module.exports = function IteratorStep(iteratorRecord) {
	var result = IteratorNext(iteratorRecord);
	var done = IteratorComplete(result);
	return done === true ? false : result;
};
