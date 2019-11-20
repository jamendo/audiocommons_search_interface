import { Component } from 'lib/client/Component';
import { IFormComponent, IFormComponentEvents } from './IFormComponent';
import { IComponentWithInfoButton } from '../IComponentWithInfoButton';

interface IDateRangeComponentOptions {
	dateFormat?: string;
	numberOfMonths?: number;
}

@Component.register('form/dateRange')
@IFormComponent.implement()
@IComponentWithInfoButton.implement()
export class DateRange extends Component<IFormComponentEvents, IDateRangeComponentOptions>
implements IFormComponent<[string, string]> {
	//#region IFormComponent implementation

	public get formFieldId(): string {
		return $(this.element).attr('data-ac-attr-formFieldId')!;
	}

	public getValue(): [string, string] {
		const from = this.parseInputValueAsDate('from');
		const to = this.parseInputValueAsDate('to');

		return [
			from ? DateRange.stringifyDate(from) : undefined!,
			to ? DateRange.stringifyDate(to) : undefined!
		];
	}

	public setValue([from, to]: [string, string], silent: boolean): void {
		if (typeof from !== 'undefined' && from && from.trim().length > 0) {
			this.$fromInputElement.datepicker('setDate', DateRange.parseDate(from));
		} else {
			this.$fromInputElement.datepicker('setDate', undefined);
		}

		if (typeof to !== 'undefined' && to && to.trim().length > 0) {
			this.$toInputElement.datepicker('setDate', DateRange.parseDate(to));
		} else {
			this.$toInputElement.datepicker('setDate', undefined);
		}

		if (!silent) {
			this.emit('change', undefined);
		}
	}

	private static stringifyDate(date: Date): string {
		const zerofill = (num: number) => num < 10 ? `0${num}` : `${num}`;

		return [
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate()
		].map(zerofill).join('-') + ' ' + [
			date.getHours(),
			date.getMinutes(),
			date.getSeconds()
		].map(zerofill).join(':');
	}

	private static parseDate(str: string): Date {
		const parts = str.split(/ \:/g).map<number>(part => parseInt(part!, 10));
		const date = new Date();

		date.setFullYear(parts.pop()!);
		date.setMonth(parts.pop()! - 1);
		date.setDate(parts.pop()!);
		date.setHours(parts.pop()!);
		date.setMinutes(parts.pop()!);
		date.setSeconds(parts.pop()!);

		return date;
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


	public init(): void {
		super.init();
		this.initJqueryUI();
		this.initClearButton();
	}

	private get $fromInputElement() {
		return this.query('.from');
	}

	private get $toInputElement() {
		return this.query('.to');
	}

	private get $clearButton() {
		return this.query('.clear-button');
	}

	private initJqueryUI(): void {
		const emitChangeEvent = () => {
			// We add a timeout before emitting the change event. This is necessary because jQuery UI
			// triggers its own 'change' events before the values are updated in the DOM.
			setTimeout(() => {
				// don't emit a change event unless both dates are set
				const value = this.getValue();
				if (!value[0] || !value[1]) {
					return;
				}

				this.emit('change', undefined);
			}, 50);
		};

		this.$fromInputElement.datepicker({
			dateFormat: this.options.dateFormat,
			numberOfMonths: this.options.numberOfMonths,
			maxDate: new Date()
		}).on('change', () => {
			this.$toInputElement.datepicker('option', 'minDate', this.parseInputValueAsDate('from'));
			emitChangeEvent();
		});

		this.$toInputElement.datepicker({
			dateFormat: this.options.dateFormat,
			numberOfMonths: this.options.numberOfMonths,
			maxDate: new Date()
		}).on('change', () => {
			this.$fromInputElement.datepicker('option', 'maxDate', this.parseInputValueAsDate('to'));
			emitChangeEvent();
		});
	}

	private initClearButton(): void {
		this.$clearButton.on('click', () => this.setValue([undefined!, undefined!], false));
	}

	private parseInputValueAsDate(input: 'from' | 'to'): Date {
		let inputElement: HTMLInputElement;

		if (input === 'from') {
			inputElement = <HTMLInputElement>this.$fromInputElement[0];
		} else {
			inputElement = <HTMLInputElement>this.$toInputElement[0];
		}

		return $.datepicker.parseDate(this.options.dateFormat || 'mm/dd/yy', inputElement.value);
	}
}
