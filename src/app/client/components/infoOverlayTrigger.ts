import { Component } from 'lib/client/Component';
import { IComponentWithInfoButton } from 'app/client/components/IComponentWithInfoButton';

export interface IInfoOverlayTriggerComponentOptions {
	content?: string;
}

@Component.register('infoOverlayTrigger')
@IComponentWithInfoButton.implement()
class InfoOverlayTrigger extends Component<any, IInfoOverlayTriggerComponentOptions>
implements IComponentWithInfoButton {
	public init(): void {
		super.init();

		if (this.options.content) {
			this.setContent(this.options.content);
		}

		$(this.element).on('mouseenter', () => this.showTooltip());
		$(this.element).on('mouseleave', () => this.hideTooltip());
	}

	public setContent(content: string): void {
		this.query('.content-inner-wrapper').html(content);
	}

	public showTooltip(): void {
		$(this.element).addClass('content-visible');
	}

	public hideTooltip(): void {
		$(this.element).removeClass('content-visible');
	}


	//#region IComponentWithInfoButton implementation

	/**
	 * Shows or hides an info button.
	 */
	public setInfoButtonVisibility(visibility: 'visible' | 'hidden'): void {
		$(this.element).attr('data-ac-visibility', visibility);
	}

	/**
	 * Updates the text displayed in the component's info button.
	 * @alias InfoOverlayTrigger.setContent
	 */
	public setInfoButtonText(text: string): void {
		this.setContent(text);
	}

	//#endregion IComponentWithInfoButton implementation
}
