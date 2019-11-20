import { View } from 'lib/client/View';

export class TableCell<T, C = any> extends View {
	public constructor(
		protected readonly content: T,
		protected readonly rowData: C,
		/**
		 * The table header under which the cell will be displayed.
		 */
		private readonly columnName: string
	) { super(); }

	protected renderContent?(content: T, rowData?: C): string | HTMLElement | JQuery;

	protected readonly tagName: string = 'div';

	protected renderConcrete() {
		return $(`
			<${this.tagName}
				data-ac-view="table/tableCell"
				data-ac-table-column="${this.columnName}"
			>
				${this.renderContent!(this.content, this.rowData)}
			</${this.tagName}>
		`);
	}


	public static extend<T, C = any>(
		renderContent: (content: T, rowData?: C) => string | HTMLElement | JQuery
	): typeof TableCell {
		return <typeof TableCell>class extends TableCell<T> {
			protected renderContent(content: T, rowData?: C): string | HTMLElement | JQuery {
				return renderContent(content, rowData);
			}
		};
	}


	// tslint:disable:variable-name

	public static readonly HeaderCell = class TableHeaderCell extends TableCell<string> {
		protected readonly tagName = 'div';

		protected renderContent(content: string): string | HTMLElement | JQuery {
			return content || '';
		}
	};

	public static readonly TextCell = TableCell.extend<string>(content => (content || ''));
}
