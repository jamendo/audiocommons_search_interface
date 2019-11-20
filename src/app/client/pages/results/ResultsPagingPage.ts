import { PaginationPage } from 'app/client/views/pagination/PaginationPage';
import { Table } from 'app/client/views/table/Table';
import { ICollectResponseTrack, ILicensingCollectResponse } from 'lib/audiocommons/api/request/collect';
import { TextSearchRequestField } from 'lib/audiocommons/api/request/textSearch';
import { TableCell } from 'app/client/views/table/TableCell';
import { translate } from 'lib/i18n/translate';
import { createSimpleUuid } from 'lib/utils/uuid';
import { PlayerCoordinator, ITrack, PlayerState } from 'lib/client/Player';
import { ROUTES } from '../../../routes.config';
import { ILicensingRequestParams, ILicensingResponse } from '../../../api.types';
import { getJson } from 'lib/client/http';
import { EventEmitter } from 'lib/event/EventEmitter';

export class ResultsPaginationPage extends PaginationPage {
	public constructor(
		private readonly providerName: string,
		private readonly loadResults: () => Promise<Array<Partial<ICollectResponseTrack>>>
	) { super(); }

	public dispose() {
		super.dispose();

		if (this.table) {
			this.table.dispose();
		}
	}

	private table?: Table<Partial<ICollectResponseTrack>>;

	private static playerFeaturesInitialized = false;
	private static readonly playFuncId = `ac-play-${createSimpleUuid()}`;

	private static initPlayerFeatures(): void {
		if (ResultsPaginationPage.playerFeaturesInitialized) {
			return;
		}
		ResultsPaginationPage.playerFeaturesInitialized = true;

		// publish the player function to the window scope
		(<any>window)[ResultsPaginationPage.playFuncId] = (trackInfo: ITrack) => {
			if (
				PlayerCoordinator.getInstance().getState() === PlayerState.Playing &&
				PlayerCoordinator.getInstance().getCurrentTrack()!.streamUrl === trackInfo.streamUrl
			) {
				PlayerCoordinator.getInstance().requestPause();
			} else {
				PlayerCoordinator.getInstance().playTrack(trackInfo);
			}
		};

		PlayerCoordinator.getInstance().on('stateChanged', state => {
			const trackInfo = PlayerCoordinator.getInstance().getCurrentTrack();

			if (!trackInfo) {
				return;
			}

			const streamUrl = encodeURIComponent(trackInfo.streamUrl);
			const trackElements = $(`.play-button[data-ac-results-table-track-url="${streamUrl}"]`);

			switch (state) {
				default:
					trackElements.removeClass('playing');
					break;

				case PlayerState.Playing:
					trackElements.addClass('playing');
					break;
			}
		});
	}

