'use strict';

var GetIntrinsic = require('./GetIntrinsic');

var $Object = GetIntrinsic('%Object%');
var $EvalError = GetIntrinsic('%EvalError%');
var $RangeError = GetIntrinsic('%RangeError%');
var $TypeError = GetIntrinsic('%TypeError%');
var $URIError = GetIntrinsic('%URIError%');
var $String = GetIntrinsic('%String%');
var $Date = GetIntrinsic('%Date%');
var $Number = GetIntrinsic('%Number%');
var $floor = GetIntrinsic('%Math.floor%');
var $DateUTC = GetIntrinsic('%Date.UTC%');
var $abs = GetIntrinsic('%Math.abs%');
var $parseInt = GetIntrinsic('%parseInt%');
var $fromCharCode = GetIntrinsic('%String.fromCharCode%');

var assertRecord = require('./helpers/assertRecord');
var isPropertyDescriptor = require('./helpers/isPropertyDescriptor');
var $isNaN = require('./helpers/isNaN');
var $isFinite = require('./helpers/isFinite');
var sign = require('./helpers/sign');
var mod = require('./helpers/mod');
var isPrefixOf = require('./helpers/isPrefixOf');
var callBound = require('./helpers/callBound');
var padLeft = require('./helpers/padLeft');
var regexTester = require('./helpers/regexTester');

var IsCallable = require('is-callable');
var toPrimitive = require('es-to-primitive/es5');

var has = require('has');

var $getUTCFullYear = callBound('Date.prototype.getUTCFullYear');
var $charAt = callBound('String.prototype.charAt');
var $charCodeAt = callBound('String.prototype.charCodeAt');
var $indexOf = callBound('String.prototype.indexOf');
var $numberToString = callBound('Number.prototype.toString');
var $toUpperCase = callBound('String.prototype.toUpperCase');
var $strSlice = callBound('String.prototype.slice');

var HoursPerDay = 24;
var MinutesPerHour = 60;
var SecondsPerMinute = 60;
var msPerSecond = 1e3;
var msPerMinute = msPerSecond * SecondsPerMinute;
var msPerHour = msPerMinute * MinutesPerHour;
var msPerDay = 86400000;

var isHexDigit = regexTester(/^[0-9a-f]{2}$/i);

var utf8Transform = function utf8Transform(c) {
	/* eslint no-bitwise: 0, no-mixed-operators: 0 */
	// stolen from http://www.herongyang.com/Unicode/UTF-8-UTF-8-Encoding-Algorithm.html
	if (c < 0x80) {
		return [
			c >> 0 & 0x7F | 0x00
		];
	}
	if (c < 0x0800) {
		return [
			c >> 6 & 0x1F | 0xC0,
			c >> 0 & 0x3F | 0x80
		];
	}
	if (c < 0x010000) {
		return [
			c >> 12 & 0x0F | 0xE0,
			c >> 6 & 0x3F | 0x80,
			c >> 0 & 0x3F | 0x80
		];
	}
	if (c < 0x110000) {
		return [
			c >> 18 & 0x07 | 0xF0,
			c >> 12 & 0x3F | 0x80,
			c >> 6 & 0x3F | 0x80,
			c >> 0 & 0x3F | 0x80
		];
	}
	throw new $RangeError('utf-8 code point is too large');
};

