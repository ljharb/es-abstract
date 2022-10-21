'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, GetUTCEpochNanoseconds) {
	t.ok(year >= 2023, 'ES2023+');

	t.test('invalid values', function (st) {
		forEach(esV.notInts, function (nonInteger) {
			st['throws'](
				function () { GetUTCEpochNanoseconds(nonInteger, 1, 1, 0, 0, 0, 0, 0, 0, 0); },
				TypeError,
				'year: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, nonInteger, 1, 0, 0, 0, 0, 0, 0); },
				TypeError,
				'month: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 0, nonInteger, 0, 0, 0, 0, 0, 0); },
				TypeError,
				'day: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, nonInteger, 0, 0, 0, 0, 0); },
				TypeError,
				'hour: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, 0, nonInteger, 0, 0, 0, 0); },
				TypeError,
				'minute: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, nonInteger, 0, 0, 0); },
				TypeError,
				'second: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, nonInteger, 0, 0); },
				TypeError,
				'millisecond: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, nonInteger, 0); },
				TypeError,
				'microsecond: ' + debug(nonInteger) + ' is not a valid integer'
			);
			st['throws'](
				function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, 0, nonInteger); },
				TypeError,
				'nanosecond: ' + debug(nonInteger) + ' is not a valid integer'
			);
		});

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 0, 1, 0, 0, 0, 0, 0, 0); },
			TypeError,
			'month: 0 is not a valid integer between 1 and 12, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 13, 1, 0, 0, 0, 0, 0, 0); },
			TypeError,
			'month: 13 is not a valid integer between 1 and 12, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 0, 0, 0, 0, 0, 0, 0); },
			TypeError,
			'day: 0 is not a valid integer between 1 and 31, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 32, 0, 0, 0, 0, 0, 0); },
			TypeError,
			'day: 32 is not a valid integer between 1 and 31, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, -1, 0, 0, 0, 0, 0); },
			TypeError,
			'hour: -1 is not a valid integer between 0 and 23, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 24, 0, 0, 0, 0, 0); },
			TypeError,
			'hour: 24 is not a valid integer between 0 and 23, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, -1, 0, 0, 0, 0); },
			TypeError,
			'minute: -1 is not a valid integer between 0 and 59, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 60, 0, 0, 0, 0); },
			TypeError,
			'minute: 60 is not a valid integer between 0 and 59, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, -1, 0, 0, 0); },
			TypeError,
			'second: -1 is not a valid integer between 0 and 59, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 60, 0, 0, 0); },
			TypeError,
			'second: 60 is not a valid integer between 0 and 59, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, -1, 0, 0); },
			TypeError,
			'millisecond: -1 is not a valid integer between 0 and 999, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 1000, 0, 0); },
			TypeError,
			'millisecond: 1000 is not a valid integer between 0 and 999, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, -1, 0); },
			TypeError,
			'microsecond: -1 is not a valid integer between 0 and 999, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, 1000, 0); },
			TypeError,
			'microsecond: 1000 is not a valid integer between 0 and 999, inclusive'
		);

		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, 0, -1); },
			TypeError,
			'nanosecond: -1 is not a valid integer between 0 and 999, inclusive'
		);
		st['throws'](
			function () { GetUTCEpochNanoseconds(0, 1, 1, 0, 0, 0, 0, 0, 1000); },
			TypeError,
			'nanosecond: 1000 is not a valid integer between 0 and 999, inclusive'
		);

		st.end();
	});

	t.test('BigInt supported', { skip: !esV.hasBigInts }, function (st) {
		st.deepEqual(GetUTCEpochNanoseconds(2025, 5, 19, 14, 45, 2, 0, 0, 0), BigInt(1747665902000000000), '2025-05-19T14:45:02.000000000Z');

		st.end();
	});

	t.test('no BigInts', { skip: esV.hasBigInts }, function (st) {
		st['throws'](
			function () { GetUTCEpochNanoseconds(2025, 5, 19, 14, 45, 2, 0, 0, 0); },
			SyntaxError,
			'BigInts are not supported in this environment'
		);

		st.end();
	});
};
