import SearchPage from 'app/client/pages/search';
import { IPageSharedData, SearchFormFieldIdentifiers } from 'app/app.types';
import { getJson } from 'lib/client/http';
import { ROUTES } from 'app/routes.config';
import { ICollectRequestParams, ISearchRequestParams } from 'app/api.types';
import { PaginationContainer } from 'app/client/views/pagination/PaginationContainer';
import { PaginationPage } from 'app/client/views/pagination/PaginationPage';
import { ResultsPaginationPage } from 'app/client/pages/results/ResultsPagingPage';
import { EmptyResultsPaginationPage } from 'app/client/pages/results/EmptyResultsPagingPage';
import {
	ITextSearchCollectResponse,
	ICollectResponseError,
	ICollectResponseWarning,
	ICollectResponseErrors,
	ICollectResponseWarnings
} from 'lib/audiocommons/api/request/collect';
import { Component } from 'lib/client/Component';
import { SegmentedButton } from '../components/form/segmentedButton';
import { IFormComponent } from '../components/form/IFormComponent';
import { TextSearchRequestSort, TextSearchRequestField } from 'lib/audiocommons/api/request/textSearch';
import { debounce } from 'lib/utils/debounce';
import { IComponentWithInfoButton } from '../components/IComponentWithInfoButton';
import { translate } from '../../../lib/i18n/translate';
import { list } from 'lib/i18n/grammar';

// We extend the search page so we can use it's search form handler:
export default class ResultsPage extends SearchPage<IPageSharedData<{ search: ISearchRequestParams; }>> {
	public init() {
		super.init();

		this.initChangeListeners();
		this.updateFormControlInfoButtons();

		this.prefillFormFields();
		this.renderProvider(this.providerSelect.getValue(), true);
	}

	// We don't want some of the auto update and auto submit mechanisms to be initialized
	// on this page, so we simply override their init methods as noops.
	protected initLicenseComponentAutoUpdate(): void { return; }
	protected initAutoSubmitOnSearchFieldReturnKeyPressed(): void { return; }

	private paginationContainer?: PaginationContainer;

	private get $searchPanel(): JQuery {
		return $('.search-panel');
	}

	private get $resultsPanel(): JQuery {
		return $('.results-panel');
	}

	private get $warningsList(): JQuery {
		return this.query('.result-warning-container');
	}

	private get $resultsPagingContainerWrapper(): JQuery {
		return $('.result-paging-wrapper');
	}

	private prefillFormFields(): void {
		for (const formFieldId in this.sharedData.payload.search) {
			const element = this.query(`[data-ac-attr-formfieldid="${formFieldId}"]`)[0];
			if (!element) {
				continue;
			}

			const component = Component.getByElement<IFormComponent>(element);
			if (!component) {
				continue;
			}

			const value = this.sharedData.payload.search[<SearchFormFieldIdentifiers>formFieldId];
			if (formFieldId === 'LicenseType' && value instanceof Array) {
				component.setValue(value[value.length - 1], true);
			} else {
				component.setValue(value, true);
			}
		}
	}

	private initChangeListeners(): void {
		Component.queryComponentsIn(this.element)
			.filter<IFormComponent>((component): component is IFormComponent => {
				return IFormComponent.isImplementedBy(component);
			})
			.forEach(component => component.on('change', () => {
				let providerName = this.providerSelect.getValue();

				if (
					component.formFieldId === SearchFormFieldIdentifiers.MusicType &&
					component.getValue().length === 1 &&
					component.getValue()[0] === 'sample'
				) {
					providerName = 'Freesound';
					this.providerSelect.setValue(providerName, true);
				}

				this.renderProvider(providerName, false);
			}));
	}

	/**
	 * Translates the form field identifiers used in the front end to the corresponding field
	 * names as used in the AC Mediator.
	 */
	private static readonly formFieldIdentifierToRequestField = new Map<
		SearchFormFieldIdentifiers,
		TextSearchRequestField
	>([
		[SearchFormFieldIdentifiers.MusicType, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.VocalOrInstrumental, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.Genres, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.Moods, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.Themes, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.Instruments, TextSearchRequestField.AC_Tag],
		[SearchFormFieldIdentifiers.LicenseType, TextSearchRequestField.AC_License],
		[SearchFormFieldIdentifiers.Channels, TextSearchRequestField.AC_Channels],
		[SearchFormFieldIdentifiers.Duration, TextSearchRequestField.AC_Duration],
		[SearchFormFieldIdentifiers.Samplerate, TextSearchRequestField.AC_Samplerate],
		[SearchFormFieldIdentifiers.Bitrate, TextSearchRequestField.AC_Bitrate],
		[SearchFormFieldIdentifiers.Bitdepth, TextSearchRequestField.AC_Bitdepth],
		[SearchFormFieldIdentifiers.FileSize, TextSearchRequestField.AC_Filesize],
		[SearchFormFieldIdentifiers.CreationDate, TextSearchRequestField.AC_Timestamp]
	]);

