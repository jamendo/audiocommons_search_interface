export enum LicenseCondition {
	BY = 1 << 0,
	SA = 1 << 1,
	NC = 1 << 2,
	ND = 1 << 3
}
export namespace LicenseCondition {
	/**
	 * Returns all existing license conditions as an array.
	 */
	export function getAllLicenseConditions(): LicenseCondition[] {
		return [
			LicenseCondition.BY,
			LicenseCondition.SA,
			LicenseCondition.NC,
			LicenseCondition.ND
		];
	}
}


export enum License {
	CC0 = 0,
	CC_BY = LicenseCondition.BY,
	CC_BY_NC = LicenseCondition.BY | LicenseCondition.NC,
	CC_BY_ND = LicenseCondition.BY | LicenseCondition.ND,
	CC_BY_SA = LicenseCondition.BY | LicenseCondition.SA,
	CC_BY_NC_SA = LicenseCondition.BY | LicenseCondition.NC | LicenseCondition.SA,
	CC_BY_NC_ND = LicenseCondition.BY | LicenseCondition.NC | LicenseCondition.ND
}
export namespace License {
	export function stringify(license: License): string {
		return License[license].replace(/^CC_/, '').replace(/_/g, '-');
	}

	/**
	 * Returns all existing licenses as an array.
	 */
	export function getAllLicenses(): License[] {
		return Object.keys(License)
			.filter<string>((literalOrValue): literalOrValue is string => {
				return (
					typeof literalOrValue === 'string' &&
					literalOrValue.slice(0, 2) === 'CC'
				);
			})
			.map(literal => <License><any>License[<any>literal]);
	}

	export function beginSearch() {
		const licenses: License[] = [];
		const excludedConditions: LicenseCondition[] = [];

		const searcher = new class {
			public get licenses() {
				return licenses.filter(license => {
					const wasExcluded = excludedConditions.findIndex(condition => !!(license & condition));
					return wasExcluded === -1;
				});
			}

			public addAllLicenses() {
				licenses.push(...getAllLicenses());
				return this;
			}

			public excludeConditions(conditions: LicenseCondition) {
				excludedConditions.push(conditions);
				return this;
			}

			public addConditions(conditions: LicenseCondition) {
				licenses.push(
					...getAllLicenses().filter(license => !!(license & conditions))
				);
				return this;
			}
		};
		return searcher;
	}

	/**
	 * Returns all conditions that make up a specific license.
	 */
	export function getConditions(license: License): LicenseCondition[] {
		return LicenseCondition.getAllLicenseConditions()
			.filter(condition => !!(license & condition));
	}
}
