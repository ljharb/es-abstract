'use strict';

var keys = require('object-keys');
var forEach = require('for-each');
var indexOf = require('array.prototype.indexof');
var hasOwn = require('hasown');

/** @type {(actual: Record<string, Record<string, Function>>, expected: Record<string, unknown>, expectedMissing: string[], expectedExtra: string[]) => { missing: string[], extra: string[], extraMissing: string[] }} */
module.exports = function diffOperations(actual, expected, expectedMissing, expectedExtra) {
	var actualKeys = keys(actual);
	var expectedKeys = keys(expected);

	/** @type {string[]} */
	var extra = [];
	/** @type {string[]} */
	var missing = [];
	/** @type {string[]} */
	var extraMissing = [];

	forEach(actualKeys, function (op) {
		if (!(op in expected)) {
			var value = actual[op];
			if (value && typeof value === 'object') {
				forEach(keys(value), function (nestedOp) {
					var fullNestedOp = op + '::' + nestedOp;
					if (!(fullNestedOp in expected)) {
						if (indexOf(expectedExtra, fullNestedOp) === -1) {
							extra.push(fullNestedOp);
						}
					} else if (indexOf(expectedMissing, fullNestedOp) !== -1) {
						extra.push(fullNestedOp);
					}
				});
			} else {
				extra.push(op);
			}
		} else if (indexOf(expectedMissing, op) !== -1) {
			extra.push(op);
		}
	});
	/** @type {(op: string, actualValue: unknown) => void} */
	var checkMissing = function checkMissing(op, actualValue) {
		if (typeof actualValue !== 'function' && indexOf(expectedMissing, op) === -1) {
			missing.push(op);
		}
	};
	forEach(expectedKeys, function (op) {
		if (op.indexOf('::') > -1) {
			var parts = op.split('::');
			var secondPart = parts[1];
			var value = actual[parts[0]];
			if (value && typeof value === 'object' && typeof value[secondPart] === 'function') {
				checkMissing(op, value[secondPart]);
			}
		} else {
			checkMissing(op, actual[op]);
		}
	});

	forEach(expectedMissing, function (expectedOp) {
		if (!hasOwn(expected, expectedOp)) {
			extraMissing.push(expectedOp);
		}
	});

	return { missing: missing, extra: extra, extraMissing: extraMissing };
};
