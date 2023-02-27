'use strict';

var hasOwn = require('hasown');

var isPromiseCapabilityRecord = require('./promise-capability-record');

/** @type {<T>(value: unknown) => value is import('../../types').AsyncGeneratorRequestRecord<T>} */
module.exports = function isAsyncGeneratorRequestRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Completion]]') // TODO: confirm is a completion record
		&& hasOwn(value, '[[Capability]]')
		&& '[[Capability]]' in value
		&& isPromiseCapabilityRecord(value['[[Capability]]']);
};
