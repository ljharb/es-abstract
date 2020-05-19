'use strict';

var GetIntrinsic = require('../GetIntrinsic');
var callBound = require('../helpers/callBound');

var $TypeError = GetIntrinsic('%TypeError%');
var $strSlice = callBound('String.prototype.slice');

function isSlot(slot) {
    return typeof slot === 'string' && $strSlice(slot, 0, 2) === '[[' && $strSlice(slot, -2) === ']]';
}

// https://tc39.es/ecma262/2020/#sec-makebasicobject

module.exports = function MakeBasicObject(internalSlotsList) {
    if (!IsArray(internalSlotsList) || !every(internalSlotsList, isSlot)) {
        throw new $TypeError('Assertion failed: `internalSlotsList` must be a List of slot names');
    }
    // throw if internalSlotsList has stuff that's not [[Prototype]] or [[Extensible]]
    return {};
};