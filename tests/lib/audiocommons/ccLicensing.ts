import { test, suite, timeout } from 'mocha-typescript';
import { assert } from 'lib/utils/assert';
import { License, LicenseCondition } from 'lib/audiocommons/ccLicensing';

function assertArraysEqual<T>(a1: T[], a2: T[], message?: string): void | never {
	assert(
		JSON.stringify(a1.sort()) === JSON.stringify(a2.sort()),
		(message || '') + ` (expected ${JSON.stringify(a2.sort())}, got ${JSON.stringify(a1.sort())})`
	);
}


@suite class CCLicensing {
	@test 'getAllLicenses valid array content'() {
		const allLicenses = License.getAllLicenses();

		const invalidItems = allLicenses
			.filter(item => (typeof item !== 'number'));

		assertArraysEqual(
			invalidItems,
			[], // we expect an empty array
			'no invalid items in list'
		);
	}

	@test 'search: CC0 (conditions as bitmask)'() {
		const licenses = License.beginSearch()
			.addAllLicenses()
			.excludeConditions(LicenseCondition.BY | LicenseCondition.NC | LicenseCondition.ND | LicenseCondition.SA)
			.licenses;

		assertArraysEqual(licenses, [License.CC0]);
	}

	@test 'search: CC0 (individual calls)'() {
		const licenses = License.beginSearch()
		.addAllLicenses()
			.excludeConditions(LicenseCondition.BY)
			.excludeConditions(LicenseCondition.NC)
			.excludeConditions(LicenseCondition.ND)
			.excludeConditions(LicenseCondition.SA)
			.licenses;

		assertArraysEqual(licenses, [License.CC0]);
	}

	@test 'search: exclude BY'() {
		const licenses = License.beginSearch()
			.addAllLicenses()
			.excludeConditions(LicenseCondition.BY)
			.licenses;

		assertArraysEqual(licenses, [License.CC0]);
	}

	@test 'search: BY'() {
		const licenses = License.beginSearch()
			.addConditions(LicenseCondition.BY)
			.licenses;

		assertArraysEqual(
			licenses,
			[License.CC_BY, License.CC_BY_NC, License.CC_BY_NC_ND, License.CC_BY_NC_SA, License.CC_BY_ND, License.CC_BY_SA]
		);
	}

	@test 'search: exclude NC, add ND'() {
		const licenses = License.beginSearch()
			.excludeConditions(LicenseCondition.NC)
			.addConditions(LicenseCondition.BY)
			.licenses;

		assertArraysEqual(
			licenses,
			[License.CC_BY, License.CC_BY_ND, License.CC_BY_SA]
		);
	}

	@test 'search: add ND, exclude NC'() {
		const licenses = License.beginSearch()
			.excludeConditions(LicenseCondition.NC)
			.addConditions(LicenseCondition.BY)
			.licenses;

		assertArraysEqual(
			licenses,
			[License.CC_BY, License.CC_BY_ND, License.CC_BY_SA]
		);
	}
}
