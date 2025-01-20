'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, ApplyStringOrNumericBinaryOperator) {
	t.ok(year >= 2021, 'ES2021+');

	forEach([].concat(
		v.nonStrings,
		'',
		'^^',
		'//',
		'***'
	), function (nonOp) {
		t['throws'](
			function () { ApplyStringOrNumericBinaryOperator(null, nonOp, null); },
			TypeError,
			'opText must be a valid operation: ' + debug(nonOp) + ' is not an operation'
		);
	});

	var obj = {
		toString: function () { return 'abc'; }
	};
	forEach(v.strings, function (string) {
		t.equal(
			ApplyStringOrNumericBinaryOperator(string, '+', v.toStringOnlyObject),
			string + '7',
			debug(string) + ' + ' + debug(v.toStringOnlyObject) + ' is ' + debug(string + '7')
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(v.toStringOnlyObject, '+', string),
			'7' + string,
			debug(v.toStringOnlyObject) + ' + ' + debug(string) + ' is ' + debug('7' + v.toStringOnlyObject)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(string, '+', string),
			string + string,
			debug(string) + ' + ' + debug(string) + ' is ' + debug(string + string)
		);

		t.equal(
			ApplyStringOrNumericBinaryOperator(string, '+', obj),
			string + 'abc',
			debug(string) + ' + ' + debug(obj) + ' is ' + debug(string + 'abc')
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(obj, '+', string),
			'abc' + string,
			debug(obj) + ' + ' + debug(string) + ' is ' + debug('abc' + string)
		);
	});
	t.equal(
		ApplyStringOrNumericBinaryOperator(obj, '+', obj),
		'abcabc',
		debug(obj) + ' + ' + debug(obj) + ' is ' + debug('abcabc')
	);
	t.equal(
		ApplyStringOrNumericBinaryOperator(v.toStringOnlyObject, '+', v.toStringOnlyObject),
		14,
		debug(v.toStringOnlyObject) + ' + ' + debug(v.toStringOnlyObject) + ' is 14'
	);

	forEach(v.numbers, function (number) {
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '+', number),
			number + number,
			debug(number) + ' + itself is ' + debug(number + number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '-', number),
			number - number,
			debug(number) + ' - itself is ' + debug(number + number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '*', number),
			number * number,
			debug(number) + ' * itself is ' + debug(number + number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '**', number),
			Math.pow(number, number),
			debug(number) + ' ** itself is ' + debug(Math.pow(number, number))
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '/', number),
			number / number,
			debug(number) + ' / itself is ' + debug(number / number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '%', number),
			number % number,
			debug(number) + ' % itself is ' + debug(number % number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '<<', number),
			number << number,
			debug(number) + ' << itself is ' + debug(number << number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '>>', number),
			number >> number,
			debug(number) + ' >> itself is ' + debug(number >> number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '>>>', number),
			number >>> number,
			debug(number) + ' >>> itself is ' + debug(number >>> number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '&', number),
			number & number,
			debug(number) + ' & itself is ' + debug(number & number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '^', number),
			number ^ number,
			debug(number) + ' ^ itself is ' + debug(number ^ number)
		);
		t.equal(
			ApplyStringOrNumericBinaryOperator(number, '|', number),
			number | number,
			debug(number) + ' | itself is ' + debug(number | number)
		);
	});

	t.test('BigInt support', { skip: !esV.hasBigInts }, function (st) {
		forEach(v.bigints, function (bigint) {
			st['throws'](
				function () { ApplyStringOrNumericBinaryOperator(Number(bigint), '+', bigint); },
				TypeError,
				'Number and BigInt can not be added'
			);
			st['throws'](
				function () { ApplyStringOrNumericBinaryOperator(bigint, '+', Number(bigint)); },
				TypeError,
				'BigInt and Number can not be added'
			);
		});

		st.end();
	});
};
