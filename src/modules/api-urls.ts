const domain = {
	hd_www: 'https://www.hidive.com',
	hd_api: 'https://api.hidive.com',
	hd_new: 'https://dce-frontoffice.imggaming.com'
};

export type APIType = {
	hd_apikey: string;
	hd_devName: string;
	hd_appId: string;
	hd_clientWeb: string;
	hd_clientExo: string;
	hd_api: string;
	hd_new_api: string;
	hd_new_apiKey: string;
	hd_new_version: string;
};

const api: APIType = {
	hd_apikey: '508efd7b42d546e19cc24f4d0b414e57e351ca73',
	hd_devName: 'Android',
	hd_appId: '24i-Android',
	hd_clientWeb: 'okhttp/3.4.1',
	hd_clientExo: 'smartexoplayer/1.6.0.R (Linux;Android 6.0) ExoPlayerLib/2.6.0',
	hd_api: `${domain.hd_api}/api/v1`,
	hd_new_api: `${domain.hd_new}/api`,
	hd_new_apiKey: '857a1e5d-e35e-4fdf-805b-a87b6f8364bf',
	hd_new_version: '6.58.0.a0c6b52'
};

export { domain, api };
