import { Page } from 'lib/client/Page';
import { Component } from 'lib/client/Component';
import { IFormComponent } from 'app/client/components/form/IFormComponent';
import { IPageSharedData, SearchFormFieldIdentifiers } from 'app/app.types';
import { ISearchRequestParams } from '../../api.types';
import { License, LicenseCondition } from 'lib/audiocommons/ccLicensing';
import { LicenseConditionList } from '../components/licenseConditionList';
import { debounce } from 'lib/utils/debounce';
import { SearchField } from '../components/form/searchField';
import { flattenArray, deduplicateArray } from 'lib/utils/array';

export default class SearchPage<T extends IPageSharedData<any> = IPageSharedData> extends Page<T> {
	public init(): void {
		super.init();

		this.query('.ac-search-form-submit-button').on('click', this.submitForm.bind(this));

		this.initLicenseComponentAutoUpdate();
		this.initAutoSubmitOnSearchFieldReturnKeyPressed();
	}

	protected initLicenseComponentAutoUpdate(): void {
		this.getFormComponents().forEach(component => {
			component.on('change', () => this.updateLicenseConditionListComponents());
		});
		this.updateLicenseConditionListComponents();
	}

	protected initAutoSubmitOnSearchFieldReturnKeyPressed(): void {
		Component
			.queryComponentsIn(this.element)
			.filter((component): component is SearchField => component instanceof SearchField)
			.forEach(searchField => {
				searchField.on('returnKeyPressed', () => this.submitForm());
			});
	}

	private findLicensesForParams(params: ISearchRequestParams): License[] {
		const search = License.beginSearch().addAllLicenses();

		// If `FreeCommercialUse` is checked, only include the licenses that don't
		// have the "NC" (Non Commercial) flag.
		if (params.FreeCommercialUse === true || params.FreeCommercialUse === 'true') {
			search.excludeConditions(LicenseCondition.NC);
		}

		switch (params.FreeCommercialUse) {
			default:
			case 'disallowed':
				// do nothing in the default case
				break;

			case 'allowed':
				search.excludeConditions(LicenseCondition.NC);
				break;
		}

		switch (params.ModificationsAllowed) {
			default:
			case 'disallowed':
				// do nothing in the default case
				search/*.addConditions(LicenseCondition.ND)*/.excludeConditions(LicenseCondition.SA);
				break;

			case 'allowed-when-share-alike':
				search.excludeConditions(LicenseCondition.ND)/*.addConditions(LicenseCondition.SA)*/;
				break;

			case 'allowed':
				search.excludeConditions(LicenseCondition.ND).excludeConditions(LicenseCondition.SA);
				break;
		}

		const licenses = search.licenses;

		if (SearchFormFieldIdentifiers.LicenseType in params) {
			// remove everything
			while (licenses.length > 0) {
				licenses.pop();
			}

			if (params.LicenseType != null ) {
				const licenseTypes: License[] = (
					Array.isArray(params.LicenseType)
						? <License[]>params.LicenseType
						: [<License>params.LicenseType]
				);
				
				// put juste the correct license
				licenseTypes.forEach(license => licenses.push(parseInt(<any>license, 10)));
			}
		} else if (licenses.length === 0) {
			licenses.push(...License.getAllLicenses());
		}

		return licenses;
	}

	private collectRawFormData(): ISearchRequestParams {
		const values = this.getFormComponents().map(component => ({
			id: <SearchFormFieldIdentifiers>component.formFieldId,
			value: component.getValue()
		}));
		const params = <ISearchRequestParams>{};

		values.forEach(({ id, value }) => {
			params[id] = value;
		});

		return params;
	}

	protected collectFinalizedFormData(): ISearchRequestParams {
		const params = this.collectRawFormData();
		const licenses = this.findLicensesForParams(params);

		params.LicenseType = licenses;
		delete params.FreeCommercialUse;
		delete params.ModificationsAllowed;

		return params;
	}

	protected submitForm() {
		const payload = JSON.stringify(this.collectFinalizedFormData());
		const form = $(
			`<form method="POST" action="/search" enctype="text/plain">
				<input type="hidden" name="payload" />
			</form>`
		);
		form.find('input').attr('value', payload);
		form.appendTo(document.body);
		form.submit();
	}

	protected getFormComponents(): IFormComponent[] {
		return Component
			.queryComponentsIn<IFormComponent>(this.element)
			.filter(component => IFormComponent.isImplementedBy(component));
	}

	@debounce(10, 'trailing')
	private updateLicenseConditionListComponents(): void {
		const licenses = this.findLicensesForParams(this.collectRawFormData());
		const licenseConditions = deduplicateArray(flattenArray(
			licenses.map(License.getConditions)
		));

		Component.queryComponentsIn(this.element)
			.filter<LicenseConditionList>((component): component is LicenseConditionList => (
				component instanceof LicenseConditionList
			))
			.forEach(licenseConditionList => {
				licenseConditionList.hideAllLicenseConditions();
				licenseConditionList.showLicenseConditions(...licenseConditions);
			});
	}
}
