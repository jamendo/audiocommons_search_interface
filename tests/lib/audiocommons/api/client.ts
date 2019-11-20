import { test, suite, timeout } from 'mocha-typescript';
import { assert } from 'lib/utils/assert';
import { IClientDependencies } from 'lib/audiocommons/api/IClientDependencies';
import { Client } from 'lib/audiocommons/api/Client';
import { HttpClient } from 'lib/audiocommons/api/HttpClient';
import { IApiToken } from 'lib/audiocommons/api/IApiToken';
import { TextSearchRequestField, TextSearchRequestSort } from 'lib/audiocommons/api/request/textSearch';


@suite class AudioCommonsApiClient {
	private getClientDependencies(): IClientDependencies {
		return {
			protocol: 'https',
			host: 'm.audiocommons.org',
			port: 443,
			clientId: 'to_define',
			password: 'to_define',
			username: 'to_define',
			serviceInfoCacheTTL: 1e3 * 60,
			paths: {
				RefreshApiToken: '/api/o/token',
				TextSearch: '/api/v1/search/text/',
				Collect: '/api/v1/collect/',
				Services: '/api/v1/services/',
				Licensing: '/api/v1/license/'
			},
			httpClient: new HttpClient()
		};
	}

	private createClient(clientDependencies: IClientDependencies = this.getClientDependencies()) {
		return new Client(clientDependencies);
	}



	//#region Basic Tests

	// Test if instantiation works at all:
	@test 'instantiate'() {
		const client = this.createClient();
		assert(true, 'did not throw on instantiation');
	}

	//#endregion Basic Tests



	//#region API Token Management Tests

	@test async 'update API token'() {
		const client = new (class NonProtectedClient extends Client {
			// Make some members public so we can test them:
			public apiToken?: IApiToken;
			public refreshApiTokenIfNecessary() { return super.refreshApiTokenIfNecessary(); }
		})(this.getClientDependencies());


		for (let i = 1; i < 4; i++) {
			await client.refreshApiTokenIfNecessary();
			assert(
				!!client.apiToken &&
				!!client.apiToken.accessToken &&
				client.apiToken.accessToken.length > 0,
				`API token updated (${i} times)`
			);
		}
	}

	//#endregion API Token Management Tests



	//#region Public Method Tests

	@timeout(30 * 1e3)
	@test async 'startTextSearch: basic functionality'() {
		const client = this.createClient();

		for (let i = 1; i < 5; i++) {
			const search = client.prepareTextSearch()
				.withTextQuery('guitar')
				.withFields(TextSearchRequestField.All)
				.sort(TextSearchRequestSort.PopularityDesc);

			const textSearchResult = await client.startTextSearch(search);
			assert(!!textSearchResult, `attempt ${i}: got text search result`);

			const collectedResults = await client.collectPartialTextSearchResult(textSearchResult.responseId);
			assert(!!collectedResults, `attempt ${i}: results collected`);
		}
	}

	//#endregion Public Method Tests
}
