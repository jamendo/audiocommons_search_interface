import { ITextSearchResponseMeta, TextSearchRequestField } from 'lib/audiocommons/api/request/textSearch';

export interface ICollectRequest {
	access_token: string;
	client_id: string;
	/**
	 * The ID of the request to collect results for.
	 */
	rid: string;
}

export type ICollectResponseTrack = {
	[key in TextSearchRequestField]: string;
};


export type ICollectResponseWarning = string;

export interface ICollectResponseWarnings {
	[providerName: string]: ICollectResponseWarning[];
}


export interface ICollectResponseError {
	status_code: number;
	type: 'ACException' | 'ACWarning';
	detail: string;
}

export interface ICollectResponseErrors {
	[providerName: string]: ICollectResponseError | ICollectResponseError[];
}

export interface ITextSearchCollectResponse {
	meta: ITextSearchResponseMeta;
	errors?: ICollectResponseErrors;
	warnings?: ICollectResponseWarnings;
	contents: {
		[providerName: string]: {
			num_results: number;
			results: ICollectResponseTrack[];
		};
	};
}

export interface ILicensingCollectResponse {
	meta: ITextSearchResponseMeta;
	errors?: ICollectResponseErrors;
	warnings?: ICollectResponseWarnings;
	contents: {
		[providerName: string]: {
			license_url: string;
		};
	};
}
