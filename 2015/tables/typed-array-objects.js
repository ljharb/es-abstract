'use strict';

var Enum = require('../../helpers/enum');

// https://262.ecma-international.org/6.0/#table-49

module.exports = {
	__proto__: null,
	name: {
		__proto__: null,
		$Int8Array: 'Int8',
		$Uint8Array: 'Uint8',
		$Uint8ClampedArray: 'Uint8C',
		$Int16Array: 'Int16',
		$Uint16Array: 'Uint16',
		$Int32Array: 'Int32',
		$Uint32Array: 'Uint32',
		$Float32Array: 'Float32',
		$Float64Array: 'Float64'
	},
	size: {
		__proto__: null,
		$Int8: 1,
		$Uint8: 1,
		$Uint8C: 1,
		$Int16: 2,
		$Uint16: 2,
		$Int32: 4,
		$Uint32: 4,
		$Float32: 4,
		$Float64: 8
	},
	types: [
		Enum.define('Int8'),
		Enum.define('Uint8'),
		Enum.define('Uint8C'),
		Enum.define('Int16'),
		Enum.define('Uint16'),
		Enum.define('Int32'),
		Enum.define('Uint32'),
		Enum.define('Float32'),
		Enum.define('Float64')
	]
};
