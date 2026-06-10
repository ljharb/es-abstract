'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, MakeDataViewWithBufferWitnessRecord) {
	t.ok(year >= 2024, 'ES2024+');

	var unordered = specEnum(year, 'unordered');

	forEach(esV.unknowns, function (nonDV) {
		t['throws'](
			function () { MakeDataViewWithBufferWitnessRecord(nonDV, unordered); },
			TypeError,
			debug(nonDV) + ' is not a DataView'
		);
	});

	t.test('DataViews supported', { skip: typeof DataView !== 'function' }, function (st) {
		forEach(v.nonStrings, function (nonString) {
			st['throws'](
				function () { MakeDataViewWithBufferWitnessRecord(new DataView(new ArrayBuffer(8)), nonString); },
				TypeError,
				debug(nonString) + ' is not a valid order value'
			);
		});

		var ab = new ArrayBuffer(8);
		var dv = new DataView(ab);

		st.deepEqual(
			MakeDataViewWithBufferWitnessRecord(dv, unordered),
			{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
			'works with a DataView, unordered'
		);

		st.deepEqual(
			MakeDataViewWithBufferWitnessRecord(dv, specEnum(year, 'seq-cst')),
			{ '[[Object]]': dv, '[[CachedBufferByteLength]]': ab.byteLength },
			'works with a DataView, seq-cst'
		);

		st.end();
	});
};
