import { IBaseEventHandlerMap } from 'lib/event/IEventEmitter';
import { EventEmitter } from 'lib/event/EventEmitter';

export abstract class View<THandlerMap extends IBaseEventHandlerMap = IBaseEventHandlerMap>
extends EventEmitter<THandlerMap> {
	/**
	 * The outermost element of this view.
	 */
	private actualElement?: HTMLElement;

	/**
	 * A view that contains this view.
	 * This only exists when [[renderInto]] was called with a [[View]] instance.
	 */
	private actualParentView?: View;

	/**
	 * The element in which this view was rendered.
	 */
	private actualParentElement?: HTMLElement;

	/**
	 * Contains all child views that were added to this view using [[renderInto]].
	 */
	private readonly actualChildren: Array<View<any>> = [];

	/**
	 * The outermost element of this view.
	 */
	protected get element() {
		return this.actualElement;
	}

	/**
	 * A view that contains this view.
	 * This only exists when [[renderInto]] was called with a [[View]] instance.
	 */
	protected get parentView() {
		return this.actualParentView;
	}

	/**
	 * The element in which this view was rendered.
	 */
	protected get parentElement() {
		return this.actualParentElement;
	}

	/**
	 * Contains all child views that were added to this view using [[renderInto]].
	 */
	protected get children(): ReadonlyArray<View> {
		return this.actualChildren;
	}

	/**
	 * Renders this view into a DOM element or another view instance.
	 * @final
	 */
	public renderInto(parent: HTMLElement | JQuery | View): void {
		this.callHook(this.onBeforeRender);

		this.actualElement = $(this.renderConcrete())[0];

		this.children.forEach(child => $(this.element!).append(child.element!));

		if (parent instanceof View) {
			this.actualParentView = parent;
			this.actualParentElement = parent.element;
			parent.actualChildren.push(this);
		} else {
			this.actualParentElement = $(parent)[0];
		}

		$(this.element!).appendTo(this.parentElement!);

		this.callHook(this.onAfterRender);
	}

	/**
	 * Detaches the view from its parent.
	 */
	public detachFromParent(): void {
		$(this.element!).detach();

		if (this.actualParentView) {
			const index = this.actualParentView.actualChildren.indexOf(this);
			this.actualParentView.actualChildren.splice(index, 1);
			this.actualParentView = undefined;
		}
	}

	/**
	 * Query for elements inside this component.
	 * @param selector A CSS selector to query with.
	 */
	protected query(selector: string) {
		return $(this.element!).find(selector);
	}

	public dispose() {
		this.detachFromParent();
		return;
	}

	protected abstract renderConcrete(): HTMLElement | JQuery;
	protected onBeforeRender?(): void;
	protected onAfterRender?(): void;

	// tslint:disable-next-line:ban-types
	private callHook(hook?: Function, ...args: any[]): void {
		if (typeof hook === 'function') {
			return hook.apply(this, args);
		}
		return undefined;
	}
}
