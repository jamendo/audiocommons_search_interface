import { Component } from 'lib/client/Component';
import { LicenseCondition } from 'lib/audiocommons/ccLicensing';

@Component.register('licenseConditionList')
export class LicenseConditionList extends Component {
	private readonly licenseConditionVisibility = (() => {
		const map: {
			[key: number]: boolean;
		} = {};

		LicenseCondition.getAllLicenseConditions().forEach(licenseCondition => {
			map[licenseCondition] = true;
		});

		return map;
	})();

	private get $licenseConditionContainer(): JQuery {
		return this.query('.license-conditions');
	}

	/** @override */
	public init(): void {
		super.init();

		LicenseCondition.getAllLicenseConditions().forEach(licenseCondition => {
			if (LicenseCondition[licenseCondition] !== 'NC') {
				this.$licenseConditionContainer.append(`<div class="${LicenseCondition[licenseCondition]}"></div>`);
			} else {
				this.$licenseConditionContainer.find('div.SA').before(`<div class="${LicenseCondition[licenseCondition]}"></div>`);
			}
		});

		this.updatedRenderedLicenseConditions();
	}

	public getVisibleLicenseConditions(): LicenseCondition[] {
		return LicenseCondition.getAllLicenseConditions().filter(license => this.licenseConditionVisibility[license]);
	}

	public showLicenseCondition(licenseCondition: LicenseCondition): void {
		this.showLicenseConditionInternal(licenseCondition);
		this.updatedRenderedLicenseConditions();
	}

	public showLicenseConditions(...licenseConditions: LicenseCondition[]): void {
		licenseConditions.forEach(licenseCondition => this.showLicenseConditionInternal(licenseCondition));
		this.updatedRenderedLicenseConditions();
	}

	public showAllLicenseConditions(): void {
		this.showLicenseConditions(...LicenseCondition.getAllLicenseConditions());
	}

	private showLicenseConditionInternal(licenseCondition: LicenseCondition): void {
		this.licenseConditionVisibility[licenseCondition] = true;
	}

	public hideLicenseCondition(licenseCondition: LicenseCondition): void {
		this.hideLicenseConditionInternal(licenseCondition);
		this.updatedRenderedLicenseConditions();
	}

	public hideLicenseConditions(...licenseConditions: LicenseCondition[]): void {
		licenseConditions.forEach(license => this.hideLicenseConditionInternal(license));
		this.updatedRenderedLicenseConditions();
	}

	public hideAllLicenseConditions(): void {
		this.hideLicenseConditions(...LicenseCondition.getAllLicenseConditions());
	}

	private hideLicenseConditionInternal(licenseCondition: LicenseCondition): void {
		this.licenseConditionVisibility[licenseCondition] = false;
	}

	private updatedRenderedLicenseConditions(): void {
		for (const licenseConditionValue in this.licenseConditionVisibility) {
			const licenseConditionName = LicenseCondition[licenseConditionValue];
			const element = this.$licenseConditionContainer.find(`.${licenseConditionName}`);

			if (this.licenseConditionVisibility[licenseConditionValue]) {
				element.addClass('visible');
			} else {
				element.removeClass('visible');
			}
		}
	}
}
