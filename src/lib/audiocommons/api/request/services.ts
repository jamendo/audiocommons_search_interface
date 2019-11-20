import { TextSearchRequestField, TextSearchRequestSort } from 'lib/audiocommons/api/request/textSearch';

export interface IServiceRequest {
	access_token: string;
	client_id: string;
}

export interface IServiceDescription {
	download?: {
		acid_domains: string[];
	};
	licensing?: {
		acid_domains: string[];
	};
	text_search: {
		supported_fields: TextSearchRequestField[];
		supported_filters: TextSearchRequestField[];
		supported_sort_options: TextSearchRequestSort[];
	};
}

export interface IServiceResponse {
	count: number;
	services: {
		[serviceName: string]: {
			id: string;
			url: string;
			components: string[];
			description: {
				download?: {
					acid_domains: string[];
				};
				licensing?: {
					acid_domains: string[];
				}
				text_search: {
					supported_fields: TextSearchRequestField[];
					supported_filters: TextSearchRequestField[];
					supported_sort_options: TextSearchRequestSort[];
				};
			};
		};
	};
}
