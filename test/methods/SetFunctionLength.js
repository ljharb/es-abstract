'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var hasOwn = require('hasown');
var debug = require('object-inspect');
var functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

module.exports = function (t, year, SetFunctionLength) {
	t.ok(year >= 2018, 'ES2018+');

	forEach(v.nonFunctions, function (nonFunction) {
		t['throws'](
			function () { SetFunctionLength(nonFunction, 0); },
			TypeError,
			debug(nonFunction) + ' is not a Function'
		);
	});

	t.test('non-extensible function', { skip: !Object.preventExtensions }, function (st) {
		var F = function F() {};
		Object.preventExtensions(F);

		st['throws'](
			function () { SetFunctionLength(F, 0); },
			TypeError,
			'non-extensible function throws'
		);
		st.end();
	});

	var HasLength = function HasLength(_) { return _; };
	t.equal(hasOwn(HasLength, 'length'), true, 'precondition: `HasLength` has own length');
	t['throws'](
		function () { SetFunctionLength(HasLength, 0); },
		TypeError,
		'function with own length throws'
	);

	t.test('no length', { skip: !functionsHaveConfigurableNames }, function (st) {
		var HasNoLength = function HasNoLength() {};
		delete HasNoLength.length;

		st.equal(hasOwn(HasNoLength, 'length'), false, 'precondition: `HasNoLength` has no own length');

		forEach(v.nonNumbers, function (nonNumber) {
			st['throws'](
				function () { SetFunctionLength(HasNoLength, nonNumber); },
				TypeError,
				debug(nonNumber) + ' is not a Number'
			);
		});

		forEach([].concat(
			-1,
			-42,
			-Infinity,
			year >= 2021 ? [] : Infinity,
			v.nonIntegerNumbers
		), function (nonPositiveInteger) {
			st['throws'](
				function () { SetFunctionLength(HasNoLength, nonPositiveInteger); },
				TypeError,
				debug(nonPositiveInteger) + ' is not a positive integer Number'
			);
		});

		st.end();
	});

	// TODO: defines an own configurable non-enum non-write length property

	// TODO: ensure it works with +Infinity
};
