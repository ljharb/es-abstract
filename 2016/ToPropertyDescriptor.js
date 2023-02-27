// @ts-nocheck

'use strict';

var hasOwn = require('hasown');

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var IsCallable = require('./IsCallable');
var ToBoolean = require('./ToBoolean');

// https://262.ecma-international.org/5.1/#sec-8.10.5

/** @type {<T>(Obj: PropertyDescriptor) => import('../types').Descriptor<T>} */
module.exports = function ToPropertyDescriptor(Obj) {
	if (!isObject(Obj)) {
		throw new $TypeError('ToPropertyDescriptor requires an object');
	}

	/** @type {ReturnType<ToPropertyDescriptor> & Record<string | symbol, unknown>} */
	var desc = {};
	if (hasOwn(Obj, 'enumerable') && 'enumerable' in Obj) {
		desc['[[Enumerable]]'] = ToBoolean(Obj.enumerable);
	}
	if (hasOwn(Obj, 'configurable') && 'configurable' in Obj) {
		desc['[[Configurable]]'] = ToBoolean(Obj.configurable);
	}
	if (hasOwn(Obj, 'value') && 'value' in Obj) {
		desc['[[Value]]'] = Obj.value;
	}
	if (hasOwn(Obj, 'writable') && 'writable' in Obj) {
		desc['[[Writable]]'] = ToBoolean(Obj.writable);
	}
	if (hasOwn(Obj, 'get') && 'get' in Obj) {
		var getter = Obj.get;
		if (typeof getter !== 'undefined' && !IsCallable(getter)) {
			throw new $TypeError('getter must be a function');
		}
		desc['[[Get]]'] = getter;
	}
	if (hasOwn(Obj, 'set') && 'set' in Obj) {
		var setter = Obj.set;
		if (typeof setter !== 'undefined' && !IsCallable(setter)) {
			throw new $TypeError('setter must be a function');
		}
		desc['[[Set]]'] = setter;
	}

	if ((hasOwn(desc, '[[Get]]') || hasOwn(desc, '[[Set]]')) && (hasOwn(desc, '[[Value]]') || hasOwn(desc, '[[Writable]]'))) {
		throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
	}
	return desc;
};
