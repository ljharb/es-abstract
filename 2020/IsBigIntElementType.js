'use strict';

// https://262.ecma-international.org/11.0/#sec-isbigintelementtype

/** @type {(type: unknown) => type is 'BigUint64' | 'BigInt64'} */
module.exports = function IsBigIntElementType(type) {
	return type === 'BigUint64' || type === 'BigInt64';
};
