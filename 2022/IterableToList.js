'use strict';

var callBound = require('call-bind/callBound');
var $arrayPush = callBound('Array.prototype.push');

var GetIterator = require('./GetIterator');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

// https://262.ecma-international.org/12.0/#sec-iterabletolist

module.exports = function IterableToList(items) {
	var iteratorRecord;
	if (arguments.length > 1) {
		iteratorRecord = GetIterator(items, 'sync', arguments[1]);
	} else {
		iteratorRecord = GetIterator(items, 'sync');
	}
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
