'use strict';

var path = require('path');
var fs = require('fs');

var filter = require('array.prototype.filter');
var forEach = require('for-each');
var keys = require('object-keys');

/** @type {import('./aoMap.json')} */
var aoMap = require('./aoMap.json');

/** @type {(test: import('tape').Test['test'], ES: Record<keyof typeof aoMap | string, unknown>, edition: import('../../types').integer) => void} */
module.exports = function runManifestTest(test, ES, edition) {
	test('ES' + edition + ' manifest', { skip: !fs.readdirSync }, function (t) {
		var files = filter(
			fs.readdirSync(path.join(__dirname, '../../' + edition), 'utf-8'),
			/** @type {(file: string) => file is string} */
			function (file) { return file[0] !== '.' && file !== 'tables'; }
		);
		forEach(files, function (file) {
			var name = path.basename(file, path.extname(file));
			var actualName = aoMap[name] in ES ? aoMap[/** @type {keyof typeof aoMap} */ (name)] : name;
			var actual = ES[actualName];
			var expected = require(path.join(__dirname, '../../' + edition + '/', file)); // eslint-disable-line global-require
			t.equal(actual, expected, 'ES["' + actualName + '"] === ' + file);
		});
		var actualCount = keys(ES).length;
		t.equal(actualCount, files.length, 'expected ' + files.length + ' files, got ' + actualCount);
		t.end();
	});
};
