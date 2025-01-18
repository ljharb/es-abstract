'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'RegExpCreate'>} */
module.exports = function (t, year, RegExpCreate) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonStrings, function (nonString) {
		if (typeof nonString !== 'symbol') {
			var p = typeof nonString === 'undefined' ? '' : nonString;
			t.equal(
				String(RegExpCreate(p, 'g')),
				'/' + (String(p) || RegExp.prototype.source || String(RegExp.prototype).slice(1, -1)) + '/g',
				debug(nonString) + ' becomes `/' + String(p) + '/g`'
			);
		}
	});

	t.deepEqual(
		RegExpCreate(),
		// @ts-expect-error
		new RegExp(),
		'undefined pattern and flags yields empty regex'
	);
};
