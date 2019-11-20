import { IClientDependencies } from 'lib/audiocommons/api/IClientDependencies';
import { IApiToken } from 'lib/audiocommons/api/IApiToken';
import { IRequestOptions, IResponse } from 'lib/audiocommons/api/IHttpClient';
import { HttpStatusCode } from 'lib/http/HttpStatusCode';
import {
	AudioCommonsApiClientApiTokenRefreshFailedError,
	AudioCommonsApiClientRequestUnsuccessful
} from 'lib/audiocommons/api/error';
import { Endpoint } from 'lib/audiocommons/api/Endpoint';
import { HttpMethod } from 'lib/http/HttpMethod';
import { ITokenByPasswordResponse, ITokenByPasswordRequest } from 'lib/audiocommons/api/request/tokenByPassword';
import { ITextSearchRequest, ITextSearchResponse } from 'lib/audiocommons/api/request/textSearch';
import {
	ICollectRequest,
	ITextSearchCollectResponse,
	ILicensingCollectResponse
} from 'lib/audiocommons/api/request/collect';
import { TextSearchBuilder } from 'lib/audiocommons/api/TextSearchBuilder';
import { ITextSearchResult } from 'lib/audiocommons/api/ITextSearchResult';
import { IServiceRequest, IServiceResponse } from './request/services';
import { ILicensingSearchResult } from './ILicensingSearchResult';
import { ILicensingSearchResponse, ILicensingSearchRequest } from './request/licensingSearch';

/**
 * Audiocommons API client.
 */
export class Client {
	/**
	 * Creates a new instance.
	 * @param dependencies All dependencies to be injected into this client.
	 */
	public constructor(
		protected readonly dependencies: IClientDependencies
	) {}


	//#region HTTP

	private getHttpRequestOptions(endpoint: Endpoint, method: HttpMethod): IRequestOptions {
		const { protocol, host, port, paths } = this.dependencies;

		return {
			protocol, host, port,
			path: paths[endpoint],
			method,
			type: 'json'
		};
	}


	/**
	 * Sends an HTTP request using [[dependencies.httpClient]].
	 * The HTTP request options will be generated using [[getHttpRequestOptions]].
	 * @param endpoint The endpoint to send a request to.
	 * @param method The HTTP method to be used.
	 * @param payload The payload to send in the request.
	 * @param requestOptionOverrides Optional. Can be used to override some request options.
	 */
	private sendHttpRequest<TReq, TResBody>(
		endpoint: Endpoint,
		method: HttpMethod,
		payload?: TReq,
		requestOptionOverrides: Partial<IRequestOptions> = {}
	): Promise<IResponse<TResBody>> {
		const requestOptions = {
			...this.getHttpRequestOptions(endpoint, method),
			...requestOptionOverrides
		};
		return this.dependencies.httpClient.send<TReq, TResBody>(requestOptions, payload);
	}

	//#endregion HTTP


	//#region API Token Management

	/**
	 * The API token currently in use.
	 * This can be refreshsed by calling [[refreshToken]].
	 */
	protected apiToken?: Readonly<IApiToken>;


	/**
	 * Checks if the current API token needs to be refreshed before the next request.
	 */
	protected isNewApiTokenNecessary(): boolean {
		return (
			// if there's no token at all:
			!this.apiToken ||
			// if the token has expired:
			Date.now() - this.apiToken.requestedAt > this.apiToken.expiresAfter
		);
	}