	protected renderContent() {
		ResultsPaginationPage.initPlayerFeatures();

		this.table = new Table<Partial<ICollectResponseTrack>>([
			{
				name: TextSearchRequestField.AC_Preview_url,
				heading: '',
				type: TableCell.extend<string>((url, track: ICollectResponseTrack) => {
					let streamUrl = track[TextSearchRequestField.AC_Preview_url];

					// We need to change Jamendo's stream URL because the one we get from the AC API
					// is broken on Chrome (jumping to specific positions in the track doesn't work).
					if (/jamendo/i.test(streamUrl)) {
						const trackId = parseInt(streamUrl.replace(/.*track\/(\d+).*/, '$1'), 10);
						streamUrl = `https://mp3d.jamendo.com/?trackid=${trackId}&format=mp32`;
					}

					const trackInfo: ITrack = {
						trackName: track[TextSearchRequestField.AC_Name],
						artistName: track[TextSearchRequestField.AC_Author],
						durationInSeconds: (
							track[TextSearchRequestField.AC_Duration]
								? parseInt(track[TextSearchRequestField.AC_Duration] || '1', 10)
								: undefined
						),
						imageUrl: track[TextSearchRequestField.AC_Image],
						streamUrl
					};

					const buttonId = `result-play-button-${createSimpleUuid()}`;

					return `
						<div
							id="${buttonId}"
							class="play-button"
							data-ac-results-table-track-url="${encodeURIComponent(trackInfo.streamUrl)}"
						>
							<script>
								$(document).ready(function() {
									$('#${buttonId}').on('click', function() {
										window["${ResultsPaginationPage.playFuncId}"](${JSON.stringify(trackInfo)})
									});
								});
							</script>
						</div>
					`;
				})
			},
			{
				name: TextSearchRequestField.AC_Image,
				heading: '',
				type: TableCell.extend<string>(url => `
					<div class="track-image"${url ? ` style="background-image: url(${url})"` : ''}>
				`)
			},
			{
				name: TextSearchRequestField.AC_Name,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.title'),
				type: TableCell.TextCell
			},
			{
				name: TextSearchRequestField.AC_Waveform,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.waveform'),
				type: TableCell.extend<string>((url, track: ICollectResponseTrack) => {
					
					const acid = track[TextSearchRequestField.AC_Id];

					if (/jamendo/i.test(acid)) {

						const domId = createSimpleUuid();

						setTimeout(
							() => {
								const wavefromPeark = JSON.parse(track[TextSearchRequestField.AC_Waveform]);

								if (wavefromPeark.peaks) {
									let waveformCanvas : HTMLCanvasElement = document.createElement('canvas');
									waveformCanvas.height = 60;
									waveformCanvas.width = 200;
									const peaksNumber = waveformCanvas.width / 3;
									const duration : number = Number(track[TextSearchRequestField.AC_Duration]);
									const peaksLength = waveformCanvas.width;


									let topPeakMaxHeightInPixel = waveformCanvas.height * (50 / 100);
									let bottomPeakMaxHeightInPixel  = waveformCanvas.height * (50 / 100);

									for (let i : number = 0; i < peaksNumber; i++) {

										// interpolation 
										let interpolatedPeak = {
											height: 5,
											position: (i * duration) / peaksNumber
										};
										
										let index = Math.floor(i * peaksLength / peaksNumber);
										
										if (index < peaksLength) {
											
											let firstPoint = {
												position: (index * duration) / peaksLength,
												height: wavefromPeark.peaks[index]
											};
											
											let secondPoint = {
												position: ((index + 1) * duration) / peaksLength,
												height: wavefromPeark.peaks[index + 1]
											};
											
											// linear interpolation formula
											interpolatedPeak.height = firstPoint.height + (secondPoint.height - firstPoint.height) * (interpolatedPeak.position - firstPoint.position) / (secondPoint.position - firstPoint.position);
											
										} else {
											
											interpolatedPeak.height = wavefromPeark.peaks[peaksLength - 1];
											
										}
										
										let peakHeightInPercent = interpolatedPeak.height;
							
										// the horizontal position of a peak
										let peakHorizontalPosition = ((i + 1) * 2) + (i * 1);
							
										let canvasContext = waveformCanvas.getContext('2d');
										if (canvasContext !== null) {
											canvasContext.beginPath();
											canvasContext.moveTo(peakHorizontalPosition, topPeakMaxHeightInPixel);
											canvasContext.lineTo(peakHorizontalPosition, topPeakMaxHeightInPixel - (topPeakMaxHeightInPixel * (peakHeightInPercent / 100)));
											canvasContext.strokeStyle = '#005256';
											canvasContext.stroke();

											canvasContext.beginPath();
											canvasContext.moveTo(peakHorizontalPosition, topPeakMaxHeightInPixel);
											canvasContext.lineTo(peakHorizontalPosition, topPeakMaxHeightInPixel + (bottomPeakMaxHeightInPixel * (peakHeightInPercent / 100)));
											canvasContext.strokeStyle = '#00a7af';
											canvasContext.stroke();
										}
									}

									$(`#${domId}`).replaceWith(waveformCanvas);
								} else {
									return '';
								}
						},
						20);

						return `<div id="${domId}" data-ac-style="loading"></div>`;
					} else if (/freesound/i.test(acid) && track[TextSearchRequestField.AC_Image]) {
						let waveform = track[TextSearchRequestField.AC_Image];
						return `<img src="${waveform}" class="freesound-waveform"/>`;
					}

					return '';
				})
			},
			{
				name: TextSearchRequestField.AC_Author,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.author'),
				type: TableCell.TextCell
			},
			{
				name: TextSearchRequestField.AC_Timestamp,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.creationDate'),
				type: TableCell.extend<string>(timestamp => {
					if (!timestamp) {
						return '';
					}

					const [year, month, day] = timestamp.split(/-|\s/).map(num => parseInt(num, 10));
					if (!year || !month || !day) {
						return '';
					}

					const fullMonthName = translate(`generic.monthNamesByIndex.${month - 1}`);
					const shortMonthName = fullMonthName.slice(0, 3);

					return `${day} ${shortMonthName} ${year}`;
				})
			},
			{
				name: TextSearchRequestField.AC_Duration,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.duration'),
				type: TableCell.extend<number>(duration => {
					const mins = Math.floor(duration / 60);
					const secs = Math.max(Math.floor(duration - (mins * 60)), 1);

					if (isNaN(mins) || isNaN(secs)) {
						return '';
					}

					return [mins, secs]
						.map(num => `${num < 10 ? '0' : ''}${num}`)
						.join(':');
				})
			},
			{
				name: TextSearchRequestField.AC_License,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.license'),
				type: TableCell.extend<string>(content => {
					if (!content) {
						return '';
					}

					const licenseConditionNames = content.split('-');

					const licenseConditionElements = licenseConditionNames
						.map(licenseName => licenseName.toUpperCase())
						.map(licenseConditionName => `<div class="${licenseConditionName} visible"></div>`)
						.join('');

					return `<div class="license-conditions ${licenseConditionNames.join(' ')}">${licenseConditionElements}</div>`;
				})
			},
			{
				name: TextSearchRequestField.AC_Preview_url,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.download'),
				type: TableCell.extend<string>((url, track: ICollectResponseTrack) => {
					const acid = track[TextSearchRequestField.AC_Id];

					const getSimpleDownloadLinkHtml = () => `
						<a
							class="download-button"
							href="${url}"
							target="_blank"
							download="${track[TextSearchRequestField.AC_Name]}"
						></a>
					`;

					return getSimpleDownloadLinkHtml();
				})
			},
			{
				name: TextSearchRequestField.AC_Url,
				heading: translate('pages.results.resultsPanel.resultsListColumnName.providerLinks'),
				type: TableCell.extend<string>((url, track: ICollectResponseTrack) => {
					const acid = track[TextSearchRequestField.AC_Id];

					const getSimpleProviderLinkHtml = () => `
						<a
							href="${url}" class="button uppercase provider-link provider-${this.providerName}"
							target="_blank"
						>
							${translate(`pages.results.resultsPanel.providerLinkText.${this.providerName}`)}
						</a>
					`;

					if (!/jamendo/i.test(acid)) {
						return getSimpleProviderLinkHtml();
					}

					const domId = createSimpleUuid();

					const handler = this.licensingUrlEvents.prepareHandler(0, urls => {
						const licensingUrl = urls[acid];
						const uniqueId = acid.replace(':', '-');
						let html: string;

						if (typeof licensingUrl === 'string' && licensingUrl.trim().length > 0) {
							html = `
								<script>
									$(document).ready(function() {
										$('.js-more-info-licensing-btn-${uniqueId}').on('mouseenter', function (event) {
											$('.js-more-info-licensing-body').prop('hidden', true);

											$('.js-more-info-licensing-body.js-unique-${uniqueId}').prop('hidden', false);
										});
										$('.js-more-info-licensing-btn-${uniqueId}').on('mouseleave', function (event) {
											$('.js-more-info-licensing-body').prop('hidden', true);
										});
									});
								</script>
								<a
									href="${licensingUrl}?ref=audiocommons" class="button uppercase provider-link provider-${this.providerName} js-more-info-licensing-btn-${uniqueId}"
									target="_blank"
								>
									${translate(`pages.results.resultsPanel.buyLicenseButtonLabel`)}
								</a>
								<div class="button-tooltip js-more-info-licensing-body js-unique-${uniqueId}" hidden>
									<p>Acquiring a license for this track will allow you to benefit from rights, which may not be included in the Creative Commons license selected by the artist. If the Creative Commons license already allows the usage you aim at, acquiring a license is a good way to directly support the creator.</p>
								</div>
							`;
						} else {
							html = getSimpleProviderLinkHtml();
						}

						$(`#${domId}`).replaceWith(html);
					});

					this.licensingUrlEvents.once(this.requestLicensingUrl(acid), handler);

					return `<div class="provider-link-loader" id="${domId}" data-ac-style="loading"></div>`;
				})
			}
		]);

		return this.table;
	}

