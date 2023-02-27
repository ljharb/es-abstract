'use strict';

var hasOwn = require('hasown');

// https://262.ecma-international.org/13.0/#sec-match-records

/** @type {(record: {}) => record is import('../../types').MatchRecord} */
module.exports = function isMatchRecord(record) {
	return (
		!!record
		&& typeof record === 'object'
		&& hasOwn(record, '[[StartIndex]]')
		&& '[[StartIndex]]' in record
		&& hasOwn(record, '[[EndIndex]]')
		&& '[[EndIndex]]' in record
		&& typeof record['[[StartIndex]]'] === 'number'
		&& record['[[StartIndex]]'] >= 0
		&& typeof record['[[EndIndex]]'] === 'number'
		&& record['[[EndIndex]]'] >= record['[[StartIndex]]']
		&& String(parseInt(String(record['[[StartIndex]]']), 10)) === String(record['[[StartIndex]]'])
		&& String(parseInt(String(record['[[EndIndex]]']), 10)) === String(record['[[EndIndex]]'])
	);
};
