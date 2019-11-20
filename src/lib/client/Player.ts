import { EventEmitter } from 'lib/event/EventEmitter';

export interface ITrack {
	readonly trackName: string;
	readonly artistName: string;
	readonly imageUrl?: string;
	readonly durationInSeconds?: number;
	readonly streamUrl: string;
}

export const enum PlayerState {
	Stopped,
	Playing,
	Paused
}

class AudioPlayer {
	public constructor(
		private readonly playerCoordinator: PlayerCoordinator
	) {
		this.playerCoordinator.on('trackChanged', track => this.changeTrack(track));
		this.playerCoordinator.on('stateChanged', state => {
			if (state === PlayerState.Playing) {
				this.resume();
			} else {
				this.pause();
			}
		});
		this.playerCoordinator.on('jumpTo', playedSeconds => this.jumpTo(playedSeconds));
	}

	private audio?: HTMLAudioElement;

	private pause() {
		if (this.audio) {
			this.audio.pause();
		}
	}

	private resume() {
		if (this.audio) {
			this.audio.play();
		}
	}

	private changeTrack(track: ITrack) {
		this.pause();

		this.audio = new Audio(track.streamUrl);
	}

	private jumpTo(playedSeconds: number) {
		this.audio!.currentTime = playedSeconds;
	}
}

export class PlayerCoordinator extends EventEmitter<{
	trackChanged: ITrack;
	stateChanged: PlayerState;
	/**
	 * Emitted when the player jumps to a specific number of played seconds in a track.
	 * @event
	 */
	jumpTo: number;
}> {
	private static singletonInstance: PlayerCoordinator;

	public static getInstance(): PlayerCoordinator {
		PlayerCoordinator.singletonInstance = PlayerCoordinator.singletonInstance || new PlayerCoordinator();
		return PlayerCoordinator.singletonInstance;
	}

	protected constructor() {
		super();
	}

	private audioPlayer = new AudioPlayer(this);
	private currentTrack?: ITrack;
	private state: PlayerState = PlayerState.Stopped;
	private playedSeconds: number = 0;
	private progressInterval?: number;

	public getCurrentTrack() {
		return this.currentTrack;
	}

	public getState(): PlayerState {
		return this.state;
	}

	public async playTrack(track: ITrack): Promise<void> {
		await this.requestPause();
		this.currentTrack = track;
		await this.emit('trackChanged', track);
		await this.requestResume();
	}

	public async requestStop(): Promise<void> {
		if (this.state === PlayerState.Stopped) {
			return;
		}

		clearTimeout(this.progressInterval);
		this.state = PlayerState.Stopped;
		await this.emit('stateChanged', this.state);
		await this.jumpToSeconds(0);
	}

	public async requestPause(): Promise<void> {
		if (this.state !== PlayerState.Playing) {
			return;
		}

		clearTimeout(this.progressInterval);
		this.state = PlayerState.Paused;
		await this.emit('stateChanged', this.state);
	}

	public async requestResume(): Promise<void> {
		if (this.state === PlayerState.Playing) {
			return;
		}

		this.state = PlayerState.Playing;
		await this.emit('stateChanged', this.state);

		const INTERVAL_LENGTH = 100;
		this.progressInterval = <any>setInterval(() => {
			this.playedSeconds += INTERVAL_LENGTH / 1000;
			if (
				typeof this.getCurrentTrack()!.durationInSeconds === 'number' &&
				this.playedSeconds > this.getCurrentTrack()!.durationInSeconds!
			) {
				this.requestStop();
			}
		}, INTERVAL_LENGTH);
	}

	public async requestPauseOrResumeTrigger(): Promise<void> {
		if (this.state === PlayerState.Playing) {
			await this.requestPause();
		} else {
			await this.requestResume();
		}
	}

	public async jumpToSeconds(playedSeconds: number): Promise<void> {
		playedSeconds = Math.min(playedSeconds, this.currentTrack!.durationInSeconds || 0);
		playedSeconds = Math.max(playedSeconds, 0);
		this.playedSeconds = playedSeconds;
		await this.emit('jumpTo', playedSeconds);
	}
}
