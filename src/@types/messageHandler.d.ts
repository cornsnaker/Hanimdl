import { HLSCallback } from '../modules/hls-download';
import type { AvailableMuxer } from '../modules/args';
import { LanguageItem } from '../modules/langsData';

export type ResponseBase<T> =
	| {
			isOk: true;
			value: T;
	  }
	| {
			isOk: false;
			reason: Error;
	  };

export type ProgressData = {
	total: number;
	cur: number;
	percent: number | string;
	time: number;
	downloadSpeed: number;
	bytes: number;
};

export type DownloadInfo = {
	image: string;
	parent: {
		title: string;
	};
	title: string;
	language: LanguageItem;
	fileName: string;
};

export type ExtendedProgress = {
	progress: ProgressData;
	downloadInfo: DownloadInfo;
};

export type SearchResponseItem = {
	image: string;
	name: string;
	desc?: string;
	id: string;
	lang?: string[];
	rating: number;
};

export type SearchResponse = ResponseBase<SearchResponseItem[]>;

export type AuthData = { username: string; password: string };
export type SearchData = { search: string; page?: number; 'search-type'?: string; 'search-locale'?: string };
export type AuthResponse = ResponseBase<undefined>;
