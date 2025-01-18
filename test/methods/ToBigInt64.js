'use strict';

var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'ToBigInt64'>} */
module.exports = function (t, year, ToBigInt64) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('has bigints', { skip: !esV.hasBigInts }, function (st) {
		if (safeBigInt) {
			var twoSixtyFour = safeBigInt(Math.pow(2, 64));
			var twoSixtyThree = safeBigInt(Math.pow(2, 63));

			var twoSixtyThreeMinusOne = twoSixtyThree - BigInt(1);
			var negTwoSixtyThreeMinusOne = -twoSixtyThree - BigInt(1);

			st.equal(ToBigInt64(twoSixtyThreeMinusOne), twoSixtyThreeMinusOne, debug(twoSixtyThreeMinusOne) + ' returns itself');
			st.equal(ToBigInt64(-twoSixtyThree), -twoSixtyThree, debug(-twoSixtyThree) + ' returns itself');

			st.equal(
				ToBigInt64(twoSixtyThree),
				twoSixtyThree - twoSixtyFour,
				debug(twoSixtyThree) + ' returns ' + debug(twoSixtyThree - twoSixtyFour)
			);
			st.equal(
				ToBigInt64(negTwoSixtyThreeMinusOne),
				twoSixtyFour - twoSixtyThree - BigInt(1),
				debug(negTwoSixtyThreeMinusOne) + ' returns ' + debug(twoSixtyFour - twoSixtyThree - BigInt(1))
			);
		}

		st.end();
	});

	t.test('no bigints', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { ToBigInt64(1); },
			SyntaxError,
			'throws a SyntaxError if BigInt is not supported'
		);

		st.end();
	});
};