	protected async onAfterRender() {
		if (typeof super.onAfterRender === 'function') {
			super.onAfterRender();
		}

		const results = await this.loadResults();

		this.table!.appendRows(...results);
	}

	private async isJamendoLicensingTrack(acid: string): Promise<boolean> {
		const urls = await this.licensingUrlEvents.emitted(this.requestLicensingUrl(acid));
		return (
			typeof urls[acid] === 'string' &&
			urls[acid].trim().length > 0
		);
	}


	private static readonly ACID_REQUEST_THRESHOLD = 100;
	private readonly acidPool: string[] = [];
	private acidPoolStarted?: number;
	private acidPoolRequestTimeout?: number;
	private readonly licensingUrlEvents = new EventEmitter<{
		[e: number]: ILicensingResponse;
	}>();

	private requestLicensingUrl(acid: string): number {
		clearTimeout(this.acidPoolRequestTimeout);

		const now = Date.now();

		if (this.acidPool.length === 0 || typeof this.acidPoolStarted !== 'number') {
			this.acidPoolStarted = now;
		}

		this.acidPool.push(acid);

		const sendRequest = async (poolId: number) => {
			this.acidPoolStarted = undefined;
			const response = await this.requestLicensingUrls(this.acidPool.splice(0, this.acidPool.length));
			await this.licensingUrlEvents.emit(poolId, response);
		};

		if (now - this.acidPoolStarted! > ResultsPaginationPage.ACID_REQUEST_THRESHOLD) {
			sendRequest(this.acidPoolStarted!);
		} else {
			this.acidPoolRequestTimeout = <number><any>setTimeout(() => sendRequest(this.acidPoolStarted!), ResultsPaginationPage.ACID_REQUEST_THRESHOLD);
		}

		return this.acidPoolStarted!;
	}

	private async requestLicensingUrls(
		acids: string[],
		include?: string[]
	): Promise<ILicensingResponse> {
		return getJson<ILicensingRequestParams, ILicensingResponse>({
			url: `${ROUTES.api.licensing}`,
			params: { acids, include }
		});
	}
}
