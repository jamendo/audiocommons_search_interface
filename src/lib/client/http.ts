export type IGetParams = object;

export interface IGetOptions<TReq extends IGetParams = IGetParams> {
	readonly url: string;
	readonly params?: TReq;
	readonly headers?: { readonly [name: string]: string; };
}

/**
 * Runs a simple HTTP GET request.
 * The returned promise is resolved once the request has completed.
 */
export function get<TReq extends IGetParams>(options: IGetOptions<TReq>): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		$.get(options.url, options.params || {}, resolve).fail(reject);
	});
}

/**
 * Runs an HTTP GET request and returns the response parsed as JSON.
 */
export async function getJson<TReq extends IGetParams, TRes extends object | any[]>(
	options: IGetOptions<TReq>
): Promise<TRes> {
	const rawJson = await get(options);
	if (typeof rawJson === 'object') {
		return <any>rawJson;
	}
	return JSON.parse(rawJson);
}
