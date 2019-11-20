import { View } from 'lib/client/View';
import { PaginationPage } from 'app/client/views/pagination/PaginationPage';
import { PaginationControl } from './PaginationControl';

export class PaginationContainer extends View<{
	requestPage: number;
}> {
	private readonly paginationControl = new PaginationControl();
	private readonly pages: PaginationPage[] = [];

	public dispose() {
		super.dispose();

		this.paginationControl.dispose();
		this.pages.forEach(page => page.dispose());
	}

	protected renderConcrete() {
		return $(`<div data-ac-view="pagination/paginationContainer"></div>`);
	}

	protected onAfterRender() {
		if (typeof super.onAfterRender === 'function') {
			super.onAfterRender();
		}

		this.paginationControl.on('requestPage', pageIndex => this.goToPage(pageIndex));
		this.paginationControl.renderInto(this);
	}

	public setTotalNumberOfPages(numPages: number): void {
		this.paginationControl.setTotalNumberOfPages(numPages);
	}

	public getPageAtPageIndex(pageIndex: number): PaginationPage | undefined {
		return this.pages[pageIndex];
	}

	public addPageAtPageIndex(pageIndex: number, page: PaginationPage): void {
		this.pages[pageIndex] = page;
		page.setPageIndex(this.pages.length);
		page.renderInto(this);

		// show the first page right away
		if (this.pages.length === 1) {
			page.show();
		}
	}

	public async goToPage(pageIndex: number): Promise<void> {
		await this.emit('requestPage', pageIndex);
		$(this.element!).scrollTop(0);
		this.pages.forEach(page => page.hide());
		this.pages[pageIndex].show();
	}
}
