import { dubLanguageCodes, languages, subtitleLanguagesFilter } from './langsData';

const groups = {
	auth: 'Authentication:',
	fonts: 'Fonts:',
	search: 'Search:',
	dl: 'Downloading:',
	mux: 'Muxing:',
	fileName: 'Filename Template:',
	debug: 'Debug:',
	util: 'Utilities:',
	help: 'Help:'
};

export type AvailableFilenameVars = 'title' | 'episode' | 'showTitle' | 'seriesTitle' | 'season' | 'width' | 'height' | 'service';

const availableFilenameVars: AvailableFilenameVars[] = ['title', 'episode', 'showTitle', 'seriesTitle', 'season', 'width', 'height', 'service'];

export type AvailableMuxer = 'ffmpeg' | 'mkvmerge';
export const muxer: AvailableMuxer[] = ['ffmpeg', 'mkvmerge'];

export type TAppArg<T extends boolean | string | number | unknown[], K = any> = {
	name: string;
	group: keyof typeof groups;
	type: 'boolean' | 'string' | 'number' | 'array';
	choices?: T[];
	alias?: string;
	describe: string;
	docDescribe: true | string;
	default?:
		| T
		| {
				default: T | undefined;
				name?: string;
		  };
	service: Array<'hidive' | 'all'>;
	usage: string;
	demandOption?: true;
	transformer?: (value: T) => K;
};

const args: TAppArg<boolean | number | string | unknown[]>[] = [
	{
		name: 'auth',
		describe: 'Enter authentication mode',
		type: 'boolean',
		group: 'auth',
		service: ['all'],
		docDescribe: 'Log in with your Hidive credentials',
		usage: ''
	},
	{
		name: 'search',
		group: 'search',
		alias: 'f',
		describe: 'Search for an anime by the given string',
		type: 'string',
		docDescribe: true,
		service: ['all'],
		usage: '${search}'
	},
	{
		name: 'page',
		alias: 'p',
		describe: 'Set the page number for search results',
		docDescribe: true,
		group: 'search',
		service: ['all'],
		type: 'number',
		usage: '${page}'
	},
	{
		group: 'search',
		name: 'new',
		describe: 'Get last updated series list',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 's',
		group: 'dl',
		type: 'string',
		describe: 'Set the season ID',
		docDescribe: 'Used to set the season ID to download from',
		service: ['all'],
		usage: '${ID}'
	},
	{
		name: 'srz',
		group: 'dl',
		type: 'string',
		describe: 'Set the series ID',
		docDescribe: 'Used to set the series ID to download from',
		service: ['all'],
		usage: '${ID}'
	},
	{
		name: 'e',
		group: 'dl',
		describe: 'Set the episode(s) to download from any given show',
		docDescribe:
			'Set the episode(s) to download from any given show.' +
			'\nFor multiple selection: 1-4 OR 1,2,3,4 ' +
			'\nFor special episodes: S1-4 OR S1,S2,S3,S4 where S is the special letter',
		service: ['all'],
		type: 'string',
		usage: '${selection}',
		alias: 'episode'
	},
	{
		name: 'q',
		group: 'dl',
		describe: 'Set the quality level. Use 0 to use the maximum quality.',
		default: {
			default: 0
		},
		docDescribe: true,
		service: ['all'],
		type: 'number',
		usage: '${qualityLevel}'
	},
	{
		name: 'removeBumpers',
		describe: 'Remove bumpers from final video',
		type: 'boolean',
		group: 'dl',
		service: ['hidive'],
		docDescribe: 'Remove bumpers such as the Hidive intro from the final file.',
		usage: '',
		default: {
			default: true
		}
	},
	{
		name: 'originalFontSize',
		describe: 'Keep original font size',
		type: 'boolean',
		group: 'dl',
		service: ['hidive'],
		docDescribe: 'Keep the original font size defined by the service.',
		usage: '',
		default: {
			default: true
		}
	},
	{
		name: 'x',
		group: 'dl',
		describe: 'Select the server to use',
		choices: [1, 2, 3, 4],
		default: {
			default: 1
		},
		type: 'number',
		alias: 'server',
		docDescribe: true,
		service: ['all'],
		usage: '${server}'
	},
	{
		name: 'dlsubs',
		group: 'dl',
		describe: 'Download subtitles by language tag (space-separated)',
		docDescribe: true,
		service: ['all'],
		type: 'array',
		choices: subtitleLanguagesFilter,
		default: {
			default: ['all']
		},
		usage: '${sub1} ${sub2}'
	},
	{
		name: 'skipMuxOnSubFail',
		group: 'dl',
		describe: 'Skips muxing when a subtitle download fails.',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'noASSConv',
		group: 'dl',
		describe: 'Disables VTT conversion to ASS.',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'novids',
		group: 'dl',
		describe: 'Skip downloading videos',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'noaudio',
		group: 'dl',
		describe: 'Skip downloading audio',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'nosubs',
		group: 'dl',
		describe: 'Skip downloading subtitles',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'dubLang',
		describe: 'Set the language to download',
		docDescribe: true,
		group: 'dl',
		choices: dubLanguageCodes,
		default: {
			default: [dubLanguageCodes.slice(-1)[0]]
		},
		service: ['all'],
		type: 'array',
		usage: '${dub1} ${dub2}'
	},
	{
		name: 'all',
		describe: 'Used to download all episodes from the show',
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		default: {
			default: false
		},
		type: 'boolean',
		usage: ''
	},
	{
		name: 'fontSize',
		describe: 'Used to set the font size of the subtitles',
		default: {
			default: 55
		},
		docDescribe: 'When converting the subtitles to ASS, this will change the font size',
		group: 'dl',
		service: ['all'],
		type: 'number',
		usage: '${fontSize}'
	},
	{
		name: 'combineLines',
		describe: 'Merge adjacent lines with same style and text',
		docDescribe: 'Prevents a line from shifting downwards',
		group: 'dl',
		service: ['hidive'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'allDubs',
		describe: 'If selected, all available dubs will get downloaded',
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'timeout',
		group: 'dl',
		type: 'number',
		describe: 'Set the timeout of all download requests (milliseconds)',
		docDescribe: true,
		service: ['all'],
		usage: '${timeout}',
		default: {
			default: 15 * 1000
		}
	},
	{
		name: 'waittime',
		group: 'dl',
		type: 'number',
		describe: 'Set the time the program waits between downloads (milliseconds)',
		docDescribe: true,
		service: ['all'],
		usage: '${waittime}',
		default: {
			default: 0
		}
	},
	{
		name: 'simul',
		group: 'dl',
		describe: 'Force downloading simulcast version instead of uncut version (if available).',
		docDescribe: true,
		service: ['hidive'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'mp4',
		group: 'mux',
		describe: 'Mux video into mp4',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'keepAllVideos',
		group: 'mux',
		describe: 'Keeps all videos when merging instead of discarding extras',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'syncTiming',
		group: 'mux',
		describe: 'Attempts to sync timing for multi-dub downloads (experimental)',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'skipmux',
		describe: 'Skip muxing video, audio and subtitles',
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'fileName',
		group: 'fileName',
		describe: `Set the filename template. Use \${variable_name} to insert variables.\nYou may use ${availableFilenameVars
			.map((a) => `'${a}'`)
			.join(', ')} as variables.`,
		docDescribe: true,
		service: ['all'],
		type: 'string',
		usage: '${fileName}',
		default: {
			default: '[HIDIVE] ${showTitle} - S${season}E${episode} [${height}p]'
		}
	},
	{
		name: 'numbers',
		group: 'fileName',
		describe: 'Set how long a number in the title should be at least.',
		type: 'number',
		default: {
			default: 2
		},
		docDescribe: true,
		service: ['all'],
		usage: '${number}'
	},
	{
		name: 'nosess',
		group: 'debug',
		describe: 'Reset session cookie for testing purposes',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'debug',
		group: 'debug',
		describe: 'Debug mode (tokens may be revealed in the console output)',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'nocleanup',
		describe: "Don't delete subtitle, audio and video files after muxing",
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'boolean',
		default: {
			default: false
		},
		usage: ''
	},
	{
		name: 'help',
		alias: 'h',
		describe: 'Show the help output',
		docDescribe: true,
		group: 'help',
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'fontName',
		group: 'fonts',
		describe: 'Set the font to use in subtitles',
		docDescribe: true,
		service: ['all'],
		type: 'string',
		usage: '${fontName}'
	},
	{
		name: 'but',
		describe: 'Download everything but the -e selection',
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'downloadArchive',
		describe: 'Used to download all archived shows',
		group: 'dl',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'addArchive',
		describe: 'Used to add the -s to downloadArchive',
		group: 'dl',
		docDescribe: true,
		service: ['all'],
		type: 'boolean',
		usage: ''
	},
	{
		name: 'skipSubMux',
		describe: 'Skip muxing the subtitles',
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'partsize',
		describe: 'Set the amount of parts to download at once',
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		type: 'number',
		usage: '${amount}',
		default: {
			default: 10
		}
	},
	{
		name: 'username',
		describe: 'Set the username to use for authentication',
		docDescribe: true,
		group: 'auth',
		service: ['all'],
		type: 'string',
		usage: '${username}',
		default: {
			default: undefined
		}
	},
	{
		name: 'password',
		describe: 'Set the password to use for authentication',
		docDescribe: true,
		group: 'auth',
		service: ['all'],
		type: 'string',
		usage: '${password}',
		default: {
			default: undefined
		}
	},
	{
		name: 'forceMuxer',
		describe: "Force the program to use said muxer or don't mux if the given muxer is not present",
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'string',
		usage: '${muxer}',
		choices: muxer,
		default: {
			default: undefined
		}
	},
	{
		name: 'fsRetryTime',
		describe: 'Set the time the downloader waits before retrying if an error while writing the file occurs',
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		type: 'number',
		usage: '${time in seconds}',
		default: {
			default: 5
		}
	},
	{
		name: 'override',
		describe: 'Override a template variable',
		docDescribe: true,
		group: 'fileName',
		service: ['all'],
		type: 'array',
		usage: '"${toOverride}=\'${value}\'"',
		default: {
			default: []
		}
	},
	{
		name: 'videoTitle',
		describe: 'Set the video track name of the merged file',
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'string',
		usage: '${title}'
	},
	{
		name: 'raw',
		describe: 'Output raw data from the API',
		docDescribe: true,
		group: 'util',
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	},
	{
		name: 'rawoutput',
		describe: 'Provide a path to output the raw data from the API into a file',
		docDescribe: true,
		group: 'util',
		service: ['all'],
		type: 'string',
		usage: '',
		default: {
			default: ''
		}
	},
	{
		name: 'force',
		describe: "Set the default option for the 'already exists' prompt",
		docDescribe: true,
		group: 'dl',
		service: ['all'],
		type: 'string',
		usage: '${option}',
		choices: ['y', 'Y', 'n', 'N', 'c', 'C']
	},
	{
		name: 'mkvmergeOptions',
		describe: 'Set the options given to mkvmerge',
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'array',
		usage: '${args}',
		default: {
			default: ['--no-date', '--disable-track-statistics-tags', '--engage no_variable_data']
		}
	},
	{
		name: 'ffmpegOptions',
		describe: 'Set the options given to ffmpeg',
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'array',
		usage: '${args}',
		default: {
			default: []
		}
	},
	{
		name: 'defaultAudio',
		describe: `Set the default audio track by language code\nPossible Values: ${languages.map((a) => a.code).join(', ')}`,
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'string',
		usage: '${args}',
		default: {
			default: 'eng'
		},
		transformer: (val) => {
			const item = languages.find((a) => a.code === val);
			if (!item) {
				throw new Error(`Unable to find language code ${val}!`);
			}
			return item;
		}
	},
	{
		name: 'defaultSub',
		describe: `Set the default subtitle track by language code\nPossible Values: ${languages.map((a) => a.code).join(', ')}`,
		docDescribe: true,
		group: 'mux',
		service: ['all'],
		type: 'string',
		usage: '${args}',
		default: {
			default: 'eng'
		},
		transformer: (val) => {
			const item = languages.find((a) => a.code === val);
			if (!item) {
				throw new Error(`Unable to find language code ${val}!`);
			}
			return item;
		}
	},
	{
		name: 'ccTag',
		describe: 'Used to set the name for subtitles with non-verbal communication (e.g. signs)',
		docDescribe: true,
		group: 'fileName',
		service: ['all'],
		type: 'string',
		usage: '${tag}',
		default: {
			default: 'cc'
		}
	},
	{
		name: 'proxy',
		describe: 'Uses Proxy on geo-restricted endpoints (e.g. https://127.0.0.1:1080)',
		docDescribe: true,
		group: 'util',
		service: ['all'],
		type: 'string',
		usage: '${proxy_url}',
		default: {
			default: ''
		}
	},
	{
		name: 'proxyAll',
		describe: 'Proxies everything, not recommended.',
		docDescribe: true,
		group: 'util',
		service: ['all'],
		type: 'boolean',
		usage: '',
		default: {
			default: false
		}
	}
];

const getDefault = <T extends boolean | string | number | unknown[]>(name: string, cfg: Record<string, T>): T => {
	const option = args.find((item) => item.name === name);
	if (!option) throw new Error(`Unable to find option ${name}`);
	if (option.default === undefined) throw new Error(`Option ${name} has no default`);
	if (typeof option.default === 'object') {
		if (Array.isArray(option.default)) return option.default as T;
		if (Object.prototype.hasOwnProperty.call(cfg, (option.default as any).name ?? option.name)) {
			return cfg[(option.default as any).name ?? option.name];
		} else {
			return (option.default as any).default as T;
		}
	} else {
		return option.default as T;
	}
};

const buildDefault = () => {
	const data: Record<string, unknown> = {};
	const defaultArgs = args.filter((a) => a.default);
	defaultArgs.forEach((item) => {
		if (typeof item.default === 'object') {
			if (Array.isArray(item.default)) {
				data[item.name] = item.default;
			} else {
				data[(item.default as any).name ?? item.name] = (item.default as any).default;
			}
		} else {
			data[item.name] = item.default;
		}
	});
	return data;
};

export { getDefault, buildDefault, args, groups, availableFilenameVars };
