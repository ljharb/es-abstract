'use strict';

var callBound = require('call-bind/callBound');
var $arrayPush = callBound('Array.prototype.push');

var GetIterator = require('./GetIterator');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');

// https://www.ecma-international.org/ecma-262/9.0/#sec-iterabletolist

module.exports = function IterableToList(items, method) {
	var iterator = GetIterator(items, 'sync', method);
	var values = [];
	var next = true;
	while (next) {
		next = IteratorStep(iterator);
		if (next) {
			var nextValue = IteratorValue(next);
			$arrayPush(values, nextValue);
		}
	}
	return values;
};
