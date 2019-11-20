/**
 * Enumerates all field names that can be requested from the text search.
 */
// README:
//   1. Do not make this enum `const`, because we might need to map using
//      the enum literals at runtime.
//   2. The enum values must be the names as used in the API.
//
export enum TextSearchRequestField {
	AC_Id = 'ac:id',
	AC_Url = 'ac:url',
	AC_Name = 'ac:name',
	AC_Author = 'ac:author',
	AC_Author_url = 'ac:author_url',
	AC_Collection = 'ac:collection',
	AC_Collection_url = 'ac:collection_url',
	AC_Tags = 'ac:tags',
	AC_Tag = 'ac:tag',
	AC_Description = 'ac:description',
	AC_Timestamp = 'ac:timestamp',
	AC_License = 'ac:license',
	AC_License_deed_url = 'ac:license_deed_url',
	AC_Image = 'ac:image',
	AC_Duration = 'ac:duration',
	AC_Format = 'ac:format',
	AC_Filesize = 'ac:filesize',
	AC_Channels = 'ac:channels',
	AC_Bitrate = 'ac:bitrate',
	AC_Bitdepth = 'ac:bitdepth',
	AC_Samplerate = 'ac:samplerate',
	AC_Preview_url = 'ac:preview_url',
	AC_Waveform = 'ac:waveform_peaks'
}
export namespace TextSearchRequestField {
	/**
	 * An array with all values of [[TextSearchRequestFieldName]].
	 */
	// tslint:disable-next-line:variable-name
	export const All: TextSearchRequestField[] = (
		Object.keys(TextSearchRequestField)
			.map(literal => <TextSearchRequestField>TextSearchRequestField[<any>literal])
	);
}

/**
 * Enumerates all field names that can be requested from the text search.
 */
// README:
//   1. Do not make this enum `const`, because we might need to map using
//      the enum literals at runtime.
//   2. The enum values must be the names as used in the API.
//
export enum TextSearchRequestSort {
	RelevanceAsc = 'relevance',
	RelevanceDesc = '-relevance',

	PopularityAsc = 'popularity',
	PopularityDesc = '-popularity',

	DurationAsc = 'duration',
	DurationDesc = '-duration',

	CreatedAsc = 'created',
	CreatedDesc = '-created',

	DownloadsAsc = 'downloads',
	DownloadsDesc = '-downloads'

}


/**
 * @see https://m.audiocommons.org/docs/api_endpoints.html#get--search-text-
 */
export interface ITextSearchRequest {
	access_token: string;
	client_id: string;
	q: string;
	size: number;
	page: number;
	include: string;
	fields: string;
	f?: string;
	s?: string;
}

export interface ITextSearchResponseMeta {
	response_id: string;
	status: 'PR' | 'FI';
	n_expected_responses: number;
	n_received_responses: number;
	sent_timestamp: string;
	collect_url: string;
	current_timestamp: string;
}

/**
 * The response returned by the text search API endpoint.
 * @see https://m.audiocommons.org/docs/api_endpoints.html#get--search-text-
 */
export interface ITextSearchResponse {
	meta: ITextSearchResponseMeta;
	contents: {};
	warnings: {};
	errors: {};
}
