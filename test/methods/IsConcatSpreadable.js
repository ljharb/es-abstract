'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'IsConcatSpreadable'>} */
module.exports = function (t, year, IsConcatSpreadable) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t.equal(IsConcatSpreadable(primitive), false, debug(primitive) + ' is not an Object');
	});

	var hasSymbolConcatSpreadable = v.hasSymbols && Symbol.isConcatSpreadable;
	t.test('Symbol.isConcatSpreadable', { skip: !hasSymbolConcatSpreadable }, function (st) {
		forEach(v.falsies, function (falsy) {
			/** @type {Record<PropertyKey, unknown>} */
			var obj = {};
			obj[Symbol.isConcatSpreadable] = falsy;
			st.equal(
				IsConcatSpreadable(obj),
				false,
				'an object with ' + debug(falsy) + ' as Symbol.isConcatSpreadable is not concat spreadable'
			);
		});

		forEach(v.truthies, function (truthy) {
			/** @type {Record<PropertyKey, unknown>} */
			var obj = {};
			obj[Symbol.isConcatSpreadable] = truthy;
			st.equal(
				IsConcatSpreadable(obj),
				true,
				'an object with ' + debug(truthy) + ' as Symbol.isConcatSpreadable is concat spreadable'
			);
		});

		st.end();
	});

	forEach(v.objects, function (object) {
		t.equal(
			IsConcatSpreadable(object),
			false,
			'non-array without Symbol.isConcatSpreadable is not concat spreadable'
		);
	});

	t.equal(IsConcatSpreadable([]), true, 'arrays are concat spreadable');
};
