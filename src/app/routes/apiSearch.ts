import { Route } from 'lib/server/Route';
import { Request, Response } from 'express';
import { ROUTES } from 'app/routes.config';
import { ISearchRequestParams } from 'app/api.types';
import { getAudioCommonsApiClient } from 'app/apiClient';
import { SearchFormFieldIdentifiers } from '../app.types';
import { TextSearchRequestField, TextSearchRequestSort } from 'lib/audiocommons/api/request/textSearch';
import { License, LicenseCondition } from 'lib/audiocommons/ccLicensing';

@Route.url(ROUTES.api.search)
export class ApiSearch extends Route {
	@Route.acceptParams<ISearchRequestParams>()
	protected async get(request: Request, response: Response) {
		const params = <ISearchRequestParams>request.query;

		let search : any = null;
		search = getAudioCommonsApiClient().prepareTextSearch()
			.withTextQuery(<string>params[SearchFormFieldIdentifiers.TextQuery])
			.withFields(TextSearchRequestField.All)
			.itemsPerPage(30)
			.setPage(<number>params.Page || 1)
			.sort(
				<TextSearchRequestSort>params[SearchFormFieldIdentifiers.ResultSorting] || TextSearchRequestSort.PopularityDesc
			);


		if (SearchFormFieldIdentifiers.LicenseType in params) {
			const licenseTypes: License[] = (
				Array.isArray(params.LicenseType)
					? <License[]>params.LicenseType
					: [<License>params.LicenseType]
			);

			// if there's 7 licenses, it means all licenses are accepted
			if (licenseTypes.length < 7) {
				licenseTypes.forEach(license => search.addLicenses(parseInt(<any>license, 10)));
			}
		}

		if (params.Provider) {
			search.addProvider(<string>params.Provider);
		} else if (params.MusicType) {
			// If the client did not specifically request a provider, we check if we can narrow down
			// the provider ourselves depending on the requested music type.
			const musicTypes = <Array<'song' | 'sample'>>params.MusicType;

			// Currently, freesound is the only provider that supports samples:
			if (
				!musicTypes.includes('song') &&
				musicTypes.includes('sample')
			) {
				search.addProvider('Freesound');
			}
		}

		if (
			Array.isArray(params.CreationDate) &&
			(<string[]>params.CreationDate).length === 2 &&
			(<string[]>params.CreationDate)[0] &&
			(<string[]>params.CreationDate)[1]
		) {
			search.addFilter({
				field: TextSearchRequestField.AC_Timestamp,
				value: (<string[]>params.CreationDate)
			});
		}

		const tagTypes: SearchFormFieldIdentifiers[] = [
			SearchFormFieldIdentifiers.Genres,
			SearchFormFieldIdentifiers.Moods,
			SearchFormFieldIdentifiers.Themes,
			SearchFormFieldIdentifiers.Instruments
		];

		const tags: string[] = [];

		for (const tagType of tagTypes) {
			const value = <string[]>params[tagType];
			if (value && value.length) {
				tags.push(...value);
			}
		}
		if (tags && tags.length) {
			search.addFilter({
				field: TextSearchRequestField.AC_Tag,
				value: tags
			});
		}

		let numChannels: number | undefined;
		switch ((<string>params.Channels || '').toLowerCase()) {
			default:
				numChannels = undefined;
				break;
			case 'mono':
				numChannels = 1;
				break;
			case 'stereo':
				numChannels = 2;
				break;
		}
		if (numChannels && numChannels > 0) {
			search.addFilter({
				field: TextSearchRequestField.AC_Channels,
				value: numChannels
			});
		}

		const rangeFilters: Array<{
			nameInRequest: SearchFormFieldIdentifiers;
			acFieldName: TextSearchRequestField;
			transform?: (range: [number, number]) => [number, number];
		}> = [{
			nameInRequest: SearchFormFieldIdentifiers.Duration,
			acFieldName: TextSearchRequestField.AC_Duration
		}, {
			nameInRequest: SearchFormFieldIdentifiers.Samplerate,
			acFieldName: TextSearchRequestField.AC_Samplerate
		}, {
			nameInRequest: SearchFormFieldIdentifiers.Bitrate,
			acFieldName: TextSearchRequestField.AC_Bitrate
		}, {
			nameInRequest: SearchFormFieldIdentifiers.Bitdepth,
			acFieldName: TextSearchRequestField.AC_Bitdepth
		}, {
			nameInRequest: SearchFormFieldIdentifiers.FileSize,
			acFieldName: TextSearchRequestField.AC_Filesize,
			// transform form megabyte to bytes
			transform: ([low, high]) => <[number, number]>[low, high].map(num => num * 1024 * 1024)
		}];


		for (const { nameInRequest, acFieldName, transform } of rangeFilters) {
			const range = <[number, number]>params[nameInRequest];
			if (!range) {
				continue;
			}

			search.addFilter({
				field: acFieldName,
				value: transform ? transform(range) : range
			});
		}

		const { responseId } = await getAudioCommonsApiClient().startTextSearch(search);
		response.json({ responseId });
	}
}
