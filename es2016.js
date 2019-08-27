'use strict';

var hasSymbols = require('has-symbols')();
var bind = require('function-bind');

var ES2015 = require('./es2015');
var assign = require('./helpers/assign');
var GetIntrinsic = require('./GetIntrinsic');

var $Array = GetIntrinsic('%Array%');
var $Function = GetIntrinsic('%Function%');

var $arrayPush = bind.call($Function.call, $Array.prototype.push);

var ES2016 = assign(assign({}, ES2015), {
	// http://www.ecma-international.org/ecma-262/7.0/#sec-samevaluenonnumber
	SameValueNonNumber: function SameValueNonNumber(x, y) {
		if (typeof x === 'number' || typeof x !== typeof y) {
			throw new TypeError('SameValueNonNumber requires two non-number values of the same type.');
		}
		return this.SameValue(x, y);
	},

	// http://www.ecma-international.org/ecma-262/7.0/#sec-iterabletoarraylike
	IterableToArrayLike: function IterableToArrayLike(items) {
		var usingIterator;
		if (hasSymbols) {
			usingIterator = this.GetMethod(items, Symbol.iterator);
		} else if (this.IsArray(items)) {
			usingIterator = function () {
				var i = -1;
				var arr = this; // eslint-disable-line no-invalid-this
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
		} else if (this.Type(items) === 'String') {
			// fallback for strings
		}
		if (typeof usingIterator !== 'undefined') {
			var iterator = this.GetIterator(items, usingIterator);
			var values = [];
			var next = true;
			while (next) {
				next = this.IteratorStep(iterator);
				if (next) {
					var nextValue = this.IteratorValue(next);
					$arrayPush(values, nextValue);
				}
			}
			return values;
		}

		return this.ToObject(items);
	}
});

module.exports = ES2016;
