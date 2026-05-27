declare module 'm3u8-parser' {
	export class Parser {
		push(data: string): void;
		end(): void;
		manifest: Manifest;
	}
	export interface Manifest {
		segments?: any[];
		playlists?: any[];
		mediaGroups?: any;
		[key: string]: any;
	}
}

declare module 'iso-639' {
	export function get(code: string): { name: string; nativeName: string } | undefined;
	export const iso_639_2: Record<string, Record<string, string>>;
}

declare module 'mpd-parser' {
	export function parse(mpdXml: string, options?: any): any;
}
