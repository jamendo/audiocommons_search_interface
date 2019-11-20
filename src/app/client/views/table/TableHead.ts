import { TableRow } from 'app/client/views/table/TableRow';

export class TableHead extends TableRow {
	protected renderConcrete() {
		return $(`<li data-ac-view="table/tableHead"></li>`);
	}
}
