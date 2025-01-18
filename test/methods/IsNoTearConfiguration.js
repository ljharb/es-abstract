'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'IsNoTearConfiguration'>} */
module.exports = function (t, year, IsNoTearConfiguration) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.unclampedIntegerTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			// @ts-expect-error
			IsNoTearConfiguration(type),
			true,
			debug(type) + ' with any order is a no-tear configuration'
		);
	});

	forEach(esV.bigIntTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			IsNoTearConfiguration(type, year >= 2024 ? 'INIT' : 'Init'),
			false,
			debug(type) + ' with ' + debug('Init') + ' is not a no-tear configuration'
		);

		t.equal(
			IsNoTearConfiguration(type, year >= 2024 ? 'UNORDERED' : 'Unordered'),
			false,
			debug(type) + ' with ' + debug('Unordered') + ' is not a no-tear configuration'
		);

		t.equal(
			// @ts-expect-error
			IsNoTearConfiguration(type),
			true,
			debug(type) + ' with any other order is a no-tear configuration'
		);
	});

	forEach(esV.clampedTypes, function (lowerType) {
		var type = year >= 2024 ? /** @type {Uppercase<typeof lowerType>} */ (lowerType.toUpperCase()) : lowerType;

		t.equal(
			// @ts-expect-error
			IsNoTearConfiguration(type),
			false,
			debug(type) + ' with any order is not a no-tear configuration'
		);
	});
};