// adapted from https://jsfiddle.net/3VuLx/1/
// found on http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
var unutf8Transform = function unutf8Transform(Octets) {
	/*
	var char2, char3;

	var out = 0;
	var len = Octets.length;
	var i = 0;
	while (i < len) {
		var c = Octets[i++];
		switch (c >> 4) {
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
			// 0xxxxxxx
				out += c;
				break;
			case 12: case 13:
			// 110x xxxx   10xx xxxx
				char2 = Octets[i++];
				out += ((c & 0x1F) << 6) | (char2 & 0x3F);
				break;
			case 14:
			// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = Octets[i++];
				char3 = Octets[i++];
				out += ((c & 0x0F) << 12)
					| ((char2 & 0x3F) << 6)
					| ((char3 & 0x3F) << 0);
				break;
			default:
		}
	}

	return out;
	*/
};
var unutf8Transform = ([m,n,o,p])=>
m<0x80
?( m&0x7f)<<0
:0xc1<m&&m<0xe0&&n===(n&0xbf)
?( m&0x1f)<<6|( n&0x3f)<<0
:( m===0xe0&&0x9f<n&&n<0xc0
||0xe0<m&&m<0xed&&0x7f<n&&n<0xc0
||m===0xed&&0x7f<n&&n<0xa0
||0xed<m&&m<0xf0&&0x7f<n&&n<0xc0)
&&o===o&0xbf
?( m&0x0f)<<12|( n&0x3f)<<6|( o&0x3f)<<0
:( m===0xf0&&0x8f<n&&n<0xc0
||m===0xf4&&0x7f<n&&n<0x90
||0xf0<m&&m<0xf4&&0x7f<n&&n<0xc0)
&&o===o&0xbf&&p===p&0xbf
?( m&0x07)<<18|( n&0x3f)<<12|( o&0x3f)<<6|( p&0x3f)<<0
:(()=>{throw'Invalid UTF-8 encoding!'})();

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return !!value;
	},
	ToNumber: function ToNumber(value) {
		return +value; // eslint-disable-line no-implicit-coercion
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return $String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return $Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new $TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	},

	// https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type
	IsPropertyDescriptor: function IsPropertyDescriptor(Desc) {
		return isPropertyDescriptor(this, Desc);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.1
	IsAccessorDescriptor: function IsAccessorDescriptor(Desc) {
		if (typeof Desc === 'undefined') {
			return false;
		}

		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

		if (!has(Desc, '[[Get]]') && !has(Desc, '[[Set]]')) {
			return false;
		}

		return true;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.2
	IsDataDescriptor: function IsDataDescriptor(Desc) {
		if (typeof Desc === 'undefined') {
			return false;
		}

		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

		if (!has(Desc, '[[Value]]') && !has(Desc, '[[Writable]]')) {
			return false;
		}

		return true;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.3
	IsGenericDescriptor: function IsGenericDescriptor(Desc) {
		if (typeof Desc === 'undefined') {
			return false;
		}

		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

		if (!this.IsAccessorDescriptor(Desc) && !this.IsDataDescriptor(Desc)) {
			return true;
		}

		return false;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.4
	FromPropertyDescriptor: function FromPropertyDescriptor(Desc) {
		if (typeof Desc === 'undefined') {
			return Desc;
		}

		assertRecord(this, 'Property Descriptor', 'Desc', Desc);

		if (this.IsDataDescriptor(Desc)) {
			return {
				value: Desc['[[Value]]'],
				writable: !!Desc['[[Writable]]'],
				enumerable: !!Desc['[[Enumerable]]'],
				configurable: !!Desc['[[Configurable]]']
			};
		} else if (this.IsAccessorDescriptor(Desc)) {
			return {
				get: Desc['[[Get]]'],
				set: Desc['[[Set]]'],
				enumerable: !!Desc['[[Enumerable]]'],
				configurable: !!Desc['[[Configurable]]']
			};
		} else {
			throw new $TypeError('FromPropertyDescriptor must be called with a fully populated Property Descriptor');
		}
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-8.10.5
	ToPropertyDescriptor: function ToPropertyDescriptor(Obj) {
		if (this.Type(Obj) !== 'Object') {
			throw new $TypeError('ToPropertyDescriptor requires an object');
		}

		var desc = {};
		if (has(Obj, 'enumerable')) {
			desc['[[Enumerable]]'] = this.ToBoolean(Obj.enumerable);
		}
		if (has(Obj, 'configurable')) {
			desc['[[Configurable]]'] = this.ToBoolean(Obj.configurable);
		}
		if (has(Obj, 'value')) {
			desc['[[Value]]'] = Obj.value;
		}
		if (has(Obj, 'writable')) {
			desc['[[Writable]]'] = this.ToBoolean(Obj.writable);
		}
		if (has(Obj, 'get')) {
			var getter = Obj.get;
			if (typeof getter !== 'undefined' && !this.IsCallable(getter)) {
				throw new TypeError('getter must be a function');
			}
			desc['[[Get]]'] = getter;
		}
		if (has(Obj, 'set')) {
			var setter = Obj.set;
			if (typeof setter !== 'undefined' && !this.IsCallable(setter)) {
				throw new $TypeError('setter must be a function');
			}
			desc['[[Set]]'] = setter;
		}

		if ((has(desc, '[[Get]]') || has(desc, '[[Set]]')) && (has(desc, '[[Value]]') || has(desc, '[[Writable]]'))) {
			throw new $TypeError('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
		}
		return desc;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-11.9.3
	'Abstract Equality Comparison': function AbstractEqualityComparison(x, y) {
		var xType = this.Type(x);
		var yType = this.Type(y);
		if (xType === yType) {
			return x === y; // ES6+ specified this shortcut anyways.
		}
		if (x == null && y == null) {
			return true;
		}
		if (xType === 'Number' && yType === 'String') {
			return this['Abstract Equality Comparison'](x, this.ToNumber(y));
		}
		if (xType === 'String' && yType === 'Number') {
			return this['Abstract Equality Comparison'](this.ToNumber(x), y);
		}
		if (xType === 'Boolean') {
			return this['Abstract Equality Comparison'](this.ToNumber(x), y);
		}
		if (yType === 'Boolean') {
			return this['Abstract Equality Comparison'](x, this.ToNumber(y));
		}
		if ((xType === 'String' || xType === 'Number') && yType === 'Object') {
			return this['Abstract Equality Comparison'](x, this.ToPrimitive(y));
		}
		if (xType === 'Object' && (yType === 'String' || yType === 'Number')) {
			return this['Abstract Equality Comparison'](this.ToPrimitive(x), y);
		}
		return false;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-11.9.6
	'Strict Equality Comparison': function StrictEqualityComparison(x, y) {
		var xType = this.Type(x);
		var yType = this.Type(y);
		if (xType !== yType) {
			return false;
		}
		if (xType === 'Undefined' || xType === 'Null') {
			return true;
		}
		return x === y; // shortcut for steps 4-7
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-11.8.5
	// eslint-disable-next-line max-statements
	'Abstract Relational Comparison': function AbstractRelationalComparison(x, y, LeftFirst) {
		if (this.Type(LeftFirst) !== 'Boolean') {
			throw new $TypeError('Assertion failed: LeftFirst argument must be a Boolean');
		}
		var px;
		var py;
		if (LeftFirst) {
			px = this.ToPrimitive(x, $Number);
			py = this.ToPrimitive(y, $Number);
		} else {
			py = this.ToPrimitive(y, $Number);
			px = this.ToPrimitive(x, $Number);
		}
		var bothStrings = this.Type(px) === 'String' && this.Type(py) === 'String';
		if (!bothStrings) {
			var nx = this.ToNumber(px);
			var ny = this.ToNumber(py);
			if ($isNaN(nx) || $isNaN(ny)) {
				return undefined;
			}
			if ($isFinite(nx) && $isFinite(ny) && nx === ny) {
				return false;
			}
			if (nx === 0 && ny === 0) {
				return false;
			}
			if (nx === Infinity) {
				return false;
			}
			if (ny === Infinity) {
				return true;
			}
			if (ny === -Infinity) {
				return false;
			}
			if (nx === -Infinity) {
				return true;
			}
			return nx < ny; // by now, these are both nonzero, finite, and not equal
		}
		if (isPrefixOf(py, px)) {
			return false;
		}
		if (isPrefixOf(px, py)) {
			return true;
		}
		return px < py; // both strings, neither a prefix of the other. shortcut for steps c-f
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
	msFromTime: function msFromTime(t) {
		return mod(t, msPerSecond);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
	SecFromTime: function SecFromTime(t) {
		return mod($floor(t / msPerSecond), SecondsPerMinute);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
	MinFromTime: function MinFromTime(t) {
		return mod($floor(t / msPerMinute), MinutesPerHour);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.10
	HourFromTime: function HourFromTime(t) {
		return mod($floor(t / msPerHour), HoursPerDay);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.2
	Day: function Day(t) {
		return $floor(t / msPerDay);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.2
	TimeWithinDay: function TimeWithinDay(t) {
		return mod(t, msPerDay);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
	DayFromYear: function DayFromYear(y) {
		return (365 * (y - 1970)) + $floor((y - 1969) / 4) - $floor((y - 1901) / 100) + $floor((y - 1601) / 400);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
	TimeFromYear: function TimeFromYear(y) {
		return msPerDay * this.DayFromYear(y);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
	YearFromTime: function YearFromTime(t) {
		// largest y such that this.TimeFromYear(y) <= t
		return $getUTCFullYear(new $Date(t));
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.6
	WeekDay: function WeekDay(t) {
		return mod(this.Day(t) + 4, 7);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
	DaysInYear: function DaysInYear(y) {
		if (mod(y, 4) !== 0) {
			return 365;
		}
		if (mod(y, 100) !== 0) {
			return 366;
		}
		if (mod(y, 400) !== 0) {
			return 365;
		}
		return 366;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.3
	InLeapYear: function InLeapYear(t) {
		var days = this.DaysInYear(this.YearFromTime(t));
		if (days === 365) {
			return 0;
		}
		if (days === 366) {
			return 1;
		}
		throw new $EvalError('Assertion failed: there are not 365 or 366 days in a year, got: ' + days);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.4
	DayWithinYear: function DayWithinYear(t) {
		return this.Day(t) - this.DayFromYear(this.YearFromTime(t));
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.4
	MonthFromTime: function MonthFromTime(t) {
		var day = this.DayWithinYear(t);
		if (0 <= day && day < 31) {
			return 0;
		}
		var leap = this.InLeapYear(t);
		if (31 <= day && day < (59 + leap)) {
			return 1;
		}
		if ((59 + leap) <= day && day < (90 + leap)) {
			return 2;
		}
		if ((90 + leap) <= day && day < (120 + leap)) {
			return 3;
		}
		if ((120 + leap) <= day && day < (151 + leap)) {
			return 4;
		}
		if ((151 + leap) <= day && day < (181 + leap)) {
			return 5;
		}
		if ((181 + leap) <= day && day < (212 + leap)) {
			return 6;
		}
		if ((212 + leap) <= day && day < (243 + leap)) {
			return 7;
		}
		if ((243 + leap) <= day && day < (273 + leap)) {
			return 8;
		}
		if ((273 + leap) <= day && day < (304 + leap)) {
			return 9;
		}
		if ((304 + leap) <= day && day < (334 + leap)) {
			return 10;
		}
		if ((334 + leap) <= day && day < (365 + leap)) {
			return 11;
		}
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.5
	DateFromTime: function DateFromTime(t) {
		var m = this.MonthFromTime(t);
		var d = this.DayWithinYear(t);
		if (m === 0) {
			return d + 1;
		}
		if (m === 1) {
			return d - 30;
		}
		var leap = this.InLeapYear(t);
		if (m === 2) {
			return d - 58 - leap;
		}
		if (m === 3) {
			return d - 89 - leap;
		}
		if (m === 4) {
			return d - 119 - leap;
		}
		if (m === 5) {
			return d - 150 - leap;
		}
		if (m === 6) {
			return d - 180 - leap;
		}
		if (m === 7) {
			return d - 211 - leap;
		}
		if (m === 8) {
			return d - 242 - leap;
		}
		if (m === 9) {
			return d - 272 - leap;
		}
		if (m === 10) {
			return d - 303 - leap;
		}
		if (m === 11) {
			return d - 333 - leap;
		}
		throw new $EvalError('Assertion failed: MonthFromTime returned an impossible value: ' + m);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.12
	MakeDay: function MakeDay(year, month, date) {
		if (!$isFinite(year) || !$isFinite(month) || !$isFinite(date)) {
			return NaN;
		}
		var y = this.ToInteger(year);
		var m = this.ToInteger(month);
		var dt = this.ToInteger(date);
		var ym = y + $floor(m / 12);
		var mn = mod(m, 12);
		var t = $DateUTC(ym, mn, 1);
		if (this.YearFromTime(t) !== ym || this.MonthFromTime(t) !== mn || this.DateFromTime(t) !== 1) {
			return NaN;
		}
		return this.Day(t) + dt - 1;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.13
	MakeDate: function MakeDate(day, time) {
		if (!$isFinite(day) || !$isFinite(time)) {
			return NaN;
		}
		return (day * msPerDay) + time;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.11
	MakeTime: function MakeTime(hour, min, sec, ms) {
		if (!$isFinite(hour) || !$isFinite(min) || !$isFinite(sec) || !$isFinite(ms)) {
			return NaN;
		}
		var h = this.ToInteger(hour);
		var m = this.ToInteger(min);
		var s = this.ToInteger(sec);
		var milli = this.ToInteger(ms);
		var t = (h * msPerHour) + (m * msPerMinute) + (s * msPerSecond) + milli;
		return t;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.9.1.14
	TimeClip: function TimeClip(time) {
		if (!$isFinite(time) || $abs(time) > 8.64e15) {
			return NaN;
		}
		return $Number(new $Date(this.ToNumber(time)));
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-5.2
	modulo: function modulo(x, y) {
		return mod(x, y);
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.1.3
	// eslint-disable-next-line max-statements
	Encode: function Encode(string, unescapedSet) {
		if (this.Type(string) !== 'String') {
			throw new $TypeError('Assertion failed: `string`` argument must be a String');
		}
		if (this.Type(unescapedSet) !== 'String') {
			throw new $TypeError('Assertion failed: `unescapedSet`` argument must be a String');
		}
		var strLen = string.length;
		var R = '';
		var k = 0;
		while (k !== strLen) {
			var C = $charAt(string, k);
			if ($indexOf(unescapedSet, C) > -1) {
				R += C;
			} else {
				var cChar = $charCodeAt(C, 0);
				if (cChar >= 0xDC00 && cChar <= 0xDFFF) {
					throw new $TypeError('??? todo');
				}
				var V;
				if (cChar < 0xD800 || cChar > 0xDBFF) {
					V = cChar;
				} else {
					k += 1;
					if (k === strLen) {
						throw new $URIError('Encode: something went wrong! Please report this.');
					}
					var kChar = $charCodeAt(string, k);
					if (kChar < 0xDC00 || kChar > 0xDFFF) {
						throw new $URIError('Encode: something went wrong! Please report this.');
					}
					V = ((cChar - 0xD800) * 0x400) + (kChar - 0xDC00) + 0x10000;
				}
				var Octets = utf8Transform(V);
				var L = Octets.length;
				var j = 0;
				while (j < L) {
					var jOctet = Octets[j];
					R += '%' + $toUpperCase(padLeft($numberToString(jOctet, 16)));
					j += 1;
				}
			}
			k += 1;
		}
		return R;
	},

	// https://ecma-international.org/ecma-262/5.1/#sec-15.1.3
	// eslint-disable-next-line max-statements, max-lines-per-function
	Decode: function Decode(string, reservedSet) {
		/* eslint max-depth: 0 */
		if (this.Type(string) !== 'String') {
			throw new $TypeError('Assertion failed: `string`` argument must be a String');
		}
		if (this.Type(reservedSet) !== 'String') {
			throw new $TypeError('Assertion failed: `reservedSet`` argument must be a String');
		}
		var strLen = string.length;
		var R = '';
		var k = 0;
		while (k !== strLen) {
			var C = $charAt(string, k);
			var S;
			// eslint-disable-next-line no-negated-condition
			if (C !== '%') {
				S = C;
			} else {
				var start = k;
				if ((k + 2) >= strLen) {
					throw new $URIError('URI error');
				}
				if (isHexDigit($charAt(string, k + 1)) || isHexDigit($charAt(string, k + 2))) {
					throw new $URIError('URI error');
				}
				var B = $parseInt($strSlice(string, k + 1, k + 1 + 2), 16);
				k += 2;
				var bitsOfB = $numberToString(B, 2);
				var mostSignificantBitOfB = $charAt(bitsOfB, 0);
				if (mostSignificantBitOfB === '0') {
					C = $fromCharCode(B);
					if ($indexOf(reservedSet, C) === -1) {
						S = C;
					} else {
						S = $strSlice(string, start, k);
					}
				} else {
					// assert: mostSignificantBitOfB === '1'

					// Let n be the smallest non-negative number such that (B << n) & 0x80 is equal to 0.
					// * This is saying, `(B << n).toString(2).slice(-8) === '10000000'` (0x80)
					// * thus, `B.toString(2)` needs to have `n` zeroes added to the end of it such that it ends in a 1 and 7 zeroes
					var n = 1;
					while ((B << n & 0x80) !== 0 && n < 5) {
						n += 1;
					}

					if (n === 1 || n > 4) {
						throw new $URIError('URI error: ' + n);
					}
					var Octets = Array(n);
					Octets[0] = B;
					if ((k + (3 * (n - 1))) >= strLen) {
						throw new $URIError('URI error');
					}
					var j = 1;
					while (j < n) {
						k += 1;
						if ($charAt(string, k) !== '%') {
							throw new $URIError('URI error');
						}
						if (isHexDigit($charAt(string, k + 1)) || isHexDigit($charAt(string, k + 2))) {
							throw new $URIError('URI error');
						}
						B = $parseInt($strSlice(string, k + 1, k + 1 + 2), 16);
						if ($strSlice($numberToString(B, 2), 0, 2) !== '10') {
							throw new $URIError('URI error');
						}
						k += 2;
						Octets[j] = B;
						j += 1;
					}
					var V = unutf8Transform(Octets);
					// V = 128169;
					console.log(string, n, Octets, V, k, strLen);
					/*
					Let V be the value obtained by applying the UTF-8 transformation to Octets, that is, from an array of octets into a 21-bit value. If Octets does not contain a valid UTF-8 encoding of a Unicode code point throw an URIError exception.
					*/
					if (V < 0x10000) {
						C = $fromCharCode(V);
						if ($indexOf(reservedSet, C) === -1) {
							S = C;
						} else {
							S = $strSlice(string, 0, k);
						}
					} else {
						var L = (((V - 0x10000) & 0x3FF) + 0xDC00);
						var H = ((((V - 0x10000) >> 10) & 0x3FF) + 0xD800);
						S = $fromCharCode(H) + $fromCharCode(L);
					}
				}
			}
			R += S;
			k += 1;
		}
		return R;
	}
};

module.exports = ES5;
