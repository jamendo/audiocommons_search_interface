import { View } from 'lib/client/View';
import { PaginationPage } from 'app/client/views/pagination/PaginationPage';
import { translate } from 'lib/i18n/translate';

export class PaginationControl extends View<{
	requestPage: number;
}> {
	public constructor(
		private currentPageIndex: number = 0
	) { super(); }

	private ignoreInputChangeEvents = false;
	private totalNumberOfPages?: number;

	public setTotalNumberOfPages(numPages: number): void {
		numPages = Math.ceil(numPages);
		numPages = Math.max(1, numPages);
		this.totalNumberOfPages = numPages;
		this.updateButtonStates();
		this.query('.total-page-count').text(numPages);
		this.query('.page-input').attr('max', numPages);
	}

	protected renderConcrete() {
		return $(`
			<div data-ac-view="pagination/paginationControl">
				<button class="button prev">${translate('views.pagination.paginationControl.previousPage')}</button>

				<div class="numeric-pagination">
					<input type="number" class="page-input" value="1">
					<span>${translate('views.pagination.paginationControl.of')}</span>
					<div class="total-page-count">${this.totalNumberOfPages || 1}</div>
				</div>

				<button class="button next">${translate('views.pagination.paginationControl.nextPage')}</button>
			</div>
		`);
	}

	protected onAfterRender() {
		if (typeof super.onAfterRender === 'function') {
			super.onAfterRender();
		}

		this.setButtonDisabled('prev', true);

		this.query('.prev').on('click', e => {
			if ($(e.target).hasClass('disabled')) {
				return;
			}
			this.onPrevButtonClick();
		});
		this.query('.next').on('click', e => {
			if ($(e.target).hasClass('disabled')) {
				return;
			}
			this.onNextButtonClick();
		});
		this.query('.page-input').on('change', this.onInputChange.bind(this));

		this.updateButtonStates();
	}

	private onPrevButtonClick(): void {
		this.requestPage(this.currentPageIndex - 1);
	}

	private onNextButtonClick(): void {
		this.requestPage(this.currentPageIndex + 1);
	}

	private onInputChange(): void {
		if (this.ignoreInputChangeEvents) {
			return;
		}

		let value = parseInt(<string>this.query('.page-input').val(), 10) - 1;
		value = Math.ceil(value);
		value = Math.max(0, value);

		if (typeof this.totalNumberOfPages === 'number' && value > this.totalNumberOfPages) {
			this.ignoreInputChangeEvents = true;
			this.query('.page-input').val(this.totalNumberOfPages);
			value = this.totalNumberOfPages;
			this.ignoreInputChangeEvents = false;
		}

		this.requestPage(value);
	}

	private async requestPage(pageIndex: number): Promise<void> {
		this.currentPageIndex = pageIndex;

		this.ignoreInputChangeEvents = true;
		this.query('.page-input').val(pageIndex + 1);
		this.ignoreInputChangeEvents = false;

		await this.emit('requestPage', pageIndex);

		this.updateButtonStates();
	}

	private updateButtonStates() {
		if (this.currentPageIndex === 0) {
			this.setButtonDisabled('prev', true);
		} else {
			this.setButtonDisabled('prev', false);
		}

		if (
			typeof this.totalNumberOfPages === 'number' &&
			this.currentPageIndex + 1 >= this.totalNumberOfPages
		) {
			this.setButtonDisabled('next', true);
		} else {
			this.setButtonDisabled('next', false);
		}
	}

	private setButtonDisabled(buttonIdent: 'prev' | 'next', disabled: boolean): void {
		const button = this.query(`.button.${buttonIdent}`);
		if (disabled) {
			$(this.element!).addClass(`${buttonIdent}-button-disabled`);
			button.addClass('disabled');
		} else {
			$(this.element!).removeClass(`${buttonIdent}-button-disabled`);
			button.removeClass('disabled');
		}
	}
}
