'use strict';

var IteratorComplete = require('./IteratorComplete');
var IteratorNext = require('./IteratorNext');
var Type = require('./Type');

var assertRecord = require('../helpers/assertRecord');

// https://ecma-international.org/ecma-262/9.0/#sec-iteratorstep

module.exports = function IteratorStep(iteratorRecord) {
	assertRecord(Type, 'Iterator Record', 'iteratorRecord', iteratorRecord);

	var result = IteratorNext(iteratorRecord); // step 1
	var done = IteratorComplete(result); // step 2
	return done === true ? false : result; // steps 3-4
};

