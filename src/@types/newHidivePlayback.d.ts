export interface NewHidivePlayback {
	watermark: null;
	skipMarkers: SkipMarker[];
	annotations: null;
	dash: Format[];
	hls: Format[];
}

/**
 * HIDIVE / DCE skip marker. The backend has used a few shapes over time;
 * we accept the most common ones defensively.
 *
 * Known marker types include: 'RECAP', 'INTRO', 'OPENING', 'ENDING',
 * 'CREDITS', 'PREVIEW', 'SKIPRECAP'.
 *
 * Time fields may be in milliseconds (`startMillis` / `endMillis`),
 * milliseconds (`start` / `end`) or seconds (`startTime` / `endTime`).
 */
export interface SkipMarker {
	type?: string;
	category?: string;
	startMillis?: number;
	endMillis?: number;
	start?: number;
	end?: number;
	startTime?: number;
	endTime?: number;
	[key: string]: unknown;
}

export interface Format {
	subtitles: Subtitle[];
	url: string;
	drm: DRM;
}

export interface DRM {
	encryptionMode: string;
	containerType: string;
	jwtToken: string;
	url: string;
	keySystems: string[];
}

export interface Subtitle {
	format: Formats;
	language: string;
	url: string;
}

export enum Formats {
	Scc = 'scc',
	Srt = 'srt',
	Vtt = 'vtt'
}
