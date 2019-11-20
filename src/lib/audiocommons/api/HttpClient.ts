import { IHttpClient, IRequestOptions, IResponse } from 'lib/audiocommons/api/IHttpClient';
import * as request from 'request-promise';
import { HttpMethod } from '../../http/HttpMethod';

/**
 * A basic implementation of [[IHttpClient]].
 */
export class HttpClient implements IHttpClient {
	public async send<TResBody>(options: IRequestOptions, payload?: any): Promise<IResponse<TResBody>> {
		const { protocol, host, port, path, headers, method, type } = options;

		return await request({
			simple: false,
			resolveWithFullResponse: true,
			uri: `${protocol}://${host}:${port}/${path}`,
			method,
			headers,
			json: type === 'json' ? true : false,
			form: method !== HttpMethod.Get ? payload : undefined,
			qs: method === HttpMethod.Get ? payload : undefined
		});
	}
}
