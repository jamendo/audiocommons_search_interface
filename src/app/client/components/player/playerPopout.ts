import { Component } from 'lib/client/Component';
import { PlayerCoordinator, PlayerState } from 'lib/client/Player';

@Component.register('player/playerPopout')
export class PlayerPopout extends Component<{ }> {
	private trackLengthInSeconds: number = 1;
	private state: 'playing' | 'paused' = 'paused';
	private progressInPercent = 0;
	private progressInterval?: number;

	private get $progressTrack() {
		return this.query('.progress-bar-wrapper');
	}

	private get $progressBar() {
		return this.query('.progress-bar');
	}

	private getPlayerCoordinator(): PlayerCoordinator {
		return PlayerCoordinator.getInstance();
	}

	public init(): void {
		super.init();

		this.getPlayerCoordinator().on('stateChanged', state => {
			if (state === PlayerState.Playing) {
				this.setPlayingState('playing');
			} else {
				this.setPlayingState('paused');
			}
		});
		this.getPlayerCoordinator().on('trackChanged', track => {
			this.setTrackLengthInSeconds(track.durationInSeconds || 0);
			this.setTrackName(track.trackName);
			this.setArtistName(track.artistName);
			this.setTrackImage(track.imageUrl || '');
			this.setProgressInPercent(0);
		});
		this.getPlayerCoordinator().on('jumpTo', playedSeconds => this.setProgressInSeconds(playedSeconds));

		this.query('.play-pause-button').on('click', () => {
			this.getPlayerCoordinator().requestPauseOrResumeTrigger();
		});

		this.$progressTrack.on('click', e => this.handleProgressTrackClick(e));
	}

	public setTrackImage(trackImageUrl: string): void {
		this.query('.track-image').css('background-image', `url(${trackImageUrl})`);
	}

	public setTrackName(songTitle: string): void {
		this.query('.track-name').text(songTitle);
	}

	public setArtistName(artistName: string): void {
		this.query('.artist-name').text(artistName);
	}

	public setPlayingState(state: 'playing' | 'paused'): void {
		if (state === this.state) {
			return;
		}

		this.state = state;

		if (state === 'playing') {
			$(this.element).addClass('playing')
				.removeClass('paused')
				.removeClass('stopped');
			this.startProgressBarTransition();
		} else {
			$(this.element)
				.addClass('paused')
				.removeClass('stopped')
				.removeClass('playing');
			this.stopProgressBarTransition();
		}
	}

	public setTrackLengthInSeconds(trackLength: number): void {
		this.trackLengthInSeconds = trackLength;

		if (this.trackLengthInSeconds <= 0) {
			$(this.element).addClass('hide-progress-bar');
		} else {
			$(this.element).removeClass('hide-progress-bar');
		}
	}

	public setProgressInPercent(percentPlayed: number): void {
		if (percentPlayed >= 100) {
			this.setPlayingState('paused');
			return;
		}

		this.progressInPercent = percentPlayed;

		this.$progressBar.css('width', `${percentPlayed}%`);

		if (this.state === 'playing' && typeof this.progressInterval === 'undefined') {
			this.startProgressBarTransition();
		}
	}

	public setProgressInSeconds(secondsPlayed: number): void {
		const percentPlayed = secondsPlayed === 0
			? 0
			: 100 / (this.trackLengthInSeconds / secondsPlayed);
		this.setProgressInPercent(percentPlayed);
	}

	private startProgressBarTransition(): void {
		const INTERVAL_LENGTH = 300;

		this.progressInterval = <any>setInterval(() => {
			const progressInSeconds = this.progressInPercent * (this.trackLengthInSeconds / 100);
			this.setProgressInSeconds(progressInSeconds + (INTERVAL_LENGTH / 1e3));
		}, INTERVAL_LENGTH);
	}

	private stopProgressBarTransition(): void {
		clearTimeout(this.progressInterval);
		this.progressInterval = undefined;
	}

	private handleProgressTrackClick(e: JQuery.Event): void {
		const offset = e.offsetX! / this.$progressTrack.width()!;
		this.getPlayerCoordinator().jumpToSeconds(offset * this.trackLengthInSeconds);
	}
}
