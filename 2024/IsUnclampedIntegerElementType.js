'use strict';

// https://262.ecma-international.org/15.0/#sec-isunclampedintegerelementtype

/** @type {(type: string) => type is 'INT8' | 'UINT8' | 'INT16' | 'UINT16' | 'INT32' | 'UINT32'} */
module.exports = function IsUnclampedIntegerElementType(type) {
	return type === 'INT8'
		|| type === 'UINT8'
		|| type === 'INT16'
		|| type === 'UINT16'
		|| type === 'INT32'
		|| type === 'UINT32';
};
