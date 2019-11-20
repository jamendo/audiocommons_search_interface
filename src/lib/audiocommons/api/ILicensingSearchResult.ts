/**
 * Contains information about a licensing search that has been started.
 * Used to collect licensing search results.
 */
export interface ILicensingSearchResult {
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
