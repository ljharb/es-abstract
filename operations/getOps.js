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
		? new URL(`https://raw.githubusercontent.com/tc39/ecma262/${year === 2023 ? 'HEAD' : `es${year}`}/spec.html`)
		: new URL('https://262.ecma-international.org/6.0/');

	const cmd = `curl -q --silent ${specHTMLurl}`;
	console.log(year, cmd);
	const specHTML = String((await exec(cmd, { maxBuffer: Infinity })).stdout);

	const root = $(specHTML);

	let aOps;

	if (year > 2021) {
		aOps = $('[aoid],[type$="abstract operation"],[id^="sec-numeric-types-"]:not([aoid]):not([type="abstract operation"])', specHTML)
			.not('[type="sdo"]');
	} else {
		aOps = root.filter('[aoid]')
			.add(root.find('[aoid]'))
			.add(root.find('[id^="sec-numeric-types-"]:not([aoid])'))
			.not('[type="sdo"]');

		if (aOps.length === 0) {
			aOps = root.find('p:contains(" abstract operation ")').closest('section').add(root.find('#sec-reference-specification-type > section'));
		}
	}

	const missings = [];

	const entries = aOps.toArray().map((x) => {
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
			if (
				id === 'sec-ecmascript-standard-built-in-objects'
				|| id === 'sec-forbidden-extensions'
				|| id === 'sec-jobs-and-job-queues'
				|| id === 'sec-%typedarray%.prototype.sort'
				|| (year < 2021 && id === 'sec-hostresolveimportedmodule')
				|| id === 'sec-tostring-applied-to-the-number-type'
			) {
				return null;
			}
			if (op.parent().attr('id') === 'sec-reference-specification-type') {
				({ groups: { aoid } } = op.find('h1').text().match(/\s(?<aoid>[a-zA-Z][a-z][a-zA-Z]+)\s/m));
			} else if ((/^sec-numeric-types-(?:number|bigint)-/).test(op.attr('id'))) {
				({ groups: { aoid } } = op.find('h1').text().match(/\s?(?<aoid>[a-zA-Z][a-z][a-zA-Z]+(?:::[a-zA-Z][a-z][a-zA-Z]+)+)\s/m));
			} else {
				const match = op.text().match(/When the (?<aoid>[a-zA-Z][a-z][a-zA-Z]+) abstract operation is called/m)
					|| op.text().match(/The (?<aoid>[a-zA-Z][a-z][a-zA-Z]+) abstract operation/m)
					|| op.text().match(/ abstract operation (?<aoid>[a-zA-Z/0-9]+)/m);
				if (String(op.attr('type') || '').endsWith('abstract operation')) {
					aoid = op.find('h1').text().trim().split('\n')[0].replace(/Static Semantics: |\(.*$/g, '').trim();
				} else if (match) {
					({ groups: { aoid } } = match);
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
			`https://262.ecma-international.org/${edition}.0/#${id}`,
		];
	}).filter((x) => x && x[0]);

	if (missings.length > 0) {
		throw `Missing URLs: ${missings}`;
	}

	if (year === 2015) {
		entries.push(
			['abs', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['Abstract Equality Comparison', 'https://262.ecma-international.org/6.0/#sec-abstract-equality-comparison'],
			['Abstract Relational Comparison', 'https://262.ecma-international.org/6.0/#sec-abstract-relational-comparison'],
			['CreateArrayIterator', 'https://262.ecma-international.org/6.0/#sec-createarrayiterator'],
			['DateFromTime', 'https://262.ecma-international.org/6.0/#sec-date-number'],
			['Day', 'https://262.ecma-international.org/6.0/#sec-day-number-and-time-within-day'],
			['DayFromYear', 'https://262.ecma-international.org/6.0/#sec-year-number'],
			['DaysInYear', 'https://262.ecma-international.org/6.0/#sec-year-number'],
			['DayWithinYear', 'https://262.ecma-international.org/6.0/#sec-month-number'],
			['floor', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['GetBase', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['GetReferencedName', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['HasPrimitiveBase', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['HostResolveImportedModule', 'sec-hostresolveimportedmodule'],
			['HourFromTime', 'https://262.ecma-international.org/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['InLeapYear', 'https://262.ecma-international.org/6.0/#sec-year-number'],
			['IsPropertyReference', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['IsStrictReference', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['IsSuperReference', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['IsUnresolvableReference', 'https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues'],
			['max', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['min', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['MinFromTime', 'https://262.ecma-international.org/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['modulo', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['MonthFromTime', 'https://262.ecma-international.org/6.0/#sec-month-number'],
			['msFromTime', 'https://262.ecma-international.org/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['msPerDay', 'https://262.ecma-international.org/6.0/#sec-day-number-and-time-within-day'],
			['SecFromTime', 'https://262.ecma-international.org/6.0/#sec-hours-minutes-second-and-milliseconds'],
			['sign', 'https://262.ecma-international.org/6.0/#sec-algorithm-conventions'],
			['Strict Equality Comparison', 'https://262.ecma-international.org/6.0/#sec-strict-equality-comparison'],
			['thisBooleanValue', 'https://262.ecma-international.org/6.0/#sec-properties-of-the-boolean-prototype-object'],
			['thisNumberValue', 'https://262.ecma-international.org/6.0/#sec-properties-of-the-number-prototype-object'],
			['thisStringValue', 'https://262.ecma-international.org/6.0/#sec-properties-of-the-string-prototype-object'],
			['thisTimeValue', 'https://262.ecma-international.org/6.0/#sec-properties-of-the-date-prototype-object'],
			['TimeFromYear', 'https://262.ecma-international.org/6.0/#sec-year-number'],
			['TimeWithinDay', 'https://262.ecma-international.org/6.0/#sec-day-number-and-time-within-day'],
			['ToDateString', 'https://262.ecma-international.org/6.0/#sec-todatestring'],
			['Type', 'https://262.ecma-international.org/6.0/#sec-ecmascript-data-types-and-values'],
			['WeekDay', 'https://262.ecma-international.org/6.0/#sec-week-day'],
			['YearFromTime', 'https://262.ecma-international.org/6.0/#sec-year-number'],
		);
	} else if (year === 2016) {
		entries.push(
			['thisNumberValue', 'https://262.ecma-international.org/7.0/#sec-properties-of-the-number-prototype-object'],
			['thisStringValue', 'https://262.ecma-international.org/7.0/#sec-properties-of-the-string-prototype-object'],
		);
	}
	if (year >= 2015 && year <= 2017) {
		entries.push(['DaylightSavingTA', `https://262.ecma-international.org/${edition}.0/#sec-daylight-saving-time-adjustment`]);
	}
	if (year >= 2021) {
		entries.push(
			['clamp', `https://262.ecma-international.org/${edition}.0/#clamping`],
			['substring', `https://262.ecma-international.org/${edition}.0/#substring`],
		);
	}
	entries.sort(([a], [b]) => a.localeCompare(b));

	const obj = fromEntries(entries.map(([ao, url]) => [ao, typeof url === 'string' ? { url } : url]));

	const outputPath = path.join('operations', `${year}.js`);
	let output = `'use strict';\n\nmodule.exports = ${JSON.stringify(obj, null, '\t')};\n`;
	if ((year === 5 || year >= 2015) && year < 2018) {
		output = output.replace(/[=] \{\n/m, "= {\n\tIsPropertyDescriptor: 'https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type', // not actually an abstract op\n\n");
	}
	await fs.writeFile(outputPath, output);

	console.log(`npx eslint --quiet --fix ${outputPath}`);
	return exec(`npx eslint --quiet --fix ${outputPath}`);
}

Promise.all(years.map((year) => getOps(year))).catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
