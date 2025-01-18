'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var functionsHaveNames = require('functions-have-names')();
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();
var hasOwn = require('hasown');

var getInferredName = require('../../helpers/getInferredName');
var getNamelessFunction = require('../helpers/getNamelessFunction');

/** @type {import('../testHelpers').MethodTest<'SetFunctionName'>} */
module.exports = function (t, year, SetFunctionName) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			// @ts-expect-error
			function () { SetFunctionName(nonFunction, ''); },
			TypeError,
			debug(nonFunction) + ' is not a Function'
		);
	});

	t.test('non-extensible function', { skip: !Object.preventExtensions }, function (st) {
		var f = getNamelessFunction();
		Object.preventExtensions(f);
		st['throws'](
			function () { SetFunctionName(f, ''); },
			TypeError,
			'throws on a non-extensible function'
		);
		st.end();
	});

	t.test('has an own name property', { skip: !functionsHaveNames }, function (st) {
		st['throws'](
			function () { SetFunctionName(function g() {}, ''); },
			TypeError,
			'throws if function has an own `name` property'
		);
		st.end();
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			// @ts-expect-error
			function () { SetFunctionName(getNamelessFunction(), nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Symbol or String'
		);
	});

	t.test('symbols', { skip: !v.hasSymbols || hasOwn(getNamelessFunction(), 'name') }, function (st) {
		var pairs = /** @type {const} */ ([
			[Symbol(), ''],
			[Symbol(undefined), ''],
			// @ts-expect-error
			[Symbol(null), '[null]'],
			[Symbol(''), getInferredName ? '[]' : ''],
			[Symbol.iterator, '[Symbol.iterator]'],
			[Symbol('foo'), '[foo]']
		]);
		forEach(pairs, function (pair) {
			var sym = pair[0];
			var desc = pair[1];
			var f = getNamelessFunction();
			SetFunctionName(f, sym);
			st.equal(f.name, desc, debug(sym) + ' yields a name of ' + debug(desc));
		});

		st.end();
	});

	var f = getNamelessFunction();
	t.test('when names are configurable', { skip: !functionsHaveConfigurableNames || hasOwn(f, 'name') }, function (st) {
		// without prefix
		st.notEqual(f.name, 'foo', 'precondition');
		SetFunctionName(f, 'foo');
		st.equal(f.name, 'foo', 'function name is set without a prefix');

		// with prefix
		var g = getNamelessFunction();
		st.notEqual(g.name, 'pre- foo', 'precondition');
		SetFunctionName(g, 'foo', 'pre-');
		st.equal(g.name, 'pre- foo', 'function name is set with a prefix');

		st.end();
	});
};
