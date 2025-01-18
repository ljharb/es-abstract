'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'MakeDataViewWithBufferWitnessRecord'>} */
module.exports = function (t, year, MakeDataViewWithBufferWitnessRecord) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonDV) {
		t['throws'](
			// @ts-expect-error
			function () { MakeDataViewWithBufferWitnessRecord(nonDV, 'UNORDERED'); },
			TypeError,
			debug(nonDV) + ' is not a DataView'
		);
	});

	t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
		forEach(v.nonStrings, function (nonString) {
			st['throws'](
				// @ts-expect-error
				function () { MakeDataViewWithBufferWitnessRecord(new DataView(new ArrayBuffer(8)), nonString); },
				TypeError,
				debug(nonString) + ' is not a valid order value'
			);
		});

		var ab = new ArrayBuffer(8);
		var dv = new DataView(ab);

		st.deepEqual(
			MakeDataViewWithBufferWitnessRecord(dv, 'UNORDERED'),
			{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
			'works with a DataView, unordered'
		);

		st.deepEqual(
			MakeDataViewWithBufferWitnessRecord(dv, 'SEQ-CST'),
			{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
			'works with a DataView, seq-cst'
		);

		st.end();
	});
};
