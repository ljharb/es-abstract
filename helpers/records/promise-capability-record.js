'use strict';

var hasOwn = require('hasown');

/** @type {<T>(value: unknown) => value is import('../../types').PromiseCapabilityRecord<T>} */
module.exports = function isPromiseCapabilityRecord(value) {
	return !!value
        && typeof value === 'object'
		&& hasOwn(value, '[[Resolve]]')
		&& '[[Resolve]]' in value
		&& typeof value['[[Resolve]]'] === 'function'
		&& hasOwn(value, '[[Reject]]')
		&& '[[Reject]]' in value
		&& typeof value['[[Reject]]'] === 'function'
		&& hasOwn(value, '[[Promise]]')
		&& '[[Promise]]' in value
		&& !!value['[[Promise]]']
        && typeof value['[[Promise]]'] === 'object'
		&& 'then' in value['[[Promise]]']
		&& typeof value['[[Promise]]'].then === 'function';
};
