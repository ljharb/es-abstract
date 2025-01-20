'use strict';

var availableTypedArrays = require('available-typed-arrays')();
var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

module.exports = function (t, year, TypedArraySetElement, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(esV.unknowns, function (nonTA) {
		t['throws'](
			function () { TypedArraySetElement(nonTA, 0, 0); },
			TypeError,
			debug(nonTA) + ' is not a Typed Array'
		);
	});

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (typedArray) {
			var isBigInt = esV.isBigIntTAType(typedArray);
			var Z = isBigInt ? safeBigInt : Number;
			var TA = global[typedArray];
			var ta = new TA(16);

			forEach(v.nonNumbers, function (nonNumber) {
				st['throws'](
					function () { TypedArraySetElement(ta, nonNumber, 0); },
					TypeError,
					'index: ' + debug(nonNumber) + ' is not a Number'
				);
			});

			st.equal(ta[0], Z(0), 'is initially zero');
			TypedArraySetElement(ta, 0, Z(42));
			st.equal(ta[0], Z(42), 'is set as expected');

			st['throws'](
				function () { TypedArraySetElement(ta, 0, v.uncoercibleObject); },
				TypeError,
				'non-number/bigint-coercible value ' + debug(v.uncoercibleObject) + ' throws'
			);

			st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
				DetachArrayBuffer(ta.buffer);

				s2t.equal(ta[0], undefined, 'is initially undefined');
				TypedArraySetElement(ta, 0, Z(7));
				s2t.equal(ta[0], undefined, 'is not set, as expected');

				s2t.end();
			});
		});

		st.end();
	});
};
