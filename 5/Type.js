'use strict';

var isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/5.1/#sec-8

/** @type {(((x: null) => 'Null') & ((x: undefined) => 'Undefined') & ((x: function | object) => 'Object') & ((x: number) => 'Number') & ((x: boolean) => 'Boolean') & ((x: string) => 'String') & ((x: unknown) => 'Null' | 'Undefined' | 'Object' | 'Number' | 'Boolean' | 'String'))} */
module.exports = function Type(x) {
	if (x === null) {
		return 'Null';
	}
	if (typeof x === 'undefined') {
		return 'Undefined';
	}
	if (isObject(x)) {
		return 'Object';
	}
	if (typeof x === 'number') {
		return 'Number';
	}
	if (typeof x === 'boolean') {
		return 'Boolean';
	}
	if (typeof x === 'string') {
		return 'String';
	}
	return void undefined;
};
