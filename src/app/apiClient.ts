import { Client } from 'lib/audiocommons/api/Client';
import { HttpClient } from 'lib/audiocommons/api/HttpClient';


/**
 * The client object we'll be using.
 * This is instantiated lazily by [[getAudioCommonsApiClient]].
 */
let client: Client;


/**
 * Returns a fully configured AudioCommons API client instance.
 */
export function getAudioCommonsApiClient() {
	client = client || new Client({
		protocol: 'https',
		host: 'm.audiocommons.org',
		port: 443,
		clientId: 'to_define',
		password: 'to_define',
		username: 'to_define',
		serviceInfoCacheTTL: 1e3 * 60 * 3,
		paths: {
			RefreshApiToken: '/api/o/token',
			TextSearch: '/api/v1/search/text/',
			Collect: '/api/v1/collect/',
			Services: '/api/v1/services/',
			Licensing: '/api/v1/license/'
		},
		httpClient: new HttpClient()
	});

	return client;
}
