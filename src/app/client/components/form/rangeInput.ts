import { Component } from 'lib/client/Component';
import { IFormComponent, IFormComponentEvents } from 'app/client/components/form/IFormComponent';
import { IComponentWithInfoButton } from 'app/client/components/IComponentWithInfoButton';

interface IRangeInputComponentOptions {
	min?: number;
	max?: number;
	step?: number;
	value?: [number, number];
	noValueIfFullRangeSelected?: number;
}

@Component.register('form/rangeInput')
@IFormComponent.implement()
@IComponentWithInfoButton.implement()
export class RangeInput extends Component<IFormComponentEvents, IRangeInputComponentOptions>
implements IFormComponent<[number, number]>, IComponentWithInfoButton {
	//#region IFormComponent implementation

	public get formFieldId(): string {
		return $(this.element).attr('data-ac-attr-formFieldId')!;
	}

	public getValue(): [number, number] {
		const value = <[number, number]>[
			<number>this.$sliderElement.slider('values', 0),
			<number>this.$sliderElement.slider('values', 1)
		];

		if (
			this.options.noValueIfFullRangeSelected &&
			typeof this.options.min === 'number' &&
			value[0] === this.options.min &&
			typeof this.options.max === 'number' &&
			value[1] === this.options.max
		) {
			return <any>undefined;
		}

		return value;
	}

	public setValue([low, high]: [number, number], silent: boolean): void {
		this.$sliderElement.slider('values', 0, low);
		this.$sliderElement.slider('values', 1, high);

		this.updateNumericLabels(low, high);

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


	public init(): void {
		super.init();
		this.initJqueryUI();
		this.updateRangeLimitIndicators();
	}

	private get $sliderElement() {
		return this.query('.slider');
	}

	private initJqueryUI(): void {
		this.$sliderElement.slider({
			range: true,
			min: this.options.min || 0,
			max: this.options.max || 100,
			step: this.options.step || undefined,
			values: this.options.value || [this.options.min || 0, this.options.max || 100],
			slide: (e, ui) => {
				if (!ui.values) {
					return;
				}
				const [low, high] = ui.values;
				this.updateNumericLabels(low, high);
				this.emit('change', undefined);
			}
		});
	}

	private updateNumericLabels(low: number, high: number): void {
		this.query('.numeric-label.low').text(low);
		this.query('.numeric-label.high').text(high);

		this.updateRangeLimitIndicators([low, high]);
	}

	private updateRangeLimitIndicators(value: [number, number] = this.getValue()): void {
		const [low, high] = value || [
			this.options.min || 0,
			this.options.max || 100
		];

		if (low === (this.options.min || 0) && high === (this.options.max || 100)) {
			$(this.element).addClass('full-range-selected');
		} else {
			$(this.element).removeClass('full-range-selected');
		}
	}
}
