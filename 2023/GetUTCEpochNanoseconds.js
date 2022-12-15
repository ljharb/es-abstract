'use strict';

var GetIntrinsic = require('get-intrinsic');

var IsIntegralNumber = require('./IsIntegralNumber');
var MakeDay = require('./MakeDay');
var MakeTime = require('./MakeTime');
var MakeDate = require('./MakeDate');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

// https://tc39.es/ecma262/#sec-getutcepochnanoseconds

// eslint-disable-next-line max-params
module.exports = function GetUTCEpochNanoseconds(
	year,
	month,
	day,
	hour,
	minute,
	second,
	millisecond,
	microsecond,
	nanosecond
) {
	if (!IsIntegralNumber(year)) {
		throw new $TypeError('Assertion failed: `year` must be an integral Number');
	}
	if (!IsIntegralNumber(month) || month < 1 || month > 12) {
		throw new $TypeError('Assertion failed: `month` must be an integral Number between 1 and 12, inclusive');
	}
	if (!IsIntegralNumber(day) || day < 1 || day > 31) {
		throw new $TypeError('Assertion failed: `day` must be an integral Number between 1 and 31, inclusive');
	}
	if (!IsIntegralNumber(hour) || hour < 0 || hour > 23) {
		throw new $TypeError('Assertion failed: `hour` must be an integral Number between 0 and 23, inclusive');
	}
	if (!IsIntegralNumber(minute) || minute < 0 || minute > 59) {
		throw new $TypeError('Assertion failed: `minute` must be an integral Number between 0 and 59, inclusive');
	}
	if (!IsIntegralNumber(second) || second < 0 || second > 59) {
		throw new $TypeError('Assertion failed: `second` must be an integral Number between 0 and 59, inclusive');
	}
	if (!IsIntegralNumber(millisecond) || millisecond < 0 || millisecond > 999) {
		throw new $TypeError('Assertion failed: `millisecond` must be an integral Number between 0 and 999, inclusive');
	}
	if (!IsIntegralNumber(microsecond) || microsecond < 0 || microsecond > 999) {
		throw new $TypeError('Assertion failed: `microsecond` must be an integral Number between 0 and 999, inclusive');
	}
	if (!IsIntegralNumber(nanosecond) || nanosecond < 0 || nanosecond > 999) {
		throw new $TypeError('Assertion failed: `nanosecond` must be an integral Number between 0 and 999, inclusive');
	}

	var date = MakeDay(year, month - 1, day); // step 1
	var time = MakeTime(hour, minute, second, millisecond); // step 2
	var ms = MakeDate(date, time); // step 3
	if (!IsIntegralNumber(ms)) {
		throw new $TypeError('Assertion failed: `ms` from MakeDate is not an integral Number'); // step 4
	}

	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}
	return $BigInt((ms * 1e6) + (microsecond * 1e3) + nanosecond); // step 5
};