import * as yamlCfg from './cfg-loader';
import * as yargs from './app-args';
import { console } from './log';
import { argvC } from './app-args';
import { ProxyAgent, fetch, RequestInit } from 'undici';

export type FetchParams = Partial<RequestInit & CustomParams>;

export type Params = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	headers?: Record<string, string>;
	body?: BodyInit | undefined;
	binary?: boolean;
	followRedirect?: 'follow' | 'error' | 'manual';
};

type CustomParams = {
	useProxy: boolean;
};

type GetDataResponse = {
	ok: boolean;
	res?: Response;
	headers?: Record<string, string>;
	error?: {
		name: string;
	} & TypeError & {
			res?: Response;
		};
};

export class Req {
	private debug: boolean;
	public argv: typeof argvC;

	constructor() {
		const cfg = yamlCfg.loadCfg();
		this.argv = yargs.appArgv(cfg.cli);
		this.debug = this.argv.debug ?? false;
	}

	async getData(durl: string, params: Partial<RequestInit & CustomParams> = {}): Promise<GetDataResponse> {
		const options: RequestInit = {
			method: params.method ? params.method : 'GET'
		};
		if (params.headers) {
			options.headers = params.headers;
		}
		if (params.body) {
			options.body = params.body;
		}
		if (typeof params.redirect == 'string') {
			options.redirect = params.redirect;
		}

		let dispatcher: ProxyAgent | undefined;
		const validProxy = this.argv.proxy ? this.isValidProxyUrl(this.argv.proxy) : false;
		if ((params.useProxy || this.argv.proxyAll) && this.argv.proxy && validProxy) {
			dispatcher = new ProxyAgent(this.argv.proxy);
		} else if ((params.useProxy || this.argv.proxyAll) && this.argv.proxy && !validProxy) {
			console.warn('[Fetch] Provided invalid Proxy URL, not proxying traffic.');
		}

		if (this.debug) {
			console.debug('[DEBUG] FETCH OPTIONS:');
			console.debug(options);
		}

		try {
			const res = await fetch(durl, { ...options, dispatcher: dispatcher });
			if (!res.ok) {
				console.error(`${res.status}: ${res.statusText}`);
				const body = await res.text();
				const docTitle = body.match(/<title>(.*)<\/title>/);
				if (body && docTitle) {
					console.error(docTitle[1]);
				} else {
					console.error(body);
				}
			}
			return {
				ok: res.ok,
				res: res as any,
				headers: params.headers as Record<string, string>
			};
		} catch (_error) {
			const error = _error as {
				name: string;
			} & TypeError & {
					res: Response;
				};
			if (error.res && error.res.status && error.res.statusText) {
				console.error(`${error.name} ${error.res.status}: ${error.res.statusText}`);
			} else {
				console.error(`${error.name}: ${error.res?.statusText || error.message}`);
			}
			if (error.res) {
				const body = await error.res.text();
				const docTitle = body.match(/<title>(.*)<\/title>/);
				if (body && docTitle) {
					console.error(docTitle[1]);
				}
			}
			return {
				ok: false,
				error
			};
		}
	}

	private isValidProxyUrl(proxyUrl: string): boolean {
		try {
			if (!proxyUrl.match(/^(https?|socks4|socks5):\/\//)) {
				return false;
			}

			const url = new URL(proxyUrl);

			if (!url.hostname) return false;

			if (!['http:', 'https:', 'socks4:', 'socks5:'].includes(url.protocol)) {
				return false;
			}

			if (url.port && (!/^\d+$/.test(url.port) || Number(url.port) < 1 || Number(url.port) > 65535)) {
				return false;
			}

			return true;
		} catch {
			return false;
		}
	}
}
