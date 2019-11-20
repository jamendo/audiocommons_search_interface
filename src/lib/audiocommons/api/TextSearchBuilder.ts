import { Builder } from 'lib/utils/Builder';
import { TextSearchRequestField, TextSearchRequestSort, ITextSearchRequest } from './request/textSearch';
import { Omit } from '../../utils/types';
import { IServiceDescription } from './request/services';
import { intersect } from '../../utils/intersect';
import { License } from '../ccLicensing';


type IFieldValue = string | number;

export interface ITextSearchFilter {
	field: TextSearchRequestField;
	value: IFieldValue | [IFieldValue, IFieldValue] | IFieldValue[];
}


export class TextSearchBuilder extends Builder {
	public finalize(...services: IServiceDescription[]): Omit<ITextSearchRequest, 'client_id' | 'access_token'> {
		const serviceDescription = this.createServiceDescriptionIntersection(...services);

		let filters: string[] = [];

		if (this.filters.length > 0) {
			const supportedFilters = this.filters.filter(({ field }) => {
				return serviceDescription.text_search.supported_filters.includes(field);
			});
			filters.push(TextSearchBuilder.stringifyFilters(supportedFilters, 'AND'));
		}

		// If all licenses were added to the search, there's no need to send all of them to the
		// API. Instead, we just leave them out because the API will include them anyway.
		if (this.licenses.length > 0 && this.licenses.length < License.getAllLicenses().length) {
			// TODO remove this when the api give the possibility to search multiple license
			let maxIndexValue: number = 0;
			this.licenses.forEach((value, index) => {
				if (this.licenses[index] > this.licenses[maxIndexValue]) {
					maxIndexValue = index;
				}
			});
			
			let test: ITextSearchFilter[] = [{
				field: TextSearchRequestField.AC_License,
				value: License.stringify(this.licenses[maxIndexValue])
			}];

			filters.push(TextSearchBuilder.stringifyFilters(
				test,
				'AND'
			));

			/*filters.push(TextSearchBuilder.stringifyFilters(
				this.licenses.map<ITextSearchFilter>(license => ({
					field: TextSearchRequestField.AC_License,
					value: License.stringify(license)
				})),
				'OR'
			));*/
			//------------------------------------------------------------------------------
			
			
		}

		filters = filters.filter(str => str && str.trim().length > 0);

		const filterString = (
			filters.length > 0
				? filters
					.map(part => filters.length > 1 ? `(${part})` : part)
					.join(' AND ')
				: undefined
		);

		const params = {
			q: this.textQuery!,
			fields: this.fields
				.filter(field => serviceDescription.text_search.supported_fields.includes(field))
				.join(','),
			s: (
				serviceDescription.text_search.supported_sort_options.includes(this.sorting!)
					? this.sorting!
					: undefined
			),
			include: this.providers.length > 0 ? this.providers.join(',') : <any>undefined,
			page: <any>this.page || undefined,
			size: <any>this.pageSize || undefined,
			f: filterString && filterString.trim().length ? filterString.trim() : undefined
		};

		return params;
	}

	private createServiceDescriptionIntersection(...services: IServiceDescription[]): IServiceDescription {
		const intersection: IServiceDescription = {
			text_search: {
				supported_fields: intersect(...services.map(service => service.text_search.supported_fields)),
				supported_filters: intersect(...services.map(service => service.text_search.supported_filters)),
				supported_sort_options: intersect(...services.map(service => service.text_search.supported_sort_options))
			}
		};

		return intersection;
	}


	private textQuery?: string;

	@Builder.builderMethod({ maxCalls: 1 })
	public withTextQuery(query: string) {
		this.textQuery = query;
		return this;
	}


	private fields: TextSearchRequestField[] = [];

	@Builder.builderMethod({ maxCalls: 1 })
	public withFields(fields: TextSearchRequestField[]) {
		this.fields.push(...fields);
		return this;
	}


	private page?: number;

	@Builder.builderMethod({ maxCalls: 1 })
	public setPage(page: number) {
		this.page = page;
		return this;
	}


	private pageSize?: number;

	@Builder.builderMethod({ maxCalls: 1 })
	public itemsPerPage(pageSize: number) {
		this.pageSize = pageSize;
		return this;
	}


	private providers: string[] = [];

	public getProviders(): string[] {
		return (<string[]>[]).concat(this.providers);
	}


	@Builder.builderMethod({ maxCalls: Infinity })
	public addProvider(provider: string) {
		this.providers.push(provider);
		return this;
	}


	private sorting?: TextSearchRequestSort;

	@Builder.builderMethod({ maxCalls: 1 })
	public sort(sorting: TextSearchRequestSort) {
		this.sorting = sorting;
		return this;
	}


	private readonly filters: ITextSearchFilter[] = [];

	@Builder.builderMethod({ maxCalls: Infinity })
	public addFilter(filter: ITextSearchFilter) {
		this.filters.push(filter);
		return this;
	}


	private readonly licenses: License[] = [];

	@Builder.builderMethod({ maxCalls: Infinity })
	public addLicenses(...licenses: License[]) {
		this.licenses.push(...licenses);
		return this;
	}


	private static readonly rangeFilterFields: ReadonlyArray<TextSearchRequestField> = [
		TextSearchRequestField.AC_Duration,
		TextSearchRequestField.AC_Samplerate,
		TextSearchRequestField.AC_Bitrate,
		TextSearchRequestField.AC_Bitdepth,
		TextSearchRequestField.AC_Filesize,
		TextSearchRequestField.AC_Timestamp
	];


	private static stringifyFilters(filters: ITextSearchFilter[], operator: 'AND' | 'OR'): string {
		return filters
			.map(({ field, value }) => {
				if (Array.isArray(value)) {
					if (TextSearchBuilder.rangeFilterFields.includes(field)) {
						return `${field}:[${value[0]},${value[1]}]`;
					} else {
						return value.map(actualValue => `${field}:${actualValue}`).join(' AND ');
					}
				} else {
					return `${field}:${value}`;
				}
			})
			.join(' ' + operator + ' ');
	}
}
