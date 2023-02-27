// @ts-nocheck

'use strict';

var GetIntrinsic = require('get-intrinsic');
var $TypeError = require('es-errors/type');

var GetPrototypeFromConstructor = require('./GetPrototypeFromConstructor');
var IsArray = require('./IsArray');
var ObjectCreate = require('./ObjectCreate');

// https://262.ecma-international.org/6.0/#sec-ordinarycreatefromconstructor

/** @type {<Instance extends object>(constructor: import('../types').Constructor<Instance, any>, intrinsicDefaultProto: Parameters<GetIntrinsic>[0], slots?: import('../types').InternalSlot[]) => object} */
module.exports = function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto) {
	GetIntrinsic(intrinsicDefaultProto); // throws if not a valid intrinsic
	var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
	/** @type {import('../types').InternalSlot[]} */
	var slots = arguments.length < 3 ? [] : arguments[2];
	if (!IsArray(slots)) {
		throw new $TypeError('Assertion failed: if provided, `internalSlotsList` must be a List');
	}
	return ObjectCreate(proto, slots);
};