	/**
	 * Updates info buttons next to the filter and sorting form controls.
	 * These info buttons show warnings when a feature is not supported by a specific provider.
	 * @param providerName The name of the provider for which to render info buttons on the form
	 *                     components. Optional, default value is the currently selected provider.
	 */
	private updateFormControlInfoButtons(providerName = this.providerSelect.getValue()): void {
		Component.queryComponentsIn(this.element)
			// find all form components that have an info button
			.filter<IFormComponent & IComponentWithInfoButton>(
				(component): component is IFormComponent & IComponentWithInfoButton => {
					return (
						IFormComponent.isImplementedBy(component) &&
						IComponentWithInfoButton.isImplementedBy(component)
					);
				}
			)
			// update each component's info button
			.forEach(component => {
				// clear & hide the info button in case we don't have to show it
				component.setInfoButtonText('');
				component.setInfoButtonVisibility('hidden');

				const field = ResultsPage.formFieldIdentifierToRequestField.get(
					<SearchFormFieldIdentifiers>component.formFieldId
				);

				const supportingProviderNames = (
					Object.keys(this.sharedData.api.services.services)
						.filter(providerName => {
							const service = this.sharedData.api.services.services[providerName];
							return (
								service &&
								service.description.text_search.supported_filters.indexOf(field!) !== -1
							);
						})
				);

				// if the provider supports this field, we don't show the info button
				if ((<SearchFormFieldIdentifiers>component.formFieldId !== 'MusicType' && (!field || supportingProviderNames.indexOf(providerName) !== -1))
					// add exception for MusicType. Currently, freesound is the only provider that supports samples
					|| (<SearchFormFieldIdentifiers>component.formFieldId === 'MusicType' && providerName === 'Freesound')) {
					return;
				}

				let providerText = '';
				if (supportingProviderNames.length > 0) {
					providerText = [
						' ',
						translate('pages.results.filterSupportedBy'),
						' ',
						list(...supportingProviderNames),
						'.'
					].join('');
				}

				component.setInfoButtonVisibility('visible');
				component.setInfoButtonText([
					translate('pages.results.filterNotSupportedByProviderText'),
					' ',
					providerName,
					'.',
					providerText
				].join(''));
			});
	}

	private get $providerSelect(): JQuery {
		return this.query('[data-ac-attr-formfieldid="results-panel-provider-select"]');
	}

	private get providerSelect() {
		return Component.getByElement<SegmentedButton<string>>(this.$providerSelect[0]);
	}

	private get $sortSelect(): JQuery {
		return this.query(`[data-ac-attr-formfieldid="${SearchFormFieldIdentifiers.ResultSorting}"]`);
	}

	private get sortSelect() {
		return Component.getByElement<SegmentedButton<TextSearchRequestSort>>(this.$sortSelect[0]);
	}

	private loadersShown = 0;

	private showLoader(): void {
		this.loadersShown += 1;
		this.$resultsPanel.attr('data-ac-style', 'loading');
	}

	private hideLoader(): void {
		this.loadersShown -= 1;
		if (this.loadersShown > 0) {
			return;
		}

		this.$resultsPanel.removeAttr('data-ac-style');
	}

	@debounce(300, 'trailing')
	private async renderProvider(providerName: string, allowProviderFallback: boolean) {
		this.showLoader();

		if (this.paginationContainer) {
			this.paginationContainer.dispose();
		}

		this.providerSelect.setValue(providerName, true);

		this.paginationContainer = new PaginationContainer();
		this.paginationContainer.on(
			'requestPage',
			pageIndex => this.goToProviderPage(this.providerSelect.getValue(), pageIndex + 1, false)
		);

		await this.goToProviderPage(providerName, 1, allowProviderFallback);

		this.$resultsPagingContainerWrapper.html('');
		this.paginationContainer.renderInto(this.$resultsPagingContainerWrapper);

		this.updateFormControlInfoButtons();

		this.hideLoader();
	}

	/**
	 * Renders warnings related to non-functional features, depending on the provider.
	 */
	private renderWarnings({ provider, errorList, warningList }: {
		provider?: string;
		errorList: ICollectResponseErrors | undefined;
		warningList: ICollectResponseWarnings | undefined;
	}): void {
		this.$warningsList.html('');

		const itemsToRender: string[] = [];

		for (const list of [errorList, warningList]) {
			const providerNames = (
				provider
					? [provider]
					: Object.keys(list || {})
			);

			if (providerNames.length === 0) {
				continue;
			}

			for (const providerName of providerNames) {
				if (list!['codeError']) {
					itemsToRender.push('Error ' + list!['codeError']);
				} else {
					if (!list![providerName]) {
						continue;
					}

					const errorArray: Array<ICollectResponseError | ICollectResponseWarning> = (
						Array.isArray(list![providerName])
							? <ICollectResponseError[]>list![providerName]
							: <ICollectResponseError[]>[list![providerName]]
					);

					errorArray.map(item => {
						let text: string;

						if (typeof item === 'string') {
							text = item;
						} else if (typeof item === 'object' && item) {
							text = item.detail;
						} else {
							text = '';
						}

						text = text || '';
						text = text.trim();

						if (text.length === 0) {
							return;
						}

						const maybeTranslatedText = translate(`pages.results.warnings.${text}`, text);
						itemsToRender.push(maybeTranslatedText);
					});
				}
			}
		}

		if (itemsToRender.length === 0) {
			this.$warningsList.addClass('empty');
			return;
		}

		this.$warningsList.removeClass('empty').append(
			itemsToRender
				// deduplicate
				.filter((item, index) => itemsToRender.indexOf(item) === index)
				// convert to HTML
				.map(item => `<li>${item}</li>`)
				// merge HTML parts
				.join('')
		);
	}

