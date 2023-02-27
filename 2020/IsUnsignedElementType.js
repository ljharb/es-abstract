'use strict';

// https://262.ecma-international.org/11.0/#sec-isunsignedelementtype

/** @type {(type: unknown) => type is 'Uint8' | 'Uint8C' | 'Uint16' | 'Uint32' | 'BigUint64'} */
module.exports = function IsUnsignedElementType(type) {
	return type === 'Uint8'
		|| type === 'Uint8C'
		|| type === 'Uint16'
		|| type === 'Uint32'
		|| type === 'BigUint64';
};
