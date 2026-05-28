import crypto from 'crypto';
import fs from 'fs';
import pkg from '../../package.json';
import modulesCleanup from 'removeNPMAbsolutePaths';
import { exec } from '@yao-pkg/pkg';
import { execSync } from 'child_process';
import { console } from './log';
import esbuild from 'esbuild';
import path from 'path';

const buildsDir = './_builds';
const nodeVer = 'node24-';

type BuildTypes = `${'windows' | 'macos' | 'linux' | 'linuxstatic' | 'alpine'}-${'x64' | 'arm64'}`;

(async () => {
	const buildType = process.argv[2] as BuildTypes;
	buildBinary(buildType);
})();

async function buildBinary(buildType: BuildTypes) {
	const buildStr = 'hanimdl';
	const acceptablePlatforms = ['windows', 'linux', 'linuxstatic', 'macos', 'alpine'];
	const acceptableArchs = ['x64', 'arm64'];
	const acceptableBuilds: string[] = [];
	for (const platform of acceptablePlatforms) {
		for (const arch of acceptableArchs) {
			acceptableBuilds.push(platform + '-' + arch);
		}
	}
	if (!acceptableBuilds.includes(buildType)) {
		console.error('Unknown build type!');
		process.exit(1);
	}
	await modulesCleanup('.');
	if (!fs.existsSync(buildsDir)) {
		fs.mkdirSync(buildsDir, { recursive: true });
	}
	const buildFull = `${buildStr}-${getFriendlyName(buildType)}-cli`;
	const buildDir = `${buildsDir}/${buildFull}`;
	if (fs.existsSync(buildDir)) {
		fs.rmSync(buildDir, { recursive: true, force: true });
	}
	fs.mkdirSync(buildDir, { recursive: true });
	console.info('Running esbuild');

	const build = await esbuild.build({
		entryPoints: ['index.js'],
		sourceRoot: './',
		bundle: true,
		platform: 'node',
		format: 'cjs',
		treeShaking: true,
		sourcemap: true,
		minify: true,
		keepNames: true,
		outfile: path.join(buildsDir, 'index.cjs'),
		metafile: true,
		external: ['cheerio', 'sleep', 'readline/promises']
	});

	if (build.errors?.length > 0) console.error(build.errors);
	if (build.warnings?.length > 0) console.warn(build.warnings);

	const buildConfig = [`${buildsDir}/index.cjs`, '--target', nodeVer + buildType, '--output', `${buildDir}/${pkg.short_name}`, '--public', '--compress', 'GZip'];
	console.info(`[Build] Build configuration: ${buildFull}`);
	try {
		await exec(buildConfig);
	} catch (e) {
		console.info(e);
		process.exit(1);
	}

	fs.mkdirSync(`${buildDir}/config`, { recursive: true });
	fs.mkdirSync(`${buildDir}/videos`, { recursive: true });
	fs.mkdirSync(`${buildDir}/widevine`, { recursive: true });
	fs.mkdirSync(`${buildDir}/playready`, { recursive: true });
	fs.copyFileSync('../config/cli-defaults.yml', `${buildDir}/config/cli-defaults.yml`);
	fs.copyFileSync('../config/dir-path.yml', `${buildDir}/config/dir-path.yml`);
	fs.copyFileSync('../package.json', `${buildDir}/package.json`);

	if (fs.existsSync(`${buildsDir}/${buildFull}.7z`)) {
		fs.unlinkSync(`${buildsDir}/${buildFull}.7z`);
	}

	const ext = buildType.startsWith('windows') ? '.exe' : '';

	const binConf = {
		ffmpeg: `ffmpeg${ext}`,
		mkvmerge: `mkvmerge${ext}`,
		mp4decrypt: `mp4decrypt${ext}`,
		shaka: `shaka-packager${ext}`
	};

	fs.writeFileSync(
		`${buildDir}/config/bin-path.yml`,
		Object.entries(binConf)
			.map(([key, value]) => `${key}: '${value}'`)
			.join('\n') + '\n'
	);

	console.info(`[Build] Build completed`);

	console.info(`[Zip] Zipping build...`);
	execSync(`7z a -t7z "${buildsDir}/${buildFull}.7z" "${buildDir}"`, { stdio: [0, 1, 2] });
	console.info(`[Zip] Zipping completed`);

	const zipPath = path.join(buildsDir, `${buildFull}.7z`);
	const hashPath = path.join(buildsDir, `${buildFull}.7z.sha256`);
	console.info(`[Checksum] Generating SHA256 checksum...`);
	const hash = crypto.createHash('sha256');
	const stream = fs.createReadStream(zipPath);
	const checksum = await new Promise<string>((resolve, reject) => {
		stream.on('data', (chunk) => hash.update(chunk));
		stream.on('end', () => resolve(hash.digest('hex')));
		stream.on('error', reject);
	});
	fs.writeFileSync(hashPath, `${checksum} ${path.basename(zipPath)}\n`);
	console.info(`[Checksum] Checksum created: ${hashPath}`);
	console.info(`[Checksum] SHA256: ${checksum}`);
}

function getFriendlyName(buildString: string): string {
	if (buildString.includes('linuxstatic')) {
		buildString = buildString.replace('linuxstatic', 'linux');
	}
	return buildString;
}
