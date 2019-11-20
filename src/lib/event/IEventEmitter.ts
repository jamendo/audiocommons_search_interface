export type IBaseEventHandlerMap = Readonly<{ [eventName: string]: any; }>;

export interface IEventEmitter<THandlerMap extends IBaseEventHandlerMap> {
	/**
	 * Bind an event to a callback function.
	 * @param eventName Name of the event to bind
	 * @param callback Callback to call when the event fires
	 */
	on<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void>;

	/**
	 * Bind an event to be emitted only a single time. The callback will be remove after the first callback's invokation.
	 * @param eventName Name of the event to bind
	 * @param callback Callback to call when the event fires
	 */
	once<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void>;

	/**
	 * Returns a promise that resolves once a given event has been emitted.
	 * The value of the promise is the event argument passed into [[emit]].
	 * Useful to await events emitting.
	 * @param eventName Name of the event to bind
	 * @example
	 *     const eventValue = await myEventEmitter.emitted('someEvent');
	 */
	emitted<TEventName extends keyof THandlerMap>(eventName: TEventName): Promise<THandlerMap[TEventName]>;

	/**
	 * Remove one or many callback for an event.
	 * @param eventName Name of the event to unbind. If null remove all events.
	 * @param callback Callback to remove for the event.
	 */
	off<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback?: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void>;

	/**
	 * Emit the event, firing all bound callback.
	 * @param eventName Name of the event to emitted.
	 * @param arg The argument to pass to the handler functions.
	 */
	emit<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		arg: THandlerMap[TEventName]
	): Promise<void>;
}

export default IEventEmitter;