	private async goToProviderPage(
		providerName: string,
		pageIndex: number,
		allowProviderFallback: boolean
	): Promise<void> {
		this.showLoader();

		let collectedResponse = await this.collectResultsForProvider(
			await this.performSearch(providerName, pageIndex),
			providerName
		);

		// fall back to any provider if no results for the actual provider were found
		if (allowProviderFallback &&
			(
				!collectedResponse.contents ||
				!collectedResponse.contents[providerName] ||
				collectedResponse.contents[providerName].num_results === 0
			)
		) {
			collectedResponse = await this.collectResultsForAnyProvider(
				await this.performSearch(undefined, pageIndex)
			);

			const previousProviderName = providerName;
			providerName = Object.keys(collectedResponse.contents || {})[0];

			if (providerName && providerName !== previousProviderName) {
				this.providerSelect.setValue(providerName, true);

				// We need to send a second request here, specifically for the new provider.
				// This is necessary to guarantee that the backend sends us all result fields.
				collectedResponse = await this.collectResultsForAnyProvider(
					await this.performSearch(providerName, pageIndex)
				);
			}
		}

		this.renderWarnings({
			provider: providerName,
			errorList: collectedResponse.errors,
			warningList: collectedResponse.warnings
		});

		let page: PaginationPage;
		let numResultsPerPage: number;
		const totalNumResults = (
			collectedResponse.contents && collectedResponse.contents[providerName]
				? collectedResponse.contents[providerName].num_results || 0
				: 0
		);

		if (totalNumResults) {
			numResultsPerPage = collectedResponse.contents[providerName].results.length;
			page = new ResultsPaginationPage(
				providerName,
				async () => collectedResponse.contents[providerName].results
			);
		} else {
			numResultsPerPage = 1;
			page = new EmptyResultsPaginationPage();
		}

		// update the result counter in the results panel header
		this.query('.results-count').text(totalNumResults);

		// update the page
		this.paginationContainer!.addPageAtPageIndex(pageIndex - 1, page);

		// update the page counter
		const pageCount = (
			totalNumResults === 0
				? 1
				: Math.ceil(totalNumResults / numResultsPerPage)
		);
		this.paginationContainer!.setTotalNumberOfPages(pageCount);

		this.hideLoader();
	}

	private async performSearch(
		providerName: string | undefined,
		pageIndex: number,
		formData: ISearchRequestParams = this.collectFinalizedFormData()
	): Promise<string> {
		const { responseId } = await getJson<ISearchRequestParams, { responseId: string; }>({
			url: `${ROUTES.api.search}`,
			params: {
				...formData,
				ResultSorting: this.sortSelect.getValue(),
				Provider: providerName!,
				Page: pageIndex
			}
		});

		return responseId;
	}

	private async collectResultsForAnyProvider(
		responseId: string,
		maxAttempts: number = 3,
		timeBetweenAttempts: number = 800
	): Promise<ITextSearchCollectResponse> {
		let response: ITextSearchCollectResponse;
		let attempts = 0;

		do {
			await new Promise<void>(resolve => setTimeout(resolve, timeBetweenAttempts));

			response = await getJson<ICollectRequestParams, ITextSearchCollectResponse>({
				url: `${ROUTES.api.searchCollect}`,
				params: { responseId }
			});

			if (response.meta.n_received_responses === response.meta.n_expected_responses) {
				break;
			}
		} while (
			(!response.contents || Object.keys(response.contents).length === 0) &&
			++attempts < maxAttempts
		);

		if (!response.contents || Object.keys(response.contents).length === 0) {
			// tslint:disable-next-line:no-console
			console.warn(`Collect results for any provider: No results found.`);
		}

		return response;
	}

	private async collectResultsForProvider(
		responseId: string,
		providerName: string,
		maxAttempts: number = 3,
		timeBetweenAttempts: number = 800
	): Promise<ITextSearchCollectResponse> {
		let response: ITextSearchCollectResponse;
		let attempts = 0;

		do {
			await new Promise<void>(resolve => setTimeout(resolve, timeBetweenAttempts));

			response = await getJson<ICollectRequestParams, ITextSearchCollectResponse>({
				url: `${ROUTES.api.searchCollect}`,
				params: { responseId }
			});

			if (
				(response.meta.n_received_responses === response.meta.n_expected_responses) ||
				(response.contents && response.contents[providerName])
			) {
				break;
			}
		} while (
			++attempts < maxAttempts
		);

		if (response.contents && !response.contents[providerName]) {
			// tslint:disable-next-line:no-console
			console.warn(`Collect results for ${providerName}: No results found.`);
		}

		return response;
	}
}
