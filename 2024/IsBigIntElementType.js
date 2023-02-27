'use strict';

// https://262.ecma-international.org/15.0/#sec-isbigintelementtype

/** @type {(type: unknown) => type is 'BIGUINT64' | 'BIGINT64'} */
module.exports = function IsBigIntElementType(type) {
	return type === 'BIGUINT64' || type === 'BIGINT64';
};
