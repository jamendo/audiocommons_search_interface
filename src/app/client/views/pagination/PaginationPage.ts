import { View } from 'lib/client/View';

export abstract class PaginationPage extends View {
	private pageIndex?: number;

	/**
	 * Renders the content of this page.
	 */
	protected abstract renderContent(): JQuery | HTMLElement | View;


	protected renderConcrete() {
		// pages are hidden by default
		return $(`<section data-ac-view="pagination/paginationPage"></section>`);
	}

	protected onAfterRender() {
		if (typeof super.onAfterRender === 'function') {
			super.onAfterRender();
		}

		const content = this.renderContent();
		if (content instanceof View) {
			content.renderInto(this);
		} else {
			$(this.element!).append(content);
		}
	}

	public getPageIndex(): number | undefined {
		return this.pageIndex;
	}

	public setPageIndex(pageIndex: number) {
		this.pageIndex = pageIndex;
		$(this.element!).attr('data-ac-pagination-pageIndex', pageIndex);
	}

	public show(): void {
		$(this.element!).addClass('visible');
	}

	public hide(): void {
		$(this.element!).removeClass('visible');
	}
}
