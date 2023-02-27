'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');
var inspect = require('object-inspect');

var Call = require('./Call');
// var Get = require('./Get');
var GetIterator = require('./GetIterator');
var IsCallable = require('./IsCallable');
var IteratorClose = require('./IteratorClose');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');
var ThrowCompletion = require('./ThrowCompletion');

// https://262.ecma-international.org/15.0/#sec-add-entries-from-iterable

/** @type {<T = unknown, U extends [unknown, unknown] = [unknown, unknown]>(target: T, iterable: Iterable<U>, adder: (this: T, key: U[0], value: U[1]) => void) => T | ReturnType<IteratorClose>} */
module.exports = function AddEntriesFromIterable(target, iterable, adder) {
	if (!IsCallable(adder)) {
		throw new $TypeError('Assertion failed: `adder` is not callable');
	}
	if (iterable == null) {
		throw new $TypeError('Assertion failed: `iterable` is present, and not nullish');
	}
	var iteratorRecord = GetIterator(iterable, 'SYNC');
	while (true) { // eslint-disable-line no-constant-condition
		var next = IteratorStep(iteratorRecord);
		if (!next) {
			return target;
		}
		var nextItem = IteratorValue(next);
		if (!isObject(nextItem)) {
			var error = ThrowCompletion(new $TypeError('iterator next must return an Object, got ' + inspect(nextItem)));
			return IteratorClose(iteratorRecord, error);
		}
		try {
			var k = /** @type {[Parameters<typeof adder>[0]]} */ (nextItem)[0]; // Get(nextItem, '0');
			var v = /** @type {[never, Parameters<typeof adder>[1]]} */ (nextItem)[1]; // Get(nextItem, '1');
			Call(adder, target, [k, v]);
		} catch (e) {
			return IteratorClose(iteratorRecord, ThrowCompletion(e));
		}
	}
};
