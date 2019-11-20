/**
 * Contains information about a text search that has been started.
 * Used to collect text search results.
 */
export interface ITextSearchResult {
	/**
	 * The URL from which results can be collected.
	 */
	collectUrl: string;
	/**
	 * The unique ID of the response. This identifies the text search for which
	 * this result object was created.
	 */
	responseId: string;
}
