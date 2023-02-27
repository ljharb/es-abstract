'use strict';

var ES5Type = require('../5/Type');

// https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values

/** @type {(((x: symbol) => 'Symbol') & ((x: bigint) => 'BigInt') & ((x: null) => 'Null') & ((x: undefined) => 'Undefined') & ((x: function | object) => 'Object') & ((x: number) => 'Number') & ((x: boolean) => 'Boolean') & ((x: string) => 'String') & ((x: unknown) => 'Null' | 'Undefined' | 'Object' | 'Number' | 'Boolean' | 'String' | 'Symbol' | 'BigInt'))} */
module.exports = function Type(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	if (typeof x === 'bigint') {
		return 'BigInt';
	}
	return ES5Type(x);
};
