'use strict';

var test = require('tape');
var hasSymbols = require('has-symbols')();
var $defineProperty = require('es-define-property');
var defineAccessorProperty = require('define-accessor-property');
var defineDataProperty = require('define-data-property');

var OwnPropertyKeys = require('../../helpers/OwnPropertyKeys');

test('OwnPropertyKeys', function (t) {
	t.deepEqual(OwnPropertyKeys({ a: 1, b: 2 }).sort(), ['a', 'b'].sort(), 'returns own string keys');

	t.test('Symbols', { skip: !hasSymbols }, function (st) {
		/** @type {Record<string | symbol, number>} */
		var o = { a: 1 };
		var sym = Symbol();
		o[sym] = 2;

		st.deepEqual(OwnPropertyKeys(o), ['a', sym], 'returns own string and symbol keys');

		st.end();
	});

	t.test('non-enumerables', { skip: !$defineProperty }, function (st) {
		/** @type {Record<string | symbol, number>} */
		var o = { a: 1, b: 42, c: NaN };
		defineDataProperty(o, 'b', { nonEnumerable: true, value: 42 });
		defineAccessorProperty(o, 'c', { nonEnumerable: true, get: function () { return NaN; } });

		if (hasSymbols) {
			defineDataProperty(o, 'd', { nonEnumerable: true, value: true });
			defineAccessorProperty(o, 'e', { nonEnumerable: true, get: function () { return true; } });
		}

		st.deepEqual(
			OwnPropertyKeys(o).sort(),
			(hasSymbols ? ['a', 'b', 'c', 'd', 'e'] : ['a', 'b', 'c']).sort(),
			'returns non-enumerable own keys, including accessors and symbols if available'
		);

		st.end();
	});

	t.end();
});
