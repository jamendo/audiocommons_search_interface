import { HttpMethod } from 'lib/http/HttpMethod';

export interface IRequestOptions {
	protocol: 'http' | 'https';
	host: string;
	port?: number;
	path: string;
	method: HttpMethod;
	headers?: {
		[name: string]: string | number | Array<string | number>;
	};
	type?: 'plain' | 'json';
}

export interface IResponse<TBody> {
	statusCode: number;
	headers: {
		[name: string]: string;
	};
	body: TBody;
}


/**
 * An object that can send HTTP requests and process HTTP responses.
 */
export interface IHttpClient {
	send<TReq, TResBody>(options: IRequestOptions, payload?: TReq): Promise<IResponse<TResBody>>;
}
