import { IHttpClient } from 'lib/audiocommons/api/IHttpClient';
import { Endpoint } from './Endpoint';

/**
 * Dependency injection container for the Audiocommons API client implementation.
 * @see [[Client]]
 */
export interface IClientDependencies {
	/**
	 * The protocol to be used when sending API requests.
	 */
	protocol: 'http' | 'https';

	/**
	 * The hostname to send requests to.
	 */
	host: string;

	/**
	 * The port to send requests to.
	 */
	port: number;

	/**
	 * The client ID to use in requests against the API.
	 */
	clientId: string;

	/**
	 * The username of the API user.
	 */
	username: string;

	/**
	 * The password of the API user.
	 */
	password: string;

	/**
	 * The max age of cached info about available AudioCommons services, in milliseconds.
	 * Ideally set to a few minutes.
	 */
	serviceInfoCacheTTL: number;

	/**
	 * Paths to the specific API endpoints.
	 */
	paths: {
		[key in Endpoint]: string;
	};

	/**
	 * The object used by the client to send all HTTP requests.
	 */
	httpClient: IHttpClient;
}
