'use strict';

var isPropertyDescriptor = require('./records/property-descriptor');

/** @type {<T>(ES: { IsAccessorDescriptor: <T>(x: unknown) => x is import('../types').AccessorDescriptor<T>, IsDataDescriptor: <T>(x: unknown) => x is import('../types').DataDescriptor<T> }, Desc: unknown) => Desc is import('../types').CompleteDescriptor<T>} */
module.exports = function isFullyPopulatedPropertyDescriptor(ES, Desc) {
	return isPropertyDescriptor(Desc)
		&& '[[Enumerable]]' in Desc
		&& '[[Configurable]]' in Desc
		&& (ES.IsAccessorDescriptor(Desc) || ES.IsDataDescriptor(Desc));
};
