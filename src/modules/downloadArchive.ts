import * as path from 'path';
import * as fs from 'fs';
import { ArgvType } from './app-args';
import { workingDir } from './cfg-loader';

export const archiveFile = path.join(workingDir, 'config', 'archive.json');

export type ItemType = {
	id: string;
	already: string[];
}[];

export type DataType = {
	hidive: {
		s: ItemType;
	};
};

const addToArchive = (
	kind: {
		service: 'hidive';
		type: 's';
	},
	ID: string
) => {
	const data = loadData();

	if (Object.prototype.hasOwnProperty.call(data, kind.service)) {
		const items = data[kind.service][kind.type];
		if (items.findIndex((a) => a.id === ID) >= 0) return;
		items.push({
			id: ID,
			already: []
		});
		data[kind.service][kind.type] = items;
	} else {
		data['hidive'] = {
			s: [
				{
					id: ID,
					already: []
				}
			]
		};
	}
	fs.writeFileSync(archiveFile, JSON.stringify(data, null, 4));
};

const downloaded = (
	kind: {
		service: 'hidive';
		type: 's';
	},
	ID: string,
	episode: string[]
) => {
	let data = loadData();
	if (
		!Object.prototype.hasOwnProperty.call(data, kind.service) ||
		!Object.prototype.hasOwnProperty.call(data[kind.service], kind.type)
	) {
		addToArchive(kind, ID);
		data = loadData();
	}

	const archivedata = data[kind.service][kind.type];
	const alreadyData = archivedata.find((a) => a.id === ID)?.already;
	for (const ep of episode) {
		if (alreadyData?.includes(ep)) continue;
		alreadyData?.push(ep);
	}
	fs.writeFileSync(archiveFile, JSON.stringify(data, null, 4));
};

const makeCommand = (): Partial<ArgvType>[] => {
	const data = loadData();
	const ret: Partial<ArgvType>[] = [];
	if (!data.hidive) return ret;
	const kind = data.hidive;
	for (const type of Object.keys(kind)) {
		const item = kind[type as 's'];
		item.forEach((i) =>
			ret.push({
				but: true,
				all: false,
				e: i.already.join(','),
				s: i.id
			})
		);
	}
	return ret;
};

const loadData = (): DataType => {
	if (fs.existsSync(archiveFile)) return JSON.parse(fs.readFileSync(archiveFile).toString()) as DataType;
	return {} as DataType;
};

export { addToArchive, downloaded, makeCommand };
