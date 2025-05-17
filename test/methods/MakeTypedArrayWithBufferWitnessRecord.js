'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

module.exports = function (t, year, MakeTypedArrayWithBufferWitnessRecord) {
	t.ok(year >= 2024, 'ES2024+');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { MakeTypedArrayWithBufferWitnessRecord(nonTA, 'UNORDERED'); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);
	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			st.test('Typed Array: ' + TypedArray, function (tat) {
				var TA = global[TypedArray];
				var ta = new TA(8);

				tat['throws'](
					function () { MakeTypedArrayWithBufferWitnessRecord(ta, 'not a valid order'); },
					TypeError,
					'invalid order enum value throws'
				);

				var record = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');
				tat.deepEqual(record, {
					'[[Object]]': ta,
					'[[CachedBufferByteLength]]': ta.byteLength
				});

				tat.end();
			});
		});

		st.end();
	});
};
