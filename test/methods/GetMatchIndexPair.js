'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'GetMatchIndexPair'>} */
module.exports = function (t, year, GetMatchIndexPair) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			// @ts-expect-error
			function () { return GetMatchIndexPair(notString); },
			TypeError,
			debug(notString) + ' is not a string'
		);
	});

	forEach(/** @type {unknown[]} */ ([].concat(
		esV.unknowns,
		{ '[[StartIndex]]': -1 },
		{ '[[StartIndex]]': 1.2, '[[EndIndex]]': 0 },
		{ '[[StartIndex]]': 1, '[[EndIndex]]': 0 }
	)), function (notMatchRecord) {
		t['throws'](
			// @ts-expect-error
			function () { return GetMatchIndexPair('', notMatchRecord); },
			TypeError,
			debug(notMatchRecord) + ' is not a Match Record'
		);
	});

	var invalidStart = { '[[StartIndex]]': 1, '[[EndIndex]]': 2 };
	t['throws'](
		function () { return GetMatchIndexPair('', invalidStart); },
		TypeError,
		debug(invalidStart) + ' has a [[StartIndex]] that is > the length of the string'
	);

	var invalidEnd = { '[[StartIndex]]': 0, '[[EndIndex]]': 1 };
	t['throws'](
		function () { return GetMatchIndexPair('', invalidEnd); },
		TypeError,
		debug(invalidEnd) + ' has an [[EndIndex]] that is > the length of the string'
	);

	t.deepEqual(
		GetMatchIndexPair('', { '[[StartIndex]]': 0, '[[EndIndex]]': 0 }),
		[0, 0]
	);
	t.deepEqual(
		GetMatchIndexPair('abc', { '[[StartIndex]]': 1, '[[EndIndex]]': 2 }),
		[1, 2]
	);
};
