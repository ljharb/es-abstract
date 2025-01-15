'use strict';

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const { ESLint } = require('eslint');

const deltas = require('./deltas');
const years = require('./years');

const allOps = {};
function addOpToYear(year, op, opPath) {
	allOps[year] ||= new Map();
	if (op === opPath) {
		allOps[year].set(op, `${year}/${opPath}`);
	} else {
		const baseOp = op.replace(/::.*$/, '');
		allOps[year].set(baseOp, `${year}/${baseOp}`);
	}
}

const writtenOps = [5].concat(years).flatMap((year, i, arr) => {
	const ops = fs.readdirSync(path.join(process.cwd(), String(year)));
	return ops.flatMap((opFile) => {
		const maybeDirPath = path.join(process.cwd(), String(year), opFile);
		if (fs.statSync(maybeDirPath).isDirectory()) {
			return fs.readdirSync(maybeDirPath).map((x) => `${opFile}::${path.basename(x, path.extname(x))}`);
		}

		if (year === 2023 && opFile === 'TypedArrayCreate.js') {
			return [];
		}
		return opFile;
	}).map((opFile) => {
		const op = path.basename(opFile, path.extname(opFile));
		const opPath = op.replace('::', '/');
		const isEntryPoint = !opPath.startsWith('tables/');
		const thisFile = path.join(process.cwd(), String(year), `${opPath}.js`);
		if (isEntryPoint) {
			addOpToYear(year, op, opPath);
		}
		if ((i + 1) < arr.length) {
			const nextYear = arr[i + 1];
			const nextFile = path.join(process.cwd(), String(nextYear), `${opPath}.js`);
			fs.mkdirSync(path.dirname(nextFile), { recursive: true });
			if (!deltas[nextYear].removed.has(op)) {
				if (isEntryPoint) {
					addOpToYear(nextYear, op, opPath);
				}

				if (fs.existsSync(thisFile) && !fs.existsSync(nextFile)) {
					if (year === 2023 && op === 'TypedArrayCreate') {
						// this AO was renamed in ES2024, and the new one can't be implemented
						return null;
					}
					console.log(`writing: ${nextYear}/${opPath} -> ${year}/${opPath}`);
					const thisSpecifier = `../${year}/${opPath}`;
					const reexport = `'use strict';

		module.exports = require('${thisSpecifier}');
		`;
					const replacement = fs.readFileSync(thisFile, 'utf-8');
					fs.writeFileSync(nextFile, process.argv[2] ? replacement : reexport);
					return {
						isEntryPoint,
						op,
						opFile: path.relative(process.cwd(), nextFile),
						year: nextYear,
					};
				}
			}
		}
		return null;
	});
}).filter(Boolean);

const exceptions = require('../test/helpers/aoMap.json');

const willBeQuotedOp = (/^'[^' ]+ [^']+'/);

function compareOps(a, b) {
	const aQ = willBeQuotedOp.test(a);
	const bQ = willBeQuotedOp.test(b);

	if ((aQ || bQ) && !(aQ && bQ)) {
		return aQ ? -1 : 1;
	}

	return a.localeCompare(b);
}

const writtenManifestsP = years.map(async (year) => {
	const edition = year - 2009;
	const contents = `'use strict';

/* eslint global-require: 0 */
// https://262.ecma-international.org/${edition}.0/#sec-abstract-operations
var ES${year} = {
	${Array.from(allOps[year], ([op, opFile]) => `'${exceptions[op] || op}': require('./${opFile}')`).sort(compareOps).join(',\n\t')}
};

module.exports = ES${year};
`;
	const filename = `es${String(year)}.js`;
	const eslint = new ESLint({ fix: true });
	await eslint.lintText(contents, { filePath: filename }).then(([{ output }]) => {
		fs.writeFileSync(path.join(process.cwd(), filename), output);
	}).catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});

	return filename;
});

Promise.all(writtenManifestsP).then((writtenManifests) => {
	const writtenFiles = writtenManifests.concat(writtenOps.map(({ opFile }) => opFile));

	fs.writeFileSync(path.join(process.cwd(), '.gitattributes'), [].concat('/helpers/caseFolding.json\tlinguist-generated=true', writtenFiles.map((x) => `/${x}\tspackled linguist-generated=true`)).join('\n'));
	childProcess.execSync(`git add .gitattributes ${writtenFiles.join(' ')}`);
});
