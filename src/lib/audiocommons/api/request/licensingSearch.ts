export interface ILicensingSearchRequest {
	access_token: string;
	client_id: string;
	acid: string;
	include?: string;
}

export interface ILicensingSearchResponseMeta {
	response_id: string;
	status: 'PR' | 'FI';
	n_expected_responses: number;
	n_received_responses: number;
	sent_timestamp: string;
	collect_url: string;
	current_timestamp: string;
}

/**
 * The response returned by the licensing search API endpoint.
 */
export interface ILicensingSearchResponse {
	meta: ILicensingSearchResponseMeta;
	contents: {};
	warnings: {};
	errors: {};
}
