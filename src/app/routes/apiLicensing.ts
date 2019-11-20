import { Route } from 'lib/server/Route';
import { Request, Response } from 'express';
import { ROUTES } from 'app/routes.config';
import { ILicensingRequestParams, ILicensingResponse } from 'app/api.types';
import { getAudioCommonsApiClient } from 'app/apiClient';
import { LruRamCache } from 'lib/cache/LruRamCache';

@Route.url(ROUTES.api.licensing)
export class ApiLicensing extends Route {
	/**
	 * Caches licensing URLs by ACID.
	 * ACIDs are keys, licensing URLs are values.
	 */
	private readonly acidCache = new LruRamCache<string, string>(1e2, false);

	@Route.acceptParams<ILicensingRequestParams>()
	protected async get(request: Request, response: Response) {
		const { acids, include } = <ILicensingRequestParams>request.query;
		const results: ILicensingResponse = { };
		const promises: Array<Promise<void>> = [];

		for (const acid of acids) {
			promises.push(new Promise<void>(async resolve => {
				const { responseId } = await getAudioCommonsApiClient().startLicensingSearch(acid, ...(include || []));
				
				if (this.acidCache.has(acid)) {
					results[acid] = this.acidCache.get(acid)!;
					return resolve();
				}

				let attemptsLeft = 3;

				// try to access the response, if not just continue to the next acid
				do {
					const collected = await getAudioCommonsApiClient().collectPartialLicensingSearchResult(responseId);

					try {
						const providerName = Object.keys(collected.contents)[0];
						const licensingUrl = collected.contents[providerName].license_url;
						results[acid] = licensingUrl;
						this.acidCache.set(acid, licensingUrl);
					} catch {
						await new Promise<void>(next => setTimeout(next, 50));
						continue;
					}

					resolve();
				} while (--attemptsLeft > 0);
			}));
		}

		await Promise.all(promises);

		response.json(results);
	}
}
