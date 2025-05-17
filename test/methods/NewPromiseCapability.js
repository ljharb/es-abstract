'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var isPromiseCapabilityRecord = require('../../helpers/records/promise-capability-record');

module.exports = function (t, year, NewPromiseCapability) {
	t.ok(year >= 2015, 'ES2015+');

	forEach([].concat(
		v.nonFunctions,
		v.nonConstructorFunctions
	), function (nonConstructor) {
		t['throws'](
			function () { NewPromiseCapability(nonConstructor); },
			TypeError,
			debug(nonConstructor) + ' is not a constructor'
		);
	});

	var calls = [];

	var C = function C(executor) {
		calls.push('constructor');
		t.equal(arguments.length, 1, 'is passed one argument');
		t.equal(typeof executor, 'function', 'is passed a function');

		executor(
			function resolve() { calls.push('resolve'); },
			function reject() { calls.push('reject'); }
		);
	};
	C.prototype.then = function () {};

	var record = NewPromiseCapability(C);
	t.equal(
		isPromiseCapabilityRecord(record),
		true,
		'return value is a Promise Capability Record'
	);

	t.ok(record['[[Promise]]'] instanceof C, 'is an instance of the passed constructor');

	t.deepEqual(calls, ['constructor']);

	record['[[Resolve]]']();

	t.deepEqual(calls, ['constructor', 'resolve']);

	record['[[Reject]]']();

	t.deepEqual(calls, ['constructor', 'resolve', 'reject']);
};
