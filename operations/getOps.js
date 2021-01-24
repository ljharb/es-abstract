#!/usr/bin/env node

'use strict';

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const $ = require('cheerio');
const fromEntries = require('object.fromentries');

const years = require('./years');

async function getOps(year) {
	if (year < 2015) {
		throw new RangeError('ES2015+ only');
	}
	const edition = year - 2009;

	const specHTMLurl = year > 2015
		? new URL(`https://raw.githubusercontent.com/tc39/ecma262/es${year}/spec.html`)
		: new URL('https://262.ecma-international.org/6.0/');

	const cmd = `curl -q --silent ${specHTMLurl}`;
	console.log(year, cmd);
	const specHTML = String((await exec(cmd, { maxBuffer: Infinity })).stdout);

	const root = $(specHTML);

	let aOps = root.filter('[aoid]').add(root.find('[aoid]'));

	if (aOps.length === 0) {
		aOps = root.find('p:contains(" abstract operation ")').closest('section').add(root.find('#sec-reference-specification-type > section'));
	}

	const missings = [];

	const entries = aOps.toArray().map(function (x) {
		const op = $(x);
		let aoid = op.attr('aoid');
		let id = op.attr('id');

		if (!id) {
			id = op.closest('[id]').attr('id');
		}
		// years other than 2016 have `id.startsWith('eqn-')`
		const isConstant = op.text().trim().split('\n').length === 1 && op.text().startsWith(`${aoid} = `);
		if (isConstant) {
			return null;
		}

		if (!aoid) {
			if (!aoid && (
				id === 'sec-ecmascript-standard-built-in-objects'
				|| id === 'sec-forbidden-extensions'
				|| id === 'sec-jobs-and-job-queues'
				|| id === 'sec-%typedarray%.prototype.sort'
				|| id === 'sec-hostresolveimportedmodule'
				|| id === 'sec-tostring-applied-to-the-number-type'
			)) {
				return null;
			}
			if (op.parent().attr('id') === 'sec-reference-specification-type') {
				aoid = op.find('h1').text().match(/\s([a-zA-Z][a-z][a-zA-Z]+)\s/m)[1];
			} else {
				const match = op.text().match(/When the ([a-zA-Z][a-z][a-zA-Z]+) abstract operation is called/m)
					|| op.text().match(/The ([a-zA-Z][a-z][a-zA-Z]+) abstract operation/m)
					|| op.text().match(/ abstract operation ([a-zA-Z/0-9]+)/m);
				if (match) {
					aoid = match[1];
				}
			}
		}
		if (aoid && !id) {
			missings.push(aoid);
		} else if (!aoid) {
			missings.push(id);
		}

		if (!aoid || !id) {
			return null;
		}

		return [
			aoid,
			`https://ecma-international.org/ecma-262/${edition}.0/#${id}`,
		];
	}).filter((x) => x && x[0]);

	if (missings.length > 0) {
		throw `Missing URLs: ${missings}`;
	}

	if (year === 2015) {
		entries.push(
			['abs', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['Abstract Equality Comparison', 'https://ecma-international.org/ecma-262/6.0/#sec-abstract-equality-comparison'],
			['Abstract Relational Comparison', 'https://ecma-international.org/ecma-262/6.0/#sec-abstract-relational-comparison'],
			['DateFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-date-number'],
			['Day', 'https://ecma-international.org/ecma-262/6.0/#sec-day-number-and-time-within-day'],
			['DayFromYear', 'https://ecma-international.org/ecma-262/6.0/#sec-year-number'],
			['DaysInYear', 'https://ecma-international.org/ecma-262/6.0/#sec-year-number'],
			['DayWithinYear', 'https://ecma-international.org/ecma-262/6.0/#sec-month-number'],
			['floor', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['GetBase', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['GetReferencedName', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['HasPrimitiveBase', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['HostResolveImportedModule', 'sec-hostresolveimportedmodule'],
			['HourFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['InLeapYear', 'https://ecma-international.org/ecma-262/6.0/#sec-year-number'],
			['IsPropertyReference', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['IsStrictReference', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['IsSuperReference', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['IsUnresolvableReference', 'https://ecma-international.org/ecma-262/6.0/#sec-jobs-and-job-queues'],
			['max', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['min', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['MinFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['modulo', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['MonthFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-month-number'],
			['msFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['msPerDay', 'https://ecma-international.org/ecma-262/6.0/#sec-day-number-and-time-within-day'],
			['SecFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['sign', 'https://ecma-international.org/ecma-262/6.0/#sec-algorithm-conventions'],
			['Strict Equality Comparison', 'https://ecma-international.org/ecma-262/6.0/#sec-strict-equality-comparison'],
			['thisBooleanValue', 'https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-boolean-prototype-object'],
			['thisNumberValue', 'https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-number-prototype-object'],
			['thisStringValue', 'https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-string-prototype-object'],
			['thisTimeValue', 'https://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-date-prototype-object'],
			['TimeFromYear', 'https://ecma-international.org/ecma-262/6.0/#sec-year-number'],
			['TimeWithinDay', 'https://ecma-international.org/ecma-262/6.0/#sec-day-number-and-time-within-day'],
			['ToDateString', 'https://ecma-international.org/ecma-262/6.0/#sec-todatestring'],
			['Type', 'https://ecma-international.org/ecma-262/6.0/#sec-ecmascript-data-types-and-values'],
			['WeekDay', 'https://ecma-international.org/ecma-262/6.0/#sec-week-day'],
			['YearFromTime', 'https://ecma-international.org/ecma-262/6.0/#sec-year-number'],
		);
	} else if (year === 2016) {
		entries.push(
			['thisNumberValue', 'https://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-number-prototype-object'],
			['thisStringValue', 'https://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-string-prototype-object'],
		);
	}
	entries.sort(function (a, b) { return a[0].localeCompare(b[0]); });

	const obj = fromEntries(entries);

	const outputPath = path.join('operations', `${year}.js`);
	let output = `'use strict';\n\nmodule.exports = ${JSON.stringify(obj, null, '\t')};\n`;
	if ((year === 5 || year >= 2015) && year < 2018) {
		output = output.replace(/= \{\n/m, "= {\n\tIsPropertyDescriptor: 'https://ecma-international.org/ecma-262/6.0/#sec-property-descriptor-specification-type', // not actually an abstract op\n\n");
	}
	await fs.writeFile(outputPath, output);

	console.log(`npx eslint --quiet --fix ${outputPath}`);
	return exec(`npx eslint --quiet --fix ${outputPath}`);
}

Promise.all(years.map((year) => getOps(year))).catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
