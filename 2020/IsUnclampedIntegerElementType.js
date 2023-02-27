'use strict';

// https://262.ecma-international.org/11.0/#sec-isunclampedintegerelementtype

/** @type {(type: string) => type is 'Int8' | 'Uint8' | 'Int16' | 'Uint16' | 'Int32' | 'Uint32'} */
module.exports = function IsUnclampedIntegerElementType(type) {
	return type === 'Int8'
		|| type === 'Uint8'
		|| type === 'Int16'
		|| type === 'Uint16'
		|| type === 'Int32'
		|| type === 'Uint32';
};
