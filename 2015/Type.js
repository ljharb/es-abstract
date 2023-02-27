'use strict';

var ES5Type = require('../5/Type');

// https://262.ecma-international.org/6.0/#sec-ecmascript-data-types-and-values

/** @type {(((x: symbol) => 'Symbol') & ((x: null) => 'Null') & ((x: undefined) => 'Undefined') & ((x: function | object) => 'Object') & ((x: number) => 'Number') & ((x: boolean) => 'Boolean') & ((x: string) => 'String') & ((x: unknown) => 'Null' | 'Undefined' | 'Object' | 'Number' | 'Boolean' | 'String' | 'Symbol'))} */
module.exports = function Type(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	return ES5Type(x);
};
