import fs from 'fs';

export function convertChaptersToFFmpegFormat(inputFilePath: string): string {
	const content = fs.readFileSync(inputFilePath, 'utf-8');

	const chapterMatches = Array.from(content.matchAll(/CHAPTER(\d+)=([\d:.]+)/g));
	const nameMatches = Array.from(content.matchAll(/CHAPTER(\d+)NAME=([^\n]+)/g));

	const chapters = chapterMatches
		.map((m) => ({
			index: parseInt(m[1], 10),
			time: m[2]
		}))
		.sort((a, b) => a.index - b.index);

	const nameDict: Record<number, string> = {};
	nameMatches.forEach((m) => {
		nameDict[parseInt(m[1], 10)] = m[2];
	});

	let ffmpegContent = ';FFMETADATA1\n';
	let startTimeInNs = 0;

	for (let i = 0; i < chapters.length; i++) {
		const chapterStartTime = timeToNanoSeconds(chapters[i].time);
		const chapterEndTime = i + 1 < chapters.length ? timeToNanoSeconds(chapters[i + 1].time) : chapterStartTime + 1000000000;

		const chapterName = nameDict[chapters[i].index] || `Chapter ${chapters[i].index}`;

		ffmpegContent += '[CHAPTER]\n';
		ffmpegContent += 'TIMEBASE=1/1000000000\n';
		ffmpegContent += `START=${startTimeInNs}\n`;
		ffmpegContent += `END=${chapterEndTime}\n`;
		ffmpegContent += `title=${chapterName}\n`;

		startTimeInNs = chapterEndTime;
	}

	return ffmpegContent;
}

export function timeToNanoSeconds(time: string): number {
	const parts = time.split(':');
	const hours = parseInt(parts[0], 10);
	const minutes = parseInt(parts[1], 10);
	const secondsAndMs = parts[2].split('.');
	const seconds = parseInt(secondsAndMs[0], 10);
	const milliseconds = parseInt(secondsAndMs[1], 10);

	return (hours * 3600 + minutes * 60 + seconds) * 1000000000 + milliseconds * 1000000;
}



/**
 * Convert milliseconds to the OGM/Matroska chapter `HH:MM:SS.mmm` format that
 * mkvmerge consumes via `--chapters` and that this module's
 * `convertChaptersToFFmpegFormat` re-parses for ffmpeg.
 */
export function millisToChapterTime(totalMs: number): string {
	const safeMs = Math.max(0, Math.floor(totalMs));
	const ms = safeMs % 1000;
	const totalSeconds = Math.floor(safeMs / 1000);
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const minutes = totalMinutes % 60;
	const hours = Math.floor(totalMinutes / 60);
	const pad = (n: number, w = 2) => n.toString().padStart(w, '0');
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(ms, 3)}`;
}

type RawSkipMarker = {
	type?: string;
	category?: string;
	startMillis?: number;
	endMillis?: number;
	start?: number;
	end?: number;
	startTime?: number;
	endTime?: number;
	[key: string]: unknown;
};

/**
 * Best-effort name lookup for HIDIVE marker types.
 */
function markerLabel(rawType: string | undefined): string {
	const t = (rawType ?? '').toUpperCase();
	switch (t) {
		case 'RECAP':
		case 'SKIPRECAP':
			return 'Recap';
		case 'INTRO':
		case 'OPENING':
		case 'OP':
			return 'Intro';
		case 'OUTRO':
		case 'ENDING':
		case 'ED':
			return 'Outro';
		case 'CREDITS':
		case 'CREDIT':
			return 'Credits';
		case 'PREVIEW':
		case 'NEXT':
			return 'Preview';
		default:
			return t ? t.charAt(0) + t.slice(1).toLowerCase() : 'Chapter';
	}
}

/**
 * Pull a millisecond start/end pair out of a skip marker, regardless of
 * which field-naming variant the backend used.
 */
function extractMarkerTimes(m: RawSkipMarker): { startMs: number; endMs: number } | null {
	const startMs = pickMillis(m.startMillis ?? m.start ?? m.startTime);
	const endMs = pickMillis(m.endMillis ?? m.end ?? m.endTime);
	if (startMs === null || endMs === null) return null;
	if (endMs <= startMs) return null;
	return { startMs, endMs };
}

/**
 * Coerce a numeric value that might be milliseconds OR seconds into ms.
 * Anything < 1000 is treated as seconds (safer assumption for chapter times).
 */
function pickMillis(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
	return value < 1000 ? Math.round(value * 1000) : Math.round(value);
}

/**
 * Build OGM/Matroska CHAPTER lines from HIDIVE skip markers. Returns the
 * full file body (including a `Episode` chapter at offset 0 if needed),
 * or `null` if no usable markers are present.
 *
 * The output is consumed by:
 * - mkvmerge directly (`--chapters file.txt`)
 * - `convertChaptersToFFmpegFormat` for the ffmpeg path
 */
export function buildChapterFileFromSkipMarkers(skipMarkers: RawSkipMarker[] | undefined | null): string | null {
	if (!Array.isArray(skipMarkers) || skipMarkers.length === 0) return null;

	const segments: { startMs: number; endMs: number; label: string }[] = [];
	for (const marker of skipMarkers) {
		if (!marker || typeof marker !== 'object') continue;
		const times = extractMarkerTimes(marker);
		if (!times) continue;
		segments.push({
			startMs: times.startMs,
			endMs: times.endMs,
			label: markerLabel(marker.type ?? marker.category)
		});
	}

	if (segments.length === 0) return null;

	segments.sort((a, b) => a.startMs - b.startMs);

	// Build a list of chapter start points. Insert an "Episode" boundary
	// whenever there's a gap between the end of one marker and the start of
	// the next, so chapter ranges cover the whole timeline.
	const points: { timeMs: number; label: string }[] = [];

	if (segments[0].startMs > 500) {
		points.push({ timeMs: 0, label: 'Prologue' });
	}

	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		// Avoid duplicate timestamps (e.g. recap end == intro start).
		const last = points[points.length - 1];
		if (!last || Math.abs(last.timeMs - seg.startMs) > 50) {
			points.push({ timeMs: seg.startMs, label: seg.label });
		}
		const next = segments[i + 1];
		const nextStart = next ? next.startMs : Number.POSITIVE_INFINITY;
		if (seg.endMs + 500 < nextStart) {
			points.push({ timeMs: seg.endMs, label: 'Episode' });
		}
	}

	if (points.length === 0) return null;

	const lines: string[] = [];
	for (let i = 0; i < points.length; i++) {
		const idx = (i + 1).toString().padStart(2, '0');
		lines.push(`CHAPTER${idx}=${millisToChapterTime(points[i].timeMs)}`);
		lines.push(`CHAPTER${idx}NAME=${points[i].label}`);
	}
	return lines.join('\n') + '\n';
}
