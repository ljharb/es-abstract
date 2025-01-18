'use strict';

var assign = require('object.assign');
var debug = require('object-inspect');
var forEach = require('for-each');
var keys = require('object-keys');
var v = require('es-value-fixtures');

var caseFolding = require('../../helpers/caseFolding.json');

/** @type {import('../testHelpers').MethodTest<'IsWordChar'>} */
module.exports = function (t, year, actual) {
	t.ok(year >= 2015, 'ES2015+');

	/** @type {import('../testHelpers').AOOnlyYears<'IsWordChar', 2023 | 2024>} */
	var IsWordChar = year >= 2023
		? /** @type {import('../testHelpers').AOOnlyYears<'IsWordChar', 2023 | 2024>} */ (actual)
		: year >= 2017
			? function IsWordChar(rer, Input, e) { // ES2017 - ES2022
				return /** @type {import('../testHelpers').AOOnlyYears<'IsWordChar', 2017 | 2018 | 2019 | 2020 | 2021 | 2022>} */ (actual)(
					e,
					Input.length,
					Input,
					rer['[[IgnoreCase]]'],
					rer['[[Unicode]]']
				);
			}
			: function IsWordChar(_rer, Input, e) { // ES2015 - ES2016
				return /** @type {import('../testHelpers').AOOnlyYears<'IsWordChar', 2015 | 2016>} */ (actual)(
					e,
					Input.length,
					Input
				);
			};

	var rer = {
		'[[IgnoreCase]]': false,
		'[[Multiline]]': false,
		'[[DotAll]]': false,
		'[[Unicode]]': false,
		'[[CapturingGroupsCount]]': 1
	};

	forEach(v.nonIntegerNumbers, function (nonInteger) {
		t['throws'](
			// @ts-expect-error
			function () { IsWordChar(rer, { length: nonInteger }); },
			TypeError,
			'Input.length: ' + debug(nonInteger) + ' is not an integer'
		);

		t['throws'](
			function () { IsWordChar(rer, [], nonInteger); },
			TypeError,
			'e: ' + debug(nonInteger) + ' is not an integer'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { IsWordChar(assign({}, rer, { '[[IgnoreCase]]': nonBoolean }), '', 0); },
			TypeError,
			'[[IgnoreCase]]: ' + debug(nonBoolean) + ' is not a Boolean'
		);

		t['throws'](
			// @ts-expect-error
			function () { IsWordChar(assign({}, rer, { '[[Unicode]]': nonBoolean }), '', 0); },
			TypeError,
			'[[Unicode]]: ' + debug(nonBoolean) + ' is not a Boolean'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { return IsWordChar(rer, nonArray, 0); },
			TypeError,
			'Input: ' + debug(nonArray) + ' is not an Array'
		);
	});

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			// @ts-expect-error
			function () { return IsWordChar(rer, [nonString], 0); },
			TypeError,
			'Input: ' + debug(nonString) + ' is not a character'
		);
	});

	t.equal(IsWordChar(rer, [], -1), false, '`e`: -1 yields false');
	t.equal(IsWordChar(rer, [], 1), false, 'arg 1 and 2 the same yields false');
	t.equal(IsWordChar(rer, ['a'], 1), false, 'arg 1 and 2 the same yields false even with non-word chars');
	t.equal(IsWordChar(rer, ['a'], 1), false, 'arg 1 and 2 the same yields false even with word chars');

	t.equal(IsWordChar(rer, [], 0), false, 'arg 2 length and arg 3 the same yields false');

	t.equal(IsWordChar(rer, ['a', '!'], 0), true, 'a is a word char');
	t.equal(IsWordChar(rer, ['!', 'b'], 1), true, 'b is a word char');

	if (year >= 2017) {
		forEach(/** @type {(keyof typeof caseFolding.C)[]} */ (keys(caseFolding.C)), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.C[input]);
			t.equal(
				IsWordChar(assign({}, rer, { '[[Unicode]]': true }), [input], 0),
				isBasic,
				'C mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				IsWordChar(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), [input], 0),
				isBasic || isFancy,
				'C mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});

		forEach(/** @type {(keyof typeof caseFolding.S)[]} */ (keys(caseFolding.S)), function (input) {
			var isBasic = (/^[a-zA-Z0-9_]$/).test(input);
			var isFancy = (/^[a-zA-Z0-9_]$/).test(caseFolding.S[input]);
			t.equal(
				IsWordChar(assign({}, rer, { '[[Unicode]]': true }), [input], 0),
				isBasic,
				'S mapping, IgnoreCase false: ' + debug(input) + ' is a word char'
			);
			t.equal(
				IsWordChar(assign({}, rer, { '[[IgnoreCase]]': true, '[[Unicode]]': true }), [input], 0),
				isBasic || isFancy,
				'S mapping, IgnoreCase true: ' + debug(input) + ' is a word char'
			);
		});
	}
};
