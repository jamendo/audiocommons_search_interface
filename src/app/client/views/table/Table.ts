import { View } from 'lib/client/View';
import { TableCell } from './TableCell';
import { TableRow } from './TableRow';
import { TableHead } from './TableHead';

export class Table<T extends object> extends View {
	public constructor(
		private readonly cellDefinitions: Array<Readonly<{
			name: keyof T;
			type: typeof TableCell;
			heading?: string;
		}>>
	) { super(); }

	public dispose() {
		super.dispose();
		this.children.forEach(child => child.dispose());
	}

	protected renderConcrete() {
		return $(`
			<div
				data-ac-view="table/table"
				data-ac-table-num-cols="${this.cellDefinitions.length}"
			></div>
		`);
	}

	protected onAfterRender() {
		if (typeof super.onAfterRender === 'function') {
			super.onAfterRender();
		}

		this.appendHead();
	}

	public appendRow(rowData: T) {
		const row = new TableRow();

		// tslint:disable-next-line:variable-name
		for (const { name: colName, type: CellType } of this.cellDefinitions) {
			if (typeof CellType !== 'function') {
				throw new Error(`Table configuration missing cell constructor for '${colName}'.`);
			}

			const cell = <TableCell<T>>new (<any>CellType)(rowData[colName], rowData, colName);
			cell.renderInto(row);
		}

		row.renderInto(this);
	}

	public appendRows(...rowData: T[]) {
		for (const data of rowData) {
			this.appendRow(data);
		}
	}

	private appendHead(): void {
		const head = new TableHead();

		for (const { name: colName, heading } of this.cellDefinitions) {
			const cell = new TableCell.HeaderCell(heading || '', undefined, <string>colName);
			cell.renderInto(head);
		}

		head.renderInto(this);
	}
}
