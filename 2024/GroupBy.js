'use strict';

var $TypeError = require('es-errors/type');
var isNegativeZero = require('math-intrinsics/isNegativeZero');
var MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

var AddValueToKeyedGroup = require('./AddValueToKeyedGroup');
var Call = require('./Call');
var GetIterator = require('./GetIterator');
var IsCallable = require('./IsCallable');
var IteratorClose = require('./IteratorClose');
var IteratorStep = require('./IteratorStep');
var IteratorValue = require('./IteratorValue');
var RequireObjectCoercible = require('./RequireObjectCoercible');
var ThrowCompletion = require('./ThrowCompletion');
var ToPropertyKey = require('./ToPropertyKey');

// https://262.ecma-international.org/15.0/#sec-groupby

/** @type {<V>(items: V[], callbackfn: (value: V, key: number) => typeof keyCoercion extends 'ZERO' ? unknown : import('../types').PropertyKey, keyCoercion: 'PROPERTY' | 'ZERO') => void | unknown[]} */
module.exports = function GroupBy(items, callbackfn, keyCoercion) {
	if (keyCoercion !== 'PROPERTY' && keyCoercion !== 'ZERO') {
		throw new $TypeError('Assertion failed: `keyCoercion` must be `"PROPERTY"` or `"ZERO"`');
	}

	RequireObjectCoercible(items); // step 1

	if (!IsCallable(callbackfn)) {
		throw new $TypeError('callbackfn must be callable'); // step 2
	}

	/** @typedef {ReturnType<typeof callbackfn>} GroupName */
	/** @typedef {Parameters<typeof callbackfn>[0]} V */

	/** @type {import('./AddValueToKeyedGroup').KeyedGroup<GroupName, V>[]} */
	var groups = []; // step 3

	var iteratorRecord = /** @type {import('../types').IteratorRecord<V>} */ (GetIterator(items, 'SYNC')); // step 4

	var k = 0; // step 5

	// eslint-disable-next-line no-constant-condition
	while (true) { // step 6
		if (k >= MAX_SAFE_INTEGER) { // step 6.a
			var error = ThrowCompletion(new $TypeError('k must be less than 2 ** 53 - 1')); // step 6.a.i
			IteratorClose(iteratorRecord, error); // step 6.a.ii
			return void undefined;
		}
		var next = IteratorStep(iteratorRecord); // step 6.b
		if (!next) { // step 6.c
			return groups; // step 6.c.i
		}

		var value = IteratorValue(next); // step 6.dv

		/** @type {GroupName} */
		var key;
		try {
			key = Call(callbackfn, undefined, [value, k]); // step 6.e
		} catch (e) {
			IteratorClose(iteratorRecord, ThrowCompletion(e)); // step 6.f
			return void undefined;
		}

		if (keyCoercion === 'PROPERTY') { // step 6.g
			try {
				key = ToPropertyKey(key); // step 6.g.i
			} catch (e) {
				IteratorClose(iteratorRecord, ThrowCompletion(e)); // step 6.g.ii
				return void undefined;
			}
		} else { // step 6.h
			if (keyCoercion !== 'ZERO') {
				throw new $TypeError('keyCoercion must be ~PROPERTY~ or ~ZERO~'); // step 6.h.i
			}
			if (isNegativeZero(key)) {
				// @ts-expect-error isNegativeZero can't be a predicate for `-0` because TS can't handle it
				key = +0; // step 6.h.ii
			}
		}

		AddValueToKeyedGroup(groups, key, value); // step 6.i

		k += 1; // step 6.j
	}
};
