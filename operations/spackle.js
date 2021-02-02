'use strict';

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const deltas = require('./deltas');
const years = require('./years');

const writtenFiles = [5].concat(years).flatMap((year, i, arr) => {
	if ((i + 1) < arr.length) {
		const ops = fs.readdirSync(path.join(process.cwd(), String(year)));
		return ops.flatMap((opFile) => {
			const maybeDirPath = path.join(process.cwd(), String(year), opFile);
			if (fs.statSync(maybeDirPath).isDirectory()) {
				return fs.readdirSync(maybeDirPath).map((x) => `${opFile}::${path.basename(x, path.extname(x))}`);
			}
			return opFile;
		}).map((opFile) => {
			const op = path.basename(opFile, path.extname(opFile));
			const opPath = op.replace('::', '/');
			const thisFile = path.join(process.cwd(), String(year), `${opPath}.js`);
			const nextYear = arr[i + 1];
			const nextFile = path.join(process.cwd(), String(nextYear), `${opPath}.js`);
			console.log('**', opFile, op, opPath, thisFile, nextFile);
			if (op.includes('::')) {
				fs.mkdirSync(path.dirname(nextFile), { recursive: true });
			}
			if (!deltas[nextYear].removed.has(op) && fs.existsSync(thisFile) && !fs.existsSync(nextFile)) {
				console.log(`writing: ${nextYear}/${opPath} -> ${year}/${opPath}`);
				const thisSpecifier = `../${year}/${opPath}`;
				const reexport = `'use strict';

module.exports = require('${thisSpecifier}');
`;
				const replacement = fs.readFileSync(thisFile, 'utf-8');
				fs.writeFileSync(nextFile, process.argv[2] ? replacement : reexport);
				return path.relative(process.cwd(), nextFile);
			}
			return null;
		});
	}
	return [];
}).filter(Boolean);
fs.writeFileSync(path.join(process.cwd(), '.gitattributes'), writtenFiles.map((x) => `${x}\tspackled linguist-generated=true`).join('\n'));
childProcess.execSync(`git add .gitattributes ${writtenFiles.join(' ')}`);
