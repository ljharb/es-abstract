// @ts-nocheck

'use strict';

var ValidateAndApplyPropertyDescriptor = require('./ValidateAndApplyPropertyDescriptor');

// https://262.ecma-international.org/13.0/#sec-iscompatiblepropertydescriptor

/** @type {<T>(Extensible: boolean, Desc: import('../types').Descriptor<T>, Current: undefined | import('../types').Descriptor<T>) => ReturnType<typeof ValidateAndApplyPropertyDescriptor>} */
module.exports = function IsCompatiblePropertyDescriptor(Extensible, Desc, Current) {
	return ValidateAndApplyPropertyDescriptor(void undefined, void undefined, Extensible, Desc, Current);
};
