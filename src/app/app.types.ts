import { translate } from 'lib/i18n/translate';
import { IServiceResponse } from 'lib/audiocommons/api/request/services';
import { License } from 'lib/audiocommons/ccLicensing';

// README:
// Do not make this enum `const`, because we might need to map using
// the enum literals at runtime.
export enum SearchFormFieldIdentifiers {
	TextQuery = 'TextQuery',
	FreeCommercialUse = 'FreeCommercialUse',
	ModificationsAllowed = 'ModificationsAllowed',
	MusicType = 'MusicType',
	VocalOrInstrumental = 'VocalOrInstrumental',
	ResultSorting = 'ResultSorting',
	Page = 'Page',
	Genres = 'Genres',
	Moods = 'Moods',
	Themes = 'Themes',
	Instruments = 'Instruments',
	LicenseType = 'LicenseType',
	Channels = 'Channels',
	Duration = 'Duration',
	Samplerate = 'Samplerate',
	Bitrate = 'Bitrate',
	Bitdepth = 'Bitdepth',
	FileSize = 'FileSize',
	Provider = 'Provider',
	CreationDate = 'CreationDate'
}

export interface IPageSharedData<TPayload extends {} | void = undefined> {
	payload: TPayload;
	api: {
		services: IServiceResponse;
	};
}

export interface IPageRenderingData<TPayload extends {} | void = any> {
	translate: typeof translate;
	imports: {
		pageScript: string;
	};
	symbols?: {
		SearchFormFieldIdentifiers: typeof SearchFormFieldIdentifiers;
		License: typeof License;
	};
	data?: {
		genres: ReadonlyArray<Readonly<{ name: string; }>>;
		moods: ReadonlyArray<Readonly<{ name: string; }>>;
		themes: ReadonlyArray<Readonly<{ name: string; }>>;
		instruments: ReadonlyArray<Readonly<{ name: string; }>>;
	};
	sharedData: IPageSharedData<TPayload>;
}
