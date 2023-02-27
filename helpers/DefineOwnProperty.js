'use strict';

var hasPropertyDescriptors = require('has-property-descriptors');

var $defineProperty = require('es-define-property');

var hasArrayLengthDefineBug = hasPropertyDescriptors.hasArrayLengthDefineBug();

var isArray = require('../helpers/IsArray');

var callBound = require('call-bound');

var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

/** @type {<T>(IsDataDescriptor: <V>(x: import('../types').DataDescriptor<V> | undefined) => x is import('../types').DataDescriptor<V>, SameValue: (x: unknown, y: unknown) => boolean, FromPropertyDescriptor: ((Desc: undefined) => undefined) & (<V>(Desc: import('../types').Descriptor<V>) => PropertyDescriptor), O: Record<string | symbol, unknown>, P: string | symbol, desc: import('../types').Descriptor<T>) => boolean} */
// eslint-disable-next-line max-params
module.exports = function DefineOwnProperty(IsDataDescriptor, SameValue, FromPropertyDescriptor, O, P, desc) {
	if (!$defineProperty) {
		if (!IsDataDescriptor(desc)) {
			// ES3 does not support getters/setters
			return false;
		}
		if (!desc['[[Configurable]]'] || !desc['[[Writable]]']) {
			return false;
		}

		// fallback for ES3
		if (P in O && $isEnumerable(O, P) !== !!desc['[[Enumerable]]']) {
			// a non-enumerable existing property
			return false;
		}

		// property does not exist at all, or exists but is enumerable
		var V = desc['[[Value]]'];
		// eslint-disable-next-line no-param-reassign
		O[P] = V; // will use [[Define]]
		return SameValue(O[P], V);
	}
	if (
		hasArrayLengthDefineBug
		&& P === 'length'
		&& '[[Value]]' in desc
		&& isArray(O)
		&& O.length !== desc['[[Value]]']
	) {
		// eslint-disable-next-line no-param-reassign
		O.length = /** @type {number} */ (desc['[[Value]]']);
		return O.length === desc['[[Value]]'];
	}

	$defineProperty(O, P, FromPropertyDescriptor(desc));
	return true;
};
