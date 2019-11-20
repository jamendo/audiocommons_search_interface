/**
 * Describes an API token as used by the AudioCommons API [[Client]].
 */
export interface IApiToken {
	/**
	 * The actual token.
	 */
	accessToken: string;
	/**
	 * The time after which this token expires, in milliseconds.
	 */
	expiresAfter: number;
	/**
	 * The time at which the token was requested, as a JS timestamp (`Date.now()`).
	 */
	requestedAt: number;
}
