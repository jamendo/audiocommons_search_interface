import { Component, IComponentConstructor } from 'lib/client/Component';
import { createSimpleUuid } from 'lib/utils/uuid';

export interface IFormComponentEvents {
	/**
	 * Triggered when the component's value has been changed.
	 * @event
	 */
	change: void;
}

export interface IFormComponent<T = any, TEvents extends IFormComponentEvents = IFormComponentEvents>
extends Component<IFormComponentEvents> {
	/**
	 * Uniquely identifies a form component.
	 */
	readonly formFieldId: string;

	/**
	 * Returns the current value of the form component, such as a string,
	 * a boolean flag or an array.
	 */
	getValue(): T;

	/**
	 * Updates the component's value.
	 * @param value The new value.
	 * @param silent Whether or not to silence the `change` event.
	 */
	setValue(value: T, silent: boolean): void;
}
export namespace IFormComponent {
	const brand = createSimpleUuid();

	interface IBrandedFormComponentConstructor {
		__IFormComponent__: typeof brand;
	}

	interface IBrandedFormComponent extends IFormComponent {
		readonly constructor: IBrandedFormComponentConstructor;
	}

	export function implement() {
		return (componentClass: IComponentConstructor): void => {
			(<IBrandedFormComponentConstructor><any>componentClass).__IFormComponent__ = brand;
			return;
		};
	}

	export function isImplementedBy(obj: Component): obj is IFormComponent {
		return obj && (<IBrandedFormComponent>obj).constructor.__IFormComponent__ === brand;
	}
}
