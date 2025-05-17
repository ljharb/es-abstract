'use strict';

var debug = require('object-inspect');
var safeBigInt = require('safe-bigint');

var esV = require('../helpers/v');

var twoSixtyFour = safeBigInt && safeBigInt(Math.pow(2, 64));
var twoSixtyThree = safeBigInt && safeBigInt(Math.pow(2, 63));

module.exports = function (t, year, ToBigUint64) {
	t.ok(year >= 2020, 'ES2020+');

	t.test('bigints', { skip: !esV.hasBigInts }, function (st) {
		var twoSixtyFourMinusOne = twoSixtyFour - BigInt(1);
		var twoSixtyThreeMinusOne = twoSixtyThree - BigInt(1);
		var negTwoSixtyThreeMinusOne = -twoSixtyThree - BigInt(1);

		st.equal(ToBigUint64(twoSixtyThreeMinusOne), twoSixtyThreeMinusOne, debug(twoSixtyThreeMinusOne) + ' returns itself');
		st.equal(ToBigUint64(twoSixtyThree), twoSixtyThree, debug(twoSixtyThree) + ' returns itself');
		st.equal(ToBigUint64(twoSixtyFourMinusOne), twoSixtyFourMinusOne, debug(twoSixtyFourMinusOne) + ' returns itself');
		st.equal(ToBigUint64(-twoSixtyThree), twoSixtyThree, debug(-twoSixtyThree) + ' returns ' + debug(twoSixtyThree));

		st.equal(
			ToBigUint64(twoSixtyFour),
			BigInt(0),
			debug(twoSixtyFour) + ' returns 0n'
		);
		st.equal(
			ToBigUint64(negTwoSixtyThreeMinusOne),
			twoSixtyFour - twoSixtyThree - BigInt(1),
			debug(negTwoSixtyThreeMinusOne) + ' returns ' + debug(twoSixtyFour - twoSixtyThree - BigInt(1))
		);

		st.end();
	});
};
