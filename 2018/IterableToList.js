'use strict';

var callBound = require('../helpers/callBound');
var $arrayPush = callBound('Array.prototype.push');

var GetIterator = require('./GetIterator');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

// https://www.ecma-international.org/ecma-262/9.0/#sec-iterabletolist

module.exports = function IterableToList(items, method) {
	var iteratorRecord = GetIterator(items, 'sync', method);
	var values = [];
	var next = true;
	while (next) {
		next = IteratorStep(iteratorRecord);
		if (next) {
			var nextValue = IteratorValue(next);
			$arrayPush(values, nextValue);
		}
	}
	return values;
};
