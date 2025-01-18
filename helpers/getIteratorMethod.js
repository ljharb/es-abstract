'use strict';

var hasSymbols = require('has-symbols')();
var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');
var isString = require('is-string');

var $iterator = GetIntrinsic('%Symbol.iterator%', true);
var $stringSlice = callBound('String.prototype.slice');
var $String = GetIntrinsic('%String%');

var IsArray = require('./IsArray');

/** @type {import('./types').GetIteratorMethod} */
module.exports = function getIteratorMethod(ES, iterable) {
	/** @typedef {import('../types').InferIterableType<typeof iterable>} T */

	/** @type {undefined | ((this:? Iterable<T>) => Iterator<T>)} */
	var usingIterator = void undefined;
	if (hasSymbols) {
		usingIterator = ES.GetMethod(iterable, /** @type {NonNullable<typeof $iterator>} */ ($iterator));
	} else if (IsArray(iterable)) {
		usingIterator = function () {
			var i = -1;
			var arr = /** @type {T[]} */ (this); // eslint-disable-line no-invalid-this
			return {
				next: function () {
					i += 1;
					return {
						done: i >= arr.length,
						value: arr[i]
					};
				}
			};
		};
	} else if (isString(iterable)) {
		usingIterator = /** @type {() => Iterator<T>}} */ function () {
			var i = 0;
			return {
				// @ts-expect-error TODO FIXME
				next: function () {
					var nextIndex = ES.AdvanceStringIndex($String(iterable), i, true);
					var value = $stringSlice(iterable, i, nextIndex);
					i = nextIndex;
					return {
						done: nextIndex > iterable.length,
						value: value
					};
				}
			};
		};
	}
	return usingIterator;
};
