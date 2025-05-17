'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var hasNamedCaptures = require('has-named-captures')();

module.exports = function (t, year, actual) {
	t.ok(year >= 2015, 'ES2015+');

	var GetSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
		if (year < 2018) {
			// ES2018 spliced in `namedCaptures` :-(
			return actual(matched, str, position, captures, replacement);
		}
		return actual(matched, str, position, captures, namedCaptures, replacement);
	};

	forEach(v.nonStrings, function (nonString) {
		t['throws'](
			function () { GetSubstitution(nonString, '', 0, [], undefined, ''); },
			TypeError,
			'`matched`: ' + debug(nonString) + ' is not a String'
		);

		t['throws'](
			function () { GetSubstitution('', nonString, 0, [], undefined, ''); },
			TypeError,
			'`str`: ' + debug(nonString) + ' is not a String'
		);

		t['throws'](
			function () { GetSubstitution('', '', 0, [], undefined, nonString); },
			TypeError,
			'`replacement`: ' + debug(nonString) + ' is not a String'
		);

		if (typeof nonString !== 'undefined') {
			t['throws'](
				function () { GetSubstitution('', '', 0, [nonString], undefined, ''); },
				TypeError,
				'`captures`: ' + debug([nonString]) + ' is not an Array of strings' + (year < 2018 ? ' or `undefined`' : '')
			);
		}
	});

	forEach(v.notNonNegativeIntegers, function (nonNonNegativeInteger) {
		t['throws'](
			function () { GetSubstitution('', '', nonNonNegativeInteger, [], undefined, ''); },
			TypeError,
			'`position`: ' + debug(nonNonNegativeInteger) + ' is not a non-negative integer'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { GetSubstitution('', '', 0, nonArray, undefined, ''); },
			TypeError,
			'`captures`: ' + debug(nonArray) + ' is not an Array'
		);
	});

	t.equal(
		GetSubstitution('def', 'abcdefghi', 3, [], undefined, '123'),
		'123',
		'returns the substitution'
	);
	t.equal(
		GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '$$2$'),
		'$2$',
		'supports $$, and trailing $'
	);

	t.equal(
		GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$&<'),
		'>abcdef<',
		'supports $&'
	);

	t.equal(
		GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$`<'),
		'><',
		'supports $` at position 0'
	);
	t.equal(
		GetSubstitution('def', 'abcdefghi', 3, [], undefined, '>$`<'),
		year < 2022 ? '>ab<' : '>abc<',
		'supports $` at position > 0'
	);

	// https://github.com/tc39/ecma262/pull/2484#discussion_r684725247
	t.equal(
		GetSubstitution('1234567', 'abc', 0, [], undefined, ">$'<"),
		'><',
		'match is longer than the input string'
	);
	t.equal(
		GetSubstitution('x', 'abc', 3, [], undefined, ">$'<"),
		'><',
		'nonempty match at the end of the input string'
	);

	t.equal(
		GetSubstitution('def', 'abcdefghi', 7, [], undefined, ">$'<"),
		'><',
		"supports $' at a position where there's less than `matched.length` chars left"
	);
	t.equal(
		GetSubstitution('def', 'abcdefghi', 3, [], undefined, ">$'<"),
		'>ghi<',
		"supports $' at a position where there's more than `matched.length` chars left"
	);

	for (var i = 0; i < 100; i += 1) {
		var captures = [];
		captures[i] = 'test';
		if (i > 0) {
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i + '<'),
				year < 2022 ? '>undefined<' : '>$' + i + '<',
				'supports $' + i + ' with no captures'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$' + i),
				year < 2022 ? '>undefined' : '>$' + i,
				'supports $' + i + ' at the end of the replacement, with no captures'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i + '<'),
				year === 2022 && i < 10 ? '>$' + i + '<' : '><',
				'supports $' + i + ' with a capture at that index'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$' + i),
				'>',
				'supports $' + i + ' at the end of the replacement, with a capture at that index'
			);
		}
		if (i < 10) {
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i + '<'),
				year < 2022 ? i === 0 ? '><' : '>undefined<' : '>$0' + i + '<',
				'supports $0' + i + ' with no captures'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, [], undefined, '>$0' + i),
				year < 2022 ? i === 0 ? '>' : '>undefined' : '>$0' + i,
				'supports $0' + i + ' at the end of the replacement, with no captures'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i + '<'),
				year >= 2022 && i === 0 ? '>$0' + i + '<' : '><',
				'supports $0' + i + ' with a capture at that index'
			);
			t.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, '>$0' + i),
				year >= 2022 && i === 0 ? '>$0' + i : '>',
				'supports $0' + i + ' at the end of the replacement, with a capture at that index'
			);
		}
	}

	t['throws'](
		function () { GetSubstitution('def', 'abcdefghi', 10, [], undefined, ">$'<"); },
		TypeError,
		'throws when `position` is larger than `str.length`'
	);

	if (year >= 2018) {
		t.equal(
			GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo><z'),
			year < 2022 ? 'a>$<oo><z' : 'a>$<foo><z',
			'works with the named capture regex without named captures'
		);
		t.equal(
			GetSubstitution('abcdef', 'abcdefghi', 0, captures, undefined, 'a>$<foo>$<z'),
			year < 2022 ? 'a>$<oo>$<' : 'a>$<foo>$<z',
			'works with a mismatched $< without named captures'
		);
	}

	if (year >= 2022) {
		t.test('named captures', function (st) {
			var namedCaptures = {
				foo: 'foo!'
			};

			st.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo><z'),
				'a>foo!<z',
				'supports named captures'
			);

			st.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<foo>$z'),
				'a>foo!$z',
				'works with a $z'
			);

			st.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, '$<foo'),
				'$<foo',
				'supports named captures with a mismatched <'
			);

			st.equal(
				GetSubstitution('abcdef', 'abcdefghi', 0, captures, namedCaptures, 'a>$<bar><z'),
				'a><z',
				'supports named captures with a missing namedCapture'
			);

			st.test('named captures, native', { skip: !hasNamedCaptures }, function (rt) {
				var str = 'abcdefghi';
				var regex = new RegExp('(?<foo>abcdef)');
				rt.equal(
					str.replace(regex, 'a>$<foo><z'),
					'a>abcdef<zghi',
					'works with the named capture regex with named captures'
				);

				rt.equal(
					str.replace(regex, 'a>$<foo>$z'),
					'a>abcdef$zghi',
					'works with a $z'
				);

				rt.equal(
					str.replace(regex, '$<foo'),
					'$<fooghi',
					'supports named captures with a mismatched <'
				);

				rt.equal(
					str.replace(regex, 'a>$<bar><z'),
					'a><zghi',
					'supports named captures with a missing namedCapture'
				);

				rt.end();
			});

			st.end();
		});
	}

	if (year >= 2024) {
		forEach(v.nonUndefinedPrimitives, function (nonUndefinedPrimitive) {
			t['throws'](
				function () { GetSubstitution('', '', 0, [], nonUndefinedPrimitive, ''); },
				TypeError,
				'`namedCaptures`: must be `undefined` or an Object'
			);
		});
	}
};
