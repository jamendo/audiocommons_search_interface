import { Component } from 'lib/client/Component';
import { IFormComponent, IFormComponentEvents } from 'app/client/components/form/IFormComponent';
import { debounce } from 'lib/utils/debounce';

@Component.register('form/searchField')
@IFormComponent.implement()
export class SearchField extends Component<IFormComponentEvents & {
	/**
	 * Event emitted when the return key was pressed in the search field.
	 * @event
	 */
	returnKeyPressed: void;
}> implements IFormComponent<string> {
	//#region IFormComponent implementation

	public get formFieldId(): string {
		return $(this.element).attr('data-ac-attr-formFieldId')!;
	}

	public getValue(): string {
		return (this.$inputElement.val() || '').toString();
	}

	public setValue(value: string, silent: boolean): void {
		this.$inputElement.val(value);

		if (!silent) {
			this.emit('change', undefined);
		}
	}

	//#endregion IFormComponent implementation


	public init(): void {
		super.init();

		this.$inputElement.on('keyup', e => this.onInputKeyup(e));
		this.$inputElement.on('blur', () => this.onInputBlur());
	}

	private get $inputElement() {
		return this.query('.input');
	}

	@debounce(300, 'trailing')
	private async onInputKeyup(e: JQuery.Event): Promise<void> {
		await this.emitChangeEvent();

		if (e.keyCode === 13 /* return key */) {
			await this.emit('returnKeyPressed', undefined);
		}
	}

	@debounce(100, 'trailing')
	private onInputBlur(): void {
		this.emitChangeEvent();
	}

	private valueOnLastChangeEmit?: string;

	private async emitChangeEvent(): Promise<void> {
		const currentValue = this.getValue();

		// don't emit again if the value hasn't changed
		if (currentValue === this.valueOnLastChangeEmit) {
			return;
		}

		this.valueOnLastChangeEmit = currentValue;

		await this.emit('change', undefined);
	}
}
