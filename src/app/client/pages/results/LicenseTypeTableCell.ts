import { TableCell } from 'app/client/views/table/TableCell';

// tslint:disable-next-line:variable-name
const LicenseTypeTableCell = TableCell.extend<string>(content => {
	const licenseNames = content.split('-');

	const licenseElements = licenseNames
		.map(licenseName => `<div class="${licenseName}">CC-${licenseName}</div>`)
		.join('');

	return `<div class="licenses ${licenseNames.join(' ')}">${licenseElements}</div>`;
});

export { LicenseTypeTableCell };
