import { Route } from 'lib/server/Route';
import { Request, Response } from 'express';
import { ROUTES } from 'app/routes.config';
import { translate } from 'lib/i18n/translate';
import { getAudioCommonsApiClient } from 'app/apiClient';
import { IPageRenderingData, SearchFormFieldIdentifiers } from 'app/app.types';
import GENRES from 'app/data/genres';
import INSTRUMENTS from 'app/data/instruments';
import MOODS from 'app/data/moods';
import THEMES from 'app/data/themes';
import { License } from 'lib/audiocommons/ccLicensing';

@Route.url(ROUTES.search)
export class Search extends Route {
	protected async get(request: Request, response: Response) {
		response.render('pages/search', <IPageRenderingData>{
			translate,
			imports: {
				pageScript: 'search'
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
				api: {
					services: await getAudioCommonsApiClient().getServiceInfo()
				}
			}
		});
	}
}
