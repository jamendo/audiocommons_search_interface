import { PaginationPage } from 'app/client/views/pagination/PaginationPage';
import { translate } from 'lib/i18n/translate';

export class EmptyResultsPaginationPage extends PaginationPage {
	protected renderContent() {
		return $(`
			<div class="empty-results-page-content">
				${translate('pages.results.resultsPanel.noResultsForThisProvider')}
			</div>
		`);
	}
}
