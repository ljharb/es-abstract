'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var codePointStringToNum = function codePointStringToNumber(c) {
	var first = c.charCodeAt(0);
	if (first < 0xD800 || first > 0xDBFF || c.length === 1) {
		return first;
	}
	var second = c.charCodeAt(1);
	if (second < 0xDC00 || second > 0xDFFF) {
		return first;
	}
	return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
};

module.exports = function (t, year, EncodeForRegExpEscape) {
	t.ok(year >= 2025, 'ES2025+');

	forEach([].concat(
		v.notNonNegativeIntegers,
		0x10FFFF + 1
	), function (nonCodePoint) {
		t['throws'](
			function () { EncodeForRegExpEscape(nonCodePoint); },
			TypeError,
			debug(nonCodePoint) + ' is not a valid Unicode code point'
		);
	});

	t.equal(EncodeForRegExpEscape(codePointStringToNum('\t')), '\\t', 't');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('\n')), '\\n', 'n');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('\v')), '\\v', 'v');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('\f')), '\\f', 'f');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('\r')), '\\r', 'r');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('/')), '\\/', '/');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('\\')), '\\\\', '\\');

	t.test('strings', { skip: true }, function (st) {
		var strings = [
			'The Quick Brown Fox',
			'hello there',
			'',
			'hi. how are you? 💩',
			'^$\\.*+?()[]{}|',
			'\uD834\uDF06.',
			'123 Fake St.'
		];

		forEach(strings, function (str) {
			var regex = new RegExp('^' + EncodeForRegExpEscape(str) + '$');
			st.match(str, regex, debug(str) + ' escapes to ' + debug(regex) + ', which matches itself');

			var nonStr = { toString: function () { return str; } };
			st['throws'](
				function () { EncodeForRegExpEscape(nonStr); },
				TypeError,
				'does not coerce to string'
			);
		});

		st.end();
	});

	forEach('\u2028\u2029', function (c) {
		var expected = '\\u' + c.charCodeAt(0).toString(16);
		t.equal(EncodeForRegExpEscape(codePointStringToNum(c)), expected, 'line terminator ' + c + ' (' + expected + ') is escaped correctly');
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-otherpunctuators', function (st) {
		var otherPunctuators = ",-=<>#&!%:;@~'`\"";

		forEach(otherPunctuators, function (c) {
			var expected = '\\x' + c.charCodeAt(0).toString(16);
			st.equal(EncodeForRegExpEscape(codePointStringToNum(c)), expected, c + ' is escaped correctly');
		});

		st.end();
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-solidus-character-simple', { skip: true }, function (st) {
		st.equal(EncodeForRegExpEscape('/'), '\\/', 'solidus character is escaped correctly');
		st.equal(EncodeForRegExpEscape('//'), '\\/\\/', 'solidus character is escaped correctly - multiple occurrences 1');
		st.equal(EncodeForRegExpEscape('///'), '\\/\\/\\/', 'solidus character is escaped correctly - multiple occurrences 2');
		st.equal(EncodeForRegExpEscape('////'), '\\/\\/\\/\\/', 'solidus character is escaped correctly - multiple occurrences 3');

		st.end();
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-syntax-characters-simple', function (st) {
		st.equal(EncodeForRegExpEscape(codePointStringToNum('.')), '\\.', 'dot character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('*')), '\\*', 'asterisk character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('+')), '\\+', 'plus character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('?')), '\\?', 'question mark character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('^')), '\\^', 'caret character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('$')), '\\$', 'dollar character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('|')), '\\|', 'pipe character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('(')), '\\(', 'open parenthesis character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum(')')), '\\)', 'close parenthesis character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('[')), '\\[', 'open bracket character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum(']')), '\\]', 'close bracket character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('{')), '\\{', 'open brace character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('}')), '\\}', 'close brace character is escaped correctly');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\\')), '\\\\', 'backslash character is escaped correctly');

		st.end();
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-utf16encodecodepoint', function (st) {
		var codePoints = String.fromCharCode(0x100, 0x200, 0x300);

		forEach(codePoints, function (c) {
			st.equal(EncodeForRegExpEscape(codePointStringToNum(c)), c, 'character ' + c + ' is correctly not escaped');
		});

		/* eslint operator-linebreak: [2, before] */
		var unicodeChars = '你好' // chinese
            + 'こんにちは' // japanese
            + '안녕하세요' // korean
            + 'Привет' // cyrillic
            + 'مرحبا' // arabic
            + 'हेलो' // devanagari
            + 'Γειάσου' // greek
            + 'שלום' // hebrew
            + 'สวัสดี' // thai
            + 'नमस्ते' // hindi
            + 'ሰላም' // amharic
            + 'हैलो'; // hindi with diacritics

		forEach(unicodeChars, function (c) {
			st.equal(EncodeForRegExpEscape(codePointStringToNum(c)), c, 'character ' + c + ' is correctly not escaped');
		});

		st.end();
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-whitespace', function (st) {
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\uFEFF')), '\\ufeff', 'whitespace \\uFEFF is escaped correctly to \\uFEFF');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u0020')), '\\x20', 'whitespace \\u0020 is escaped correctly to \\x20');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u00A0')), '\\xa0', 'whitespace \\u00A0 is escaped correctly to \\xA0');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u202F')), '\\u202f', 'whitespace \\u202F is escaped correctly to \\u202F');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u0009')), '\\t', 'whitespace \\u0009 is escaped correctly to \\t');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u000B')), '\\v', 'whitespace \\u000B is escaped correctly to \\v');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\u000C')), '\\f', 'whitespace \\u000C is escaped correctly to \\f');

		st.end();
	});

	t.equal(EncodeForRegExpEscape(codePointStringToNum('_')), '_', 'underscore is not escaped');
	t.equal(EncodeForRegExpEscape(codePointStringToNum('.')), '\\.', 'dot is escaped');

	forEach('^$\\.*+?()[]{}|', function (c) {
		var expected = '\\' + c;
		t.equal(
			EncodeForRegExpEscape(codePointStringToNum(c)),
			expected,
			'Syntax character ' + c + ' (' + expected + ') are correctly escaped'
		);
	});

	t.test('test262: test/built-ins/RegExp/escape/escaped-surrogates', function (st) {

		// Specific surrogate points
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\uD800')), '\\ud800', 'High surrogate \\uD800 is correctly escaped');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\uDBFF')), '\\udbff', 'High surrogate \\uDBFF is correctly escaped');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\uDC00')), '\\udc00', 'Low surrogate \\uDC00 is correctly escaped');
		st.equal(EncodeForRegExpEscape(codePointStringToNum('\uDFFF')), '\\udfff', 'Low surrogate \\uDFFF is correctly escaped');

		// Leading Surrogates
		var highSurrogates = '\uD800\uD801\uD802\uD803\uD804\uD805\uD806\uD807\uD808\uD809\uD80A\uD80B\uD80C\uD80D\uD80E\uD80F'
            + '\uD810\uD811\uD812\uD813\uD814\uD815\uD816\uD817\uD818\uD819\uD81A\uD81B\uD81C\uD81D\uD81E\uD81F'
            + '\uD820\uD821\uD822\uD823\uD824\uD825\uD826\uD827\uD828\uD829\uD82A\uD82B\uD82C\uD82D\uD82E\uD82F'
            + '\uD830\uD831\uD832\uD833\uD834\uD835\uD836\uD837\uD838\uD839\uD83A\uD83B\uD83C\uD83D\uD83E\uD83F'
            + '\uD840\uD841\uD842\uD843\uD844\uD845\uD846\uD847\uD848\uD849\uD84A\uD84B\uD84C\uD84D\uD84E\uD84F'
            + '\uD850\uD851\uD852\uD853\uD854\uD855\uD856\uD857\uD858\uD859\uD85A\uD85B\uD85C\uD85D\uD85E\uD85F'
            + '\uD860\uD861\uD862\uD863\uD864\uD865\uD866\uD867\uD868\uD869\uD86A\uD86B\uD86C\uD86D\uD86E\uD86F'
            + '\uD870\uD871\uD872\uD873\uD874\uD875\uD876\uD877\uD878\uD879\uD87A\uD87B\uD87C\uD87D\uD87E\uD87F'
            + '\uD880\uD881\uD882\uD883\uD884\uD885\uD886\uD887\uD888\uD889\uD88A\uD88B\uD88C\uD88D\uD88E\uD88F'
            + '\uD890\uD891\uD892\uD893\uD894\uD895\uD896\uD897\uD898\uD899\uD89A\uD89B\uD89C\uD89D\uD89E\uD89F'
            + '\uD8A0\uD8A1\uD8A2\uD8A3\uD8A4\uD8A5\uD8A6\uD8A7\uD8A8\uD8A9\uD8AA\uD8AB\uD8AC\uD8AD\uD8AE\uD8AF'
            + '\uD8B0\uD8B1\uD8B2\uD8B3\uD8B4\uD8B5\uD8B6\uD8B7\uD8B8\uD8B9\uD8BA\uD8BB\uD8BC\uD8BD\uD8BE\uD8BF'
            + '\uD8C0\uD8C1\uD8C2\uD8C3\uD8C4\uD8C5\uD8C6\uD8C7\uD8C8\uD8C9\uD8CA\uD8CB\uD8CC\uD8CD\uD8CE\uD8CF'
            + '\uD8D0\uD8D1\uD8D2\uD8D3\uD8D4\uD8D5\uD8D6\uD8D7\uD8D8\uD8D9\uD8DA\uD8DB\uD8DC\uD8DD\uD8DE\uD8DF'
            + '\uD8E0\uD8E1\uD8E2\uD8E3\uD8E4\uD8E5\uD8E6\uD8E7\uD8E8\uD8E9\uD8EA\uD8EB\uD8EC\uD8ED\uD8EE\uD8EF'
            + '\uD8F0\uD8F1\uD8F2\uD8F3\uD8F4\uD8F5\uD8F6\uD8F7\uD8F8\uD8F9\uD8FA\uD8FB\uD8FC\uD8FD\uD8FE\uD8FF';

		forEach(highSurrogates, function (c) {
			var expected = '\\u' + c.charCodeAt(0).toString(16);
			st.equal(EncodeForRegExpEscape(codePointStringToNum(c)), expected, 'High surrogate ' + c + ' (' + expected + ') is correctly escaped');
		});

		// Trailing Surrogates
		var lowSurrogates = '\uDC00\uDC01\uDC02\uDC03\uDC04\uDC05\uDC06\uDC07\uDC08\uDC09\uDC0A\uDC0B\uDC0C\uDC0D\uDC0E\uDC0F'
            + '\uDC10\uDC11\uDC12\uDC13\uDC14\uDC15\uDC16\uDC17\uDC18\uDC19\uDC1A\uDC1B\uDC1C\uDC1D\uDC1E\uDC1F'
            + '\uDC20\uDC21\uDC22\uDC23\uDC24\uDC25\uDC26\uDC27\uDC28\uDC29\uDC2A\uDC2B\uDC2C\uDC2D\uDC2E\uDC2F'
            + '\uDC30\uDC31\uDC32\uDC33\uDC34\uDC35\uDC36\uDC37\uDC38\uDC39\uDC3A\uDC3B\uDC3C\uDC3D\uDC3E\uDC3F'
            + '\uDC40\uDC41\uDC42\uDC43\uDC44\uDC45\uDC46\uDC47\uDC48\uDC49\uDC4A\uDC4B\uDC4C\uDC4D\uDC4E\uDC4F'
            + '\uDC50\uDC51\uDC52\uDC53\uDC54\uDC55\uDC56\uDC57\uDC58\uDC59\uDC5A\uDC5B\uDC5C\uDC5D\uDC5E\uDC5F'
            + '\uDC60\uDC61\uDC62\uDC63\uDC64\uDC65\uDC66\uDC67\uDC68\uDC69\uDC6A\uDC6B\uDC6C\uDC6D\uDC6E\uDC6F'
            + '\uDC70\uDC71\uDC72\uDC73\uDC74\uDC75\uDC76\uDC77\uDC78\uDC79\uDC7A\uDC7B\uDC7C\uDC7D\uDC7E\uDC7F'
            + '\uDC80\uDC81\uDC82\uDC83\uDC84\uDC85\uDC86\uDC87\uDC88\uDC89\uDC8A\uDC8B\uDC8C\uDC8D\uDC8E\uDC8F'
            + '\uDC90\uDC91\uDC92\uDC93\uDC94\uDC95\uDC96\uDC97\uDC98\uDC99\uDC9A\uDC9B\uDC9C\uDC9D\uDC9E\uDC9F'
            + '\uDCA0\uDCA1\uDCA2\uDCA3\uDCA4\uDCA5\uDCA6\uDCA7\uDCA8\uDCA9\uDCAA\uDCAB\uDCAC\uDCAD\uDCAE\uDCAF'
            + '\uDCB0\uDCB1\uDCB2\uDCB3\uDCB4\uDCB5\uDCB6\uDCB7\uDCB8\uDCB9\uDCBA\uDCBB\uDCBC\uDCBD\uDCBE\uDCBF'
            + '\uDCC0\uDCC1\uDCC2\uDCC3\uDCC4\uDCC5\uDCC6\uDCC7\uDCC8\uDCC9\uDCCA\uDCCB\uDCCC\uDCCD\uDCCE\uDCCF'
            + '\uDCD0\uDCD1\uDCD2\uDCD3\uDCD4\uDCD5\uDCD6\uDCD7\uDCD8\uDCD9\uDCDA\uDCDB\uDCDC\uDCDD\uDCDE\uDCDF'
            + '\uDCE0\uDCE1\uDCE2\uDCE3\uDCE4\uDCE5\uDCE6\uDCE7\uDCE8\uDCE9\uDCEA\uDCEB\uDCEC\uDCED\uDCEE\uDCEF'
            + '\uDCF0\uDCF1\uDCF2\uDCF3\uDCF4\uDCF5\uDCF6\uDCF7\uDCF8\uDCF9\uDCFA\uDCFB\uDCFC\uDCFD\uDCFE\uDCFF';

		forEach(lowSurrogates, function (c) {
			var expected = '\\u' + c.charCodeAt(0).toString(16);
			st.equal(EncodeForRegExpEscape(codePointStringToNum(c)), expected, 'Low surrogate ' + c + ' (' + expected + ') is correctly escaped');
		});

		st.end();
	});
};
