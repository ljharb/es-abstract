'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var Enum = require('../../helpers/enum');

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

		forEach([].concat(
			year < 2024 ? ['Init', Enum('Init')] : [],
			year === 2024 ? 'INIT' : [],
			year >= 2024 ? Enum('INIT') : []
		), function (init) {
			t.equal(
				IsNoTearConfiguration(type, init),
				false,
				debug(type) + ' with ' + debug(init) + ' is not a no-tear configuration'
			);
		});

		forEach([].concat(
			year < 2024 ? ['Unordered', Enum('Unordered')] : [],
			year === 2024 ? 'UNORDERED' : [],
			year >= 2024 ? Enum('UNORDERED') : []
		), function (unordered) {
			t.equal(
				IsNoTearConfiguration(type, unordered),
				false,
				debug(type) + ' with ' + debug(unordered) + ' is not a no-tear configuration'
			);
		});

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