	/**
	 * Refreshes the API token, regardless of whether the current API token has expired.
	 * @see [[refreshApiTokenIfNecessary]]
	 */
	protected async refreshApiToken(): Promise<void> {
		// We need the timestamp from when we _sent_ the request further down below
		// to update [[apiToken]].
		const now = Date.now();

		const { statusCode, body } = await this.sendHttpRequest<ITokenByPasswordRequest, ITokenByPasswordResponse>(
			Endpoint.RefreshApiToken,
			HttpMethod.Post,
			{
				client_id: this.dependencies.clientId,
				grant_type: 'password',
				username: this.dependencies.username,
				password: this.dependencies.password
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientApiTokenRefreshFailedError(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		this.apiToken = {
			requestedAt: now,
			expiresAfter: body.expires_in,
			accessToken: body.access_token
		};
	}


	/**
	 * Refreshes the API token if necessary.
	 */
	protected async refreshApiTokenIfNecessary(): Promise<void> {
		if (!this.isNewApiTokenNecessary()) {
			return;
		}

		await this.refreshApiToken();
	}


	/**
	 * Returns a valid API token string.
	 * Will refresh [[apiToken]] using [[refreshApiTokenIfNecessary]], if necessary.
	 */
	protected async getValidAccessToken(): Promise<string> {
		await this.refreshApiTokenIfNecessary();
		return this.apiToken!.accessToken;
	}


	//#endregion API Token Management



	//#region Public Requests

	private cachedServiceInfo?: IServiceResponse;

	private async updateCachedServiceInfo(): Promise<void> {
		const { statusCode, body } = await this.sendHttpRequest<IServiceRequest, IServiceResponse>(
			Endpoint.Services,
			HttpMethod.Get,
			{
				client_id: this.dependencies.clientId,
				access_token: await this.getValidAccessToken()
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientRequestUnsuccessful(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		this.cachedServiceInfo = body;
		setTimeout(() => {
			this.cachedServiceInfo = undefined;
		}, this.dependencies.serviceInfoCacheTTL);
	}

	/**
	 * Get info about all available AudioCommons services.
	 * @param forceLatest Whether or not to use the very latest service info. It is recommended to
	 *                    omit this parameter and only use it if the latest info is really required.
	 */
	public async getServiceInfo(forceLatest = false): Promise<IServiceResponse> {
		if (!this.cachedServiceInfo) {
			await this.updateCachedServiceInfo();
		}

		return this.cachedServiceInfo!;
	}

	public prepareTextSearch() {
		return new TextSearchBuilder();
	}

	public async startTextSearch(builder: TextSearchBuilder): Promise<ITextSearchResult> {
		const serviceInfo = await this.getServiceInfo();
		let services = builder.getProviders();

		if (services.length === 0) {
			services = Object.keys(serviceInfo.services);
		}

		const serviceDescriptions = services.map(service => {
			return serviceInfo.services[service].description;
		});

		const requestData = builder.finalize(...serviceDescriptions);

		const { statusCode, body } = await this.sendHttpRequest<ITextSearchRequest, ITextSearchResponse>(
			Endpoint.TextSearch,
			HttpMethod.Get,
			{
				client_id: this.dependencies.clientId,
				access_token: await this.getValidAccessToken(),
				...requestData
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientRequestUnsuccessful(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		return {
			responseId: body.meta.response_id,
			collectUrl: body.meta.collect_url
		};
	}

	public async collectPartialTextSearchResult(textSearchResponseId: string) {
		const { statusCode, body } = await this.sendHttpRequest<ICollectRequest, ITextSearchCollectResponse>(
			Endpoint.Collect,
			HttpMethod.Get,
			{
				client_id: this.dependencies.clientId,
				access_token: await this.getValidAccessToken(),
				rid: textSearchResponseId
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientRequestUnsuccessful(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		return body;
	}

	public async startLicensingSearch(acid: string, ...providers: string[]): Promise<ILicensingSearchResult> {
		const { statusCode, body } = await this.sendHttpRequest<ILicensingSearchRequest, ILicensingSearchResponse>(
			Endpoint.Licensing,
			HttpMethod.Get,
			{
				client_id: this.dependencies.clientId,
				access_token: await this.getValidAccessToken(),
				acid,
				include: providers && providers.length ? providers.join(',') : undefined
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientRequestUnsuccessful(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		return {
			responseId: body.meta.response_id,
			collectUrl: body.meta.collect_url
		};
	}

	public async collectPartialLicensingSearchResult(textSearchResponseId: string) {
		const { statusCode, body } = await this.sendHttpRequest<ICollectRequest, ILicensingCollectResponse>(
			Endpoint.Collect,
			HttpMethod.Get,
			{
				client_id: this.dependencies.clientId,
				access_token: await this.getValidAccessToken(),
				rid: textSearchResponseId
			}
		);

		if (statusCode !== HttpStatusCode.OK) {
			throw new AudioCommonsApiClientRequestUnsuccessful(
				`Received status code ${statusCode}, response body: ${JSON.stringify(body, undefined, '  ')}`
			);
		}

		return body;
	}

	//#endregion Public Requests
}
