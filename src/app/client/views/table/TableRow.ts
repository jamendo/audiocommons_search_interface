import { View } from 'lib/client/View';

export class TableRow extends View {
	protected renderConcrete() {
		return $(`<li data-ac-view="table/tableRow"></li>`);
	}
}
