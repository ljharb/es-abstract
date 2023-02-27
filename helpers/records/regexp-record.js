'use strict';

var hasOwn = require('hasown');

var isInteger = require('../isInteger');

/** @type {(value: unknown) => value is import('../../types').RegExpRecord} */
module.exports = function isRegExpRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[IgnoreCase]]')
		&& '[[IgnoreCase]]' in value
		&& typeof value['[[IgnoreCase]]'] === 'boolean'
		&& hasOwn(value, '[[Multiline]]')
		&& '[[Multiline]]' in value
		&& typeof value['[[Multiline]]'] === 'boolean'
		&& hasOwn(value, '[[DotAll]]')
		&& '[[DotAll]]' in value
		&& typeof value['[[DotAll]]'] === 'boolean'
		&& hasOwn(value, '[[Unicode]]')
		&& '[[Unicode]]' in value
		&& typeof value['[[Unicode]]'] === 'boolean'
		&& hasOwn(value, '[[CapturingGroupsCount]]')
		&& '[[CapturingGroupsCount]]' in value
		&& typeof value['[[CapturingGroupsCount]]'] === 'number'
		&& isInteger(value['[[CapturingGroupsCount]]'])
		&& value['[[CapturingGroupsCount]]'] >= 0
		&& (!hasOwn(value, '[[UnicodeSets]]') || typeof value['[[UnicodeSets]]'] === 'boolean'); // optional since it was added later
};
