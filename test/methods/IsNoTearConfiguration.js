'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsNoTearConfiguration) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(esV.unclampedIntegerTypes, function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsNoTearConfiguration(type),
			true,
			debug(type) + ' with any order is a no-tear configuration'
		);
	});

	forEach(esV.bigIntTypes, function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
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
			IsNoTearConfiguration(type),
			true,
			debug(type) + ' with any other order is a no-tear configuration'
		);
	});

	forEach(esV.clampedTypes, function (type) {
		if (year >= 2024) {
			type = type.toUpperCase(); // eslint-disable-line no-param-reassign
		}
		t.equal(
			IsNoTearConfiguration(type),
			false,
			debug(type) + ' with any order is not a no-tear configuration'
		);
	});
};
