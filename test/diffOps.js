'use strict';

var keys = require('object-keys');
var forEach = require('for-each');
var indexOf = require('array.prototype.indexof');
var hasOwn = require('hasown');

/** @type {(actual: import('../types').ES, expected: import('../types').ES, expectedMissing: import('./testHelpers').AllAONames[], expectedExtra: import('./testHelpers').AllAONames[]) => { missing: import('./testHelpers').AllAONames[], extra: import('./testHelpers').AllAONames[], extraMissing: import('./testHelpers').AllAONames[] }} */
module.exports = function diffOperations(actual, expected, expectedMissing, expectedExtra) {
	var actualKeys = /** @type {import('./testHelpers').AllAONames[]} */ (keys(actual));
	var expectedKeys = /** @type {import('./testHelpers').AllAONames[]} */ (keys(expected));

	/** @type {import('./testHelpers').AllAONames[]} */
	var extra = [];
	/** @type {import('./testHelpers').AllAONames[]} */
	var missing = [];
	/** @type {import('./testHelpers').AllAONames[]} */
	var extraMissing = [];

	forEach(actualKeys, function (op) {
		if (!(op in expected)) {
			var value = actual[op];
			if (value && typeof value === 'object') {
				forEach(keys(value), function (nestedOp) {
					var fullNestedOp = op + '::' + nestedOp;
					if (!(fullNestedOp in expected)) {
						if (indexOf(expectedExtra, fullNestedOp) === -1) {
							extra.push(/** @type {import('./testHelpers').AllAONames} */ (fullNestedOp));
						}
					} else if (indexOf(expectedMissing, fullNestedOp) !== -1) {
						extra.push(/** @type {import('./testHelpers').AllAONames} */ (fullNestedOp));
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
			var parts = /** @type {import('./testHelpers').SplitAOName<typeof op>} */ (op.split('::'));
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
