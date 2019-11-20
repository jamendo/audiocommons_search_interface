import { Component, IComponentConstructor } from 'lib/client/Component';
import { createSimpleUuid } from 'lib/utils/uuid';

export interface IComponentWithInfoButton<> extends Component<any> {
	/**
	 * Shows or hides an info button.
	 */
	setInfoButtonVisibility(visibility: 'visible' | 'hidden'): void;

	/**
	 * Updates the text displayed in the component's info button.
	 */
	setInfoButtonText(text: string): void;
}
export namespace IComponentWithInfoButton {
	const brand = createSimpleUuid();

	interface IBrandedConstructor {
		__IComponentWithInfoButton__: typeof brand;
	}

	interface IBrandedFormComponent extends IComponentWithInfoButton {
		readonly constructor: IBrandedConstructor;
	}

	export function implement() {
		return (componentClass: IComponentConstructor): void => {
			(<IBrandedConstructor><any>componentClass).__IComponentWithInfoButton__ = brand;
			return;
		};
	}

	export function isImplementedBy(obj: Component): obj is IComponentWithInfoButton {
		return obj && (<IBrandedFormComponent>obj).constructor.__IComponentWithInfoButton__ === brand;
	}
}
