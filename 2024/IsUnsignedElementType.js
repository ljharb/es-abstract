'use strict';

// https://262.ecma-international.org/15.0/#sec-isunsignedelementtype

/** @type {(type: unknown) => type is 'Uint8' | 'Uint8C' | 'Uint16' | 'Uint32' | 'BigUint64'} */
module.exports = function IsUnsignedElementType(type) {
	return type === 'UINT8'
		|| type === 'UINT8C'
		|| type === 'UINT16'
		|| type === 'UINT32'
		|| type === 'BIGUINT64';
};
