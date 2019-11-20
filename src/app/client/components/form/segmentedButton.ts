import { Component } from 'lib/client/Component';
import { IFormComponent, IFormComponentEvents } from './IFormComponent';
import { IComponentWithInfoButton } from 'app/client/components/IComponentWithInfoButton';

@Component.register('form/segmentedButton')
@IFormComponent.implement()
@IComponentWithInfoButton.implement()
export class SegmentedButton<T = any | any[]> extends Component<IFormComponentEvents>
implements IFormComponent<T>, IComponentWithInfoButton {
	//#region IFormComponent implementation

	/** @override */
	public init(): void {
		super.init();
		this.initStyle();
		this.initButtonStateManagement();
	}

	public get formFieldId(): string {
		return $(this.element).attr('data-ac-attr-formFieldId')!;
	}

	public getValue(): T {
		const selectedButtons = this.getSelectedButtons();

		if (this.selectType === 'single') {
			if (selectedButtons.length > 1) {
				throw new Error(
					'Segmented button unable to determine which button was selected: ' +
					'Multiple buttons are selected, but component has selectType `single`. ' +
					'Please do report this as a bug.'
				);
			}

			if (selectedButtons.length > 0) {
				return SegmentedButton.extractValueFromButton(selectedButtons[0]);
			} else {
				return <any>null;
			}
		} else {
			return <any>selectedButtons.map(button => SegmentedButton.extractValueFromButton(button));
		}
	}

	public setValue(value: T, silent: boolean): void {
		const buttons = this.query('.button');

		if (this.selectType === 'single') {
			value = <any>[value];
		}

		// We assume this to be an array now, regardless of the `selectType`.
		const valueAsArray = <T[]><any>value;
		const matchingButtons: HTMLElement[] = [];

		for (const val of valueAsArray) {
			const jsonValue = JSON.stringify({ value: val });

			const matchingButton = buttons.toArray().find(button => {
				const buttonValue = SegmentedButton.extractValueFromButton(button);
				// do a deep comparison using JSON strings
				const jsonButtonValue = JSON.stringify({ value: buttonValue });
				return jsonButtonValue === jsonValue;
			});

			if (!matchingButton) {
				throw new Error(`SegmentedButton: No option with this value: ${jsonValue}`);
			}

			matchingButtons.push(matchingButton);
		}

		buttons.removeAttr('data-ac-selected');
		$(matchingButtons).attr('data-ac-selected', 'true');

		if (!silent) {
			this.emit('change', undefined);
		}
	}

	//#endregion IFormComponent implementation


	//#region IComponentWithInfoButton implementation

	private getInfoOverlayButtonComponent(): IComponentWithInfoButton | void {
		const button = Component.queryComponentsIn(this.element)
			.find<IComponentWithInfoButton>((component): component is IComponentWithInfoButton => {
				return IComponentWithInfoButton.isImplementedBy(component);
			});

		return button;
	}

	/**
	 * Shows or hides an info button.
	 */
	public setInfoButtonVisibility(visibility: 'visible' | 'hidden'): void {
		const button = this.getInfoOverlayButtonComponent();
		if (!button) {
			return;
		}

		button.setInfoButtonVisibility(visibility);
	}

	/**
	 * Updates the text displayed in the component's info button.
	 */
	public setInfoButtonText(text: string): void {
		const button = this.getInfoOverlayButtonComponent();
		if (!button) {
			return;
		}

		button.setInfoButtonText(text);
	}

	//#endregion IComponentWithInfoButton implementation


	/**
	 * Returns the minimum number of buttons that must be selected.
	 */
	public get minSelections(): number {
		const rawValue = $(this.element).attr('data-ac-attr-minSelections');
		const value = parseInt(rawValue!, 10);

		if (isNaN(value)) {
			throw new Error(`Segmented button: Illegal value '${rawValue}' for minSelections. Must be an integer.`);
		}

		return value;
	}

	private get selectType(): 'single' | 'multi' {
		const attrValue = $(this.element).attr('data-ac-attr-selectType');
		if (attrValue !== 'single' && attrValue !== 'multi') {
			throw new Error(
				'Segmented button unable to determine `selectType`: ' +
				'Specify `selectType` option as either `single` or `multi`'
			);
		}
		return attrValue;
	}

	private get style(): 'default' | 'dropdown' | 'expandable' {
		const attrValue = $(this.element).attr('data-ac-attr-style');
		switch (attrValue) {
			default:
				return 'default';

			// All accepted styles except 'default':
			case 'dropdown':
			case 'expandable':
				return attrValue;
		}
	}

	private get dropdownState(): 'closed' | 'open' {
		const attrValue = $(this.element).attr('data-ac-attr-dropdown-state');
		switch (attrValue) {
			default:
				return 'closed';

			case 'open':
				return 'open';
		}
	}

	private initStyle(): void {
		if (this.style === 'expandable') {
			this.query('.expand-button').on('click', e => this.toggleDropdownOrExpandState(e));
		}
	}

	private initButtonStateManagement(): void {
		const buttons = this.query('.button');

		buttons.on('click', e => {
			if (this.style === 'default' || this.style === 'expandable') {
				this.handleButtonClickWithDefaultStyle(e);
			} else if (this.style === 'dropdown') {
				this.toggleDropdownOrExpandState(e);
			}
		});

		if (this.selectType === 'single' && this.query('.button.selected').length > 1) {
			buttons.removeClass('selected');
			throw new Error(`Segmented button with selectType 'single' must have only one selected button.`);
		}
	}

	private handleButtonClickWithDefaultStyle(e: JQuery.Event): void {
		const buttons = this.query('.button');
		const prevValue = this.getValue();

		/*if (this.selectType === 'single') {
			buttons.removeAttr('data-ac-selected');
			$(e.target).attr('data-ac-selected', 'true');
		} else if (this.selectType === 'multi') {*/
			// if selected already, remove selection:
			if ($(e.target).attr('data-ac-selected') === 'true') {
				// check if the minimum number of selections has already been reached
				if (this.getSelectedButtons().length === this.minSelections) {
					throw new Error(
						`Segmented button: Cannot remove this selection: ` +
						`Minimum number of selections ${this.minSelections} already reached.`
					);
				}
				
				if (this.selectType === 'single') {
					buttons.removeAttr('data-ac-selected');
				} else {
					$(e.target).removeAttr('data-ac-selected');
				}
			}
			// not selected yet:
			else {
				if (this.selectType === 'single') {
					buttons.removeAttr('data-ac-selected');
				}
				
				$(e.target).attr('data-ac-selected', 'true');
			}
		//}

		// only emit the 'change' event if the value has actually changed
		if (this.getValue() !== prevValue) {
			this.emit('change', undefined);
		}
	}

	private toggleDropdownOrExpandState(e: JQuery.Event): void {
		if (this.dropdownState === 'closed') {
			this.openDropdownOrExpand();
		} else if (this.dropdownState === 'open') {
			// only process the click if the click was not made on the expand/collapse button
			if (e.target !== this.query('.expand-button')[0]) {
				this.handleButtonClickWithDefaultStyle(e);
			}
			this.closeDropdownOrExpand();
		}
	}

	private openDropdownOrExpand(): void {
		$(this.element).attr('data-ac-attr-dropdown-state', 'open');

		if (this.style === 'dropdown') {
			setTimeout(() => {
				$('body').one('click', () => this.closeDropdownOrExpand());
			}, 1);
		}
	}

	private closeDropdownOrExpand(): void {
		$(this.element).attr('data-ac-attr-dropdown-state', 'closed');
	}

	private getSelectedButtons(): HTMLElement[] {
		return this.query('.button[data-ac-selected="true"]').toArray();
	}

	private static extractValueFromButton(button: HTMLElement): any {
		const raw = $(button).attr('data-ac-value');

		try {
			return JSON.parse(raw!).value;
		} catch (err) {
			throw new Error(`Failed to extract value from segmented button: ${err}`);
		}
	}
}
