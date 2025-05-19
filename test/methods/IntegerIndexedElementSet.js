'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var getTypedArrays = require('../helpers/typedArrays');

var esV = require('../helpers/v');

module.exports = function (t, year, IntegerIndexedElementSet, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { IntegerIndexedElementSet(null, nonNumber, null); },
			TypeError,
			debug(nonNumber) + ' is not a Number'
		);
	});

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTA) {
		t['throws'](
			function () { IntegerIndexedElementSet(nonTA, 0, null); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		if (year < 2020 && esV.hasBigInts) {
			forEach(esV.getBigIntTypes(2020), function (bigIntType) {
				var TA = global[bigIntType + 'Array'];
				var ta = new TA(0);
				st['throws'](
					function () { IntegerIndexedElementSet(ta, 0, BigInt(0)); },
					SyntaxError,
					bigIntType + ' is not supported until ES2020'
				);
			});
		}

		forEach(availableTypedArrays, function (TypedArray) {
			if (TypedArray !== 'Float16Array' || year >= 2024) {
				var isBigInt = esV.isBigIntTAType(TypedArray);
				var Z = isBigInt ? BigInt : Number;

				if (year >= 2020 || !isBigInt) {
					var ta = new global[TypedArray](8);

					st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
						var taD = new global[TypedArray](8);
						DetachArrayBuffer(taD.buffer);

						if (year >= 2021) {
							s2t.equal(
								IntegerIndexedElementSet(taD, 0, Z(0)),
								undefined,
								debug(taD) + ' is a detached TypedArray, returns undefined'
							);
						} else {
							s2t['throws'](
								function () { IntegerIndexedElementSet(taD, 0, Z(0)); },
								TypeError,
								debug(taD) + ' is a detached TypedArray'
							);
						}

						s2t.end();
					});

					forEach(v.nonNumbers, function (nonNumber) {
						st['throws'](
							function () { IntegerIndexedElementSet(ta, nonNumber, Z(0)); },
							TypeError,
							debug(nonNumber) + ' is not a number, throws'
						);
					});

					forEach([].concat(
						v.notNonNegativeIntegers,
						-0
					), function (notNonNegativeInt) {
						if (typeof notNonNegativeInt === 'number') {
							var expectedFail = year >= 2021 ? undefined : false;
							st.equal(
								IntegerIndexedElementSet(ta, notNonNegativeInt, Z(0)),
								expectedFail,
								debug(notNonNegativeInt) + ' is not a non-negative-integer number, returns false'
							);
						}
					});

					var expected = year >= 2021 ? undefined : true;
					st.equal(ta[0], Z(0), 'is initially zero');
					st.equal(
						IntegerIndexedElementSet(ta, 0, Z(42)),
						expected,
						'set is successful'
					);
					st.equal(ta[0], Z(42), 'has expected value');
				}
			}
		});

		st.end();
	});
};
