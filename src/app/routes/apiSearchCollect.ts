import { Route } from 'lib/server/Route';
import { Request, Response } from 'express';
import { ROUTES } from 'app/routes.config';
import { ICollectRequestParams } from 'app/api.types';
import { getAudioCommonsApiClient } from 'app/apiClient';

@Route.url(ROUTES.api.searchCollect)
export class ApiSearchCollect extends Route {
	@Route.acceptParams<ICollectRequestParams>()
	protected async get(request: Request, response: Response) {
		const params = <ICollectRequestParams>request.query;

		const collected = await getAudioCommonsApiClient().collectPartialTextSearchResult(params.responseId);
		response.json(collected);
	}
}
