import { SearchFormFieldIdentifiers } from 'app/app.types';

//
// api.types.ts
// Type declarations for data exchanged via the apps API routes.
//

export type ISearchRequestParams = {
	[key in SearchFormFieldIdentifiers]: string | boolean | number | Array<string | boolean | number>;
};

export interface ICollectRequestParams {
	responseId: string;
}

export interface ILicensingRequestParams {
	acids: string[];
	include?: string[];
}

export interface ILicensingResponse {
	[acid: string]: string /* ← licensing URL */;
}
