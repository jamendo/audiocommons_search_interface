import { Route } from 'lib/server/Route';
import { Request, Response } from 'express';
import { ROUTES } from 'app/routes.config';
import { translate } from 'lib/i18n/translate';
import { getAudioCommonsApiClient } from 'app/apiClient';
import { IPageRenderingData, SearchFormFieldIdentifiers } from 'app/app.types';
import { ISearchRequestParams } from 'app/api.types';
import { License } from 'lib/audiocommons/ccLicensing';
import GENRES from 'app/data/genres';
import INSTRUMENTS from 'app/data/instruments';
import MOODS from 'app/data/moods';
import THEMES from 'app/data/themes';

@Route.url(ROUTES.results)
export class Search extends Route {
	protected async get(request: Request, response: Response) {
		await this.respond(response, undefined);
	}

	protected async post(request: Request, response: Response) {
		const requestPayload = this.decodeAndInspectRequestPayload(request);
		await this.respond(response, requestPayload);
	}

	private async respond(response: Response, requestPayload?: ISearchRequestParams) {
		response.render('pages/results', <IPageRenderingData<{
			search: ISearchRequestParams;
			requestId: string;
		}>>{
			translate,
			imports: {
				pageScript: 'results'
			},
			symbols: {
				SearchFormFieldIdentifiers,
				License
			},
			data: {
				genres: GENRES,
				instruments: INSTRUMENTS,
				moods: MOODS,
				themes: THEMES
			},
			sharedData: {
				payload: {
					search: requestPayload || {}
				},
				api: {
					services: await getAudioCommonsApiClient().getServiceInfo()
				}
			}
		});
		
	}

	private decodeAndInspectRequestPayload(request: Request): ISearchRequestParams {
		const rawJson = request.body.replace(/^payload\=/, '');
		const json = JSON.parse(rawJson);

		if (typeof json !== 'object' || Array.isArray(json) || typeof json === 'function') {
			throw new Error('Illegal request format.');
		}

		this.inspectRequestPartObjectForIllegalData(json);

		return json;
	}

	private inspectRequestPartObjectForIllegalData(obj: any | any[]): void {
		if (typeof obj !== 'object' || obj === null) {
			return;
		}
		if (Array.isArray(obj)) {
			for (const item of obj) {
				this.inspectRequestPartObjectForIllegalData(item);
			}
		} else {
			for (const key in obj) {
				if (typeof obj[key] === 'function') {
					throw new Error(`Illegal request format ("${key}").`);
				} else if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
					this.inspectRequestPartObjectForIllegalData(obj[key]);
				}
			}
		}
	}
}
