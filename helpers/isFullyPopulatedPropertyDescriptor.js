'use strict';

var isPropertyDescriptor = require('./records/property-descriptor');

/** @type {<T>(ES: Pick<import('../types').ES, 'IsAccessorDescriptor' | 'IsDataDescriptor'>, Desc: unknown) => Desc is import('../types').CompleteDescriptor<T>} */
module.exports = function isFullyPopulatedPropertyDescriptor(ES, Desc) {
	return isPropertyDescriptor(Desc)
		&& '[[Enumerable]]' in Desc
		&& '[[Configurable]]' in Desc
		&& (ES.IsAccessorDescriptor(Desc) || ES.IsDataDescriptor(Desc));
};
