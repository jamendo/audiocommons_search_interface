import { IBaseEventHandlerMap } from 'lib/event/IEventEmitter';
import { EventEmitter } from 'lib/event/EventEmitter';

export interface IComponentConstructor {
	new(element: HTMLElement): Component;
}

/**
 * @param THandlerMap Declares the events emitted by this component class. See `IEventEmitter` for details.
 */
export abstract class Component<
	THandlerMap extends IBaseEventHandlerMap = IBaseEventHandlerMap,
	TOptions = {}
> extends EventEmitter<THandlerMap> {
	public static autoCreateComponents(): void {
		$('[data-ac-component]').each(function() {
			try {
				Component.createForElement(this);
			} catch (err) {
				// tslint:disable-next-line:no-console
				console.warn(err);
			}
		});
	}

	public static createForElement(element: HTMLElement): Component {
		const componentId = element.getAttribute('data-ac-component');

		if (!(componentId! in Component.componentClassesById)) {
			throw new Error(`Cannot create component for DOM element: Component ID '${componentId}' unknown.`);
		}

		// tslint:disable-next-line:variable-name
		const ComponentClass = Component.componentClassesById[componentId!];
		const componentInstance = new ComponentClass(element);
		componentInstance.init();
		Component.componentInstances.push(componentInstance);
		return componentInstance;
	}

	public static queryComponentsIn<T extends Component>(query: string | HTMLElement | JQuery<any>): T[] {
		const container = $(query)[0];

		return <T[]>Component.componentInstances.filter(component => {
			return $.contains(container, component.element);
		});
	}

	public static getByElement<T extends Component>(element: HTMLElement): T {
		return <T>Component.componentInstances.find(component => {
			return element === component.element;
		});
	}

	private static readonly componentClassesById: { [componentId: string]: IComponentConstructor; } = {};
	private static readonly componentInstances: Component[] = [];

	protected static register(componentId: string) {
		return (componentClass: IComponentConstructor) => {
			if (componentId in Component.componentClassesById) {
				throw new Error(`Cannot register component ${componentId}: Component ID already in use.`);
			}

			Component.componentClassesById[componentId] = class extends componentClass {
				public readonly componentId = componentId;
			};
		};
	}

	public constructor(
		/**
		 * The outermost element of this component in the DOM.
		 */
		protected readonly element: HTMLElement,
		protected readonly options: Readonly<TOptions> = JSON.parse(
			decodeURIComponent(
				$(element!).attr('data-ac-component-options') || '{}'
			)
		)
	) { super(); }

	public readonly componentId?: string;

	/**
	 * Initializes the component.
	 */
	public init(): void {
		// nothing to do
	}

	/**
	 * Query for elements inside this component.
	 * @param selector A CSS selector to query with.
	 */
	protected query(selector: string) {
		return $(this.element).find(selector);
	}
}
