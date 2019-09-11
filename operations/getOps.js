#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var $ = require('cheerio');
var fromEntries = require('object.fromentries');

if (process.argv.length !== 3) {
	throw new RangeError('please provide a year');
}
var year = parseInt(process.argv[2], 10);
if (year < 2016) {
	throw new RangeError('ES2016+ only');
}
var edition = year - 2009;

var specHTMLurl = new URL('https://raw.githubusercontent.com/tc39/ecma262/es' + year + '/spec.html');

var specHTML = String(execSync('curl -q --silent ' + specHTMLurl, { maxBuffer: Infinity }));

var root = $(specHTML);

var aOps = root.filter('[aoid]').add(root.find('[aoid]'));

var missings = [];

var entries = aOps.toArray().map(function (x) {
	var op = $(x);
	var aoid = op.attr('aoid');
	var id = op.attr('id');

	if (!id) {
		id = op.closest('[id]').attr('id');
	}
	// years other than 2016 have `id.startsWith('eqn-')`
	var isConstant = op.text().trim().split('\n').length === 1 && op.text().startsWith(aoid + ' = ');
	if (isConstant) {
		return null;
	}

	if (!id) {
		missings.push(aoid);
	}

	return [
		aoid,
		'https://ecma-international.org/ecma-262/' + edition + '.0/#' + id
	];
}).filter(Boolean);

if (missings.length > 0) {
	console.error('Missing URLs:', missings);
	process.exit(1);
}

if (year === 2016) {
	entries.push(
		['thisNumberValue', 'https://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-number-prototype-object'],
		['thisStringValue', 'https://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-string-prototype-object']
	);
}
entries.sort(function (a, b) { return a[0].localeCompare(b[0]); });

var obj = fromEntries(entries);

var outputPath = path.join('operations', year + '.js');
var output = '\'use strict\';\n\nmodule.exports = ' + JSON.stringify(obj, null, '\t') + ';\n';
if ((year === 5 || year >= 2015) && year < 2018) {
	output = output.replace(/= \{\n/m, "= {\n\tIsPropertyDescriptor: 'https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type', // not actually an abstract op\n\n");
}
fs.writeFileSync(outputPath, output);

console.log('npx eslint --quiet --fix ' + outputPath);
execSync('npx eslint --quiet --fix ' + outputPath);
