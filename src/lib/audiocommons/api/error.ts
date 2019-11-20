// tslint:disable:variable-name

export abstract class AudioCommonsApiClientError extends Error {
	/** @internal */
	protected abstract readonly BRAND: string;

	/**
	 * @override
	 * @readonly
	 */
	public get name() {
		return this.BRAND;
	}

	public static is<T extends AudioCommonsApiClientError>(
		error: T,
		errorType: { new(): T; BRAND: string; }
	): error is T {
		return !!error.BRAND && error.BRAND === errorType.BRAND;
	}

	/**
	 * Extend class `AudioCommonsApiClientError` on the fly.
	 * @param name The name of the concrete error class created.
	 * @param baseMessage The default error message.
	 * @example
	 *     const CustomError = AudioCommonsApiClientError.extend('CustomError', 'this is the default message');
	 *     throw new CustomError(); // throws an error with "this is the default message"
	 *     throw new CustomError('customized message'); // throws an error with "customized message"
	 */
	public static extend<TName extends string>(name: TName, baseMessage = '') {
		return class extends AudioCommonsApiClientError {
			/** @internal */
			public static readonly BRAND: TName = name;
			protected readonly BRAND: TName = name;

			public constructor(message: string = baseMessage) {
				super(baseMessage + (message ? ' ' + message : ''));
			 }
		};
	}
}


export const AudioCommonsApiClientApiTokenRefreshFailedError = AudioCommonsApiClientError.extend(
	'ApiTokenRefreshFailedError',
	'Failed to refresh the API token'
);

export const AudioCommonsApiClientRequestUnsuccessful = AudioCommonsApiClientError.extend(
	'RequestUnsuccessful',
	'Request returned a non-success code'
);

