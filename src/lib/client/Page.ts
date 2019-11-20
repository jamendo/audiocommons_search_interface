import { Component } from './Component';

/**
 * @param T Describes the type of the data the server has shared with the page.
 */
export abstract class Page<T = undefined> {
	protected constructor(
		protected readonly element = $('[data-ac-page]')[0],
		protected readonly sharedData: T = (() => {
			try {
				return <T>JSON.parse(
					decodeURIComponent($(element).attr('data-ac-page-data')!)
				);
			} catch {
				return <any>undefined;
			}
		})()
	) {}

	/**
	 * Initializes the code on the page.
	 * Called once the page has finished loading.
	 */
	public init(): void {
		$('html').attr('data-ac-current-page', $(this.element).attr('data-ac-page')!);

		Component.autoCreateComponents();
	}

	/**
	 * Query for elements inside this page.
	 * @param selector A CSS selector to query with.
	 */
	protected query(selector: string) {
		return $('[data-ac-page]').find(selector);
	}
}
