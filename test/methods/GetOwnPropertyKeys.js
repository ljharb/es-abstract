'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $defineProperty = require('es-define-property');

var defineProperty = require('../helpers/defineProperty');

module.exports = function (t, year, GetOwnPropertyKeys) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { GetOwnPropertyKeys(primitive, 'String'); },
			TypeError,
			'O: ' + debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		function () { GetOwnPropertyKeys({}, 'not string or symbol'); },
		TypeError,
		'Type: must be "String" or "Symbol"'
	);

	t.test('Symbols', { skip: !v.hasSymbols }, function (st) {
		var O = { a: 1 };
		O[Symbol.iterator] = true;
		var s = Symbol('test');
		defineProperty(O, s, { enumerable: false, value: true });

		st.deepEqual(
			GetOwnPropertyKeys(O, 'Symbol'),
			[Symbol.iterator, s],
			'works with Symbols, enumerable or not'
		);

		st.end();
	});

	t.test('non-enumerable names', { skip: !$defineProperty }, function (st) {
		var O = { a: 1 };
		defineProperty(O, 'b', { enumerable: false, value: 2 });
		if (v.hasSymbols) {
			O[Symbol.iterator] = true;
		}

		st.deepEqual(
			GetOwnPropertyKeys(O, 'String').sort(),
			['a', 'b'].sort(),
			'works with Strings, enumerable or not'
		);

		st.end();
	});

	t.deepEqual(
		GetOwnPropertyKeys({ a: 1, b: 2 }, 'String').sort(),
		['a', 'b'].sort(),
		'works with enumerable keys'
	);
};
