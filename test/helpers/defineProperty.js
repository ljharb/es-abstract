'use strict';

var $defineProperty = require('es-define-property');

/** @type {(O: { [k in import('../../types').PropertyKey]: unknown }, P: import('../../types').PropertyKey, Desc: PropertyDescriptor) => typeof O} */
module.exports = function defineProperty(O, P, Desc) {
	if ($defineProperty) {
		return $defineProperty(O, P, Desc);
	}
	if ((Desc.enumerable && Desc.configurable && Desc.writable) || !(P in O)) {
		O[P] = Desc.value; // eslint-disable-line no-param-reassign
		return O;
	}

	throw new SyntaxError('helper does not yet support this configuration');
};
