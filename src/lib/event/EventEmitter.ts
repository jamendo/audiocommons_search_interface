import { IEventEmitter, IBaseEventHandlerMap } from 'lib/event/IEventEmitter';

export class EventEmitter<THandlerMap extends IBaseEventHandlerMap>
implements IEventEmitter<THandlerMap> {
	public dispose() {
		for (const eventName in this.handlers) {
			if (!Array.isArray(this.handlers[eventName]) || this.handlers[eventName].length === 0) {
				return;
			}

			while (this.handlers[eventName].length > 0) {
				this.off(<keyof THandlerMap>eventName, this.handlers[eventName][0]);
			}

			this.handlers[eventName] = undefined!;
		}
	}

	private readonly handlers: {
		[eventName in keyof THandlerMap]: Array<(arg: any) => void | Promise<void>>;
	} = <any>{ };

	/**
	 * Validate that a handler function matches the type of a certain event.
	 * This method is only useful for static analysis. It is used to implicitly add
	 * type information to a function without having to write out the function type
	 * yourself manually (which can be very tedious for event handler functions).
	 * See the example provided in this method's doc comment for more insight.
	 * @final
	 * @param eventName The event to bind the handler function to.
	 * @param callback The actual handler function.
	 * @example
	 *     class SomeEvent extends NonIntrospectiveEventEmitter<{
	 *         foo: number;
	 *         stuff: {
	 *             some: number;
	 *             another: number;
	 *             fibo: 1 | 2 | 3 | 5 | 8 | 13;
	 *         };
	 *     }> { }
	 *
	 *     const myEvent = new SomeEvent();
	 *
	 *     // The next line will cause a compile-time error because the
	 *     // provided handler function's argument is a string, but we
	 *     // defined the `foo` event with a `number`.
	 *     const handler1 = myEvent.prepareHandler('foo', (input: string) => log(input + 1));
	 *
	 *     // The next line will work though.
	 *     const handler2 = myEvent.prepareHandler('foo', input => log(input + 1));
	 *
	 *     // We can now use the handler function again and again.
	 *     myEvent.on('foo', handler2);
	 *     myEvent.off('foo', handler2);
	 *
	 *     // If you had written the handler type yourself, you would have
	 *     // had to write it like this:
	 *     const handler3: (input: number) => void = input => log(input + 1);
	 *
	 *     // With simple event parameters, like for the `foo` event, that's
	 *     // not really an issue. With more complex ones though, it quickly
	 *     // becomes a problem:
	 *     const handler4: ({
	 *         some: number;
	 *         another: number;
	 *         fibo: 1 | 2 | 3 | 5 | 8 | 13;
	 *     }) => void = stuff => log(stuff.fibo);
	 *
	 *     // So instead, you can use the `prepareHandler` method like this:
	 *     const handler5 = myEvent.prepareHandler('stuff', stuff => log(stuff.fibo));
	 */
	public prepareHandler<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback: (arg: THandlerMap[TEventName]) => void | Promise<void>
	) {
		return callback;
	}

	/**
	 * Bind an event to a callback function.
	 * @param eventName Name of the event to bind
	 * @param callback Callback to call when the event fires
	 */
	public async on<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void> {
		this.handlers[eventName] = this.handlers[eventName] || [];
		this.handlers[eventName].push(callback);
	}

	/**
	 * Bind an event to be emitted only a single time. The callback will be remove after the first callback's invokation.
	 * @param eventName Name of the event to bind
	 * @param callback Callback to call when the event fires
	 */
	public async once<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void> {
		const event = this;

		const actualHandler = async function(this: any, ...args: any[]): Promise<void> {
			await event.off(eventName, actualHandler);
			callback.apply(this, args);
		};

		await this.on(eventName, actualHandler);
	}


	/**
	 * Returns a promise that resolves once a given event has been emitted.
	 * The value of the promise is the event argument passed into [[emit]].
	 * @param eventName Name of the event to bind
	 * @example
	 *     const eventValue = await myEventEmitter.emitted('someEvent');
	 */
	public emitted<TEventName extends keyof THandlerMap>(eventName: TEventName) {
		return new Promise<THandlerMap[TEventName]>(resolve => this.once(eventName, resolve));
	}

	/**
	 * Remove one or many callback for an event.
	 * @param eventName Name of the event to unbind. If null remove all events.
	 * @param callback Callback to remove for the event.
	 */
	public async off<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		callback?: (arg: THandlerMap[TEventName]) => void | Promise<void>
	): Promise<void> {
		if (!Array.isArray(this.handlers[eventName])) {
			return;
		}

		if (typeof callback !== 'function') {
			throw new Error(`illegal argument 'callback': must be a function, is typeof ${typeof callback}`);
		}

		const index = this.handlers[eventName].indexOf(callback);

		if (index === -1) {
			return;
		}

		this.handlers[eventName].splice(index, 1);
	}

	/**
	 * Emit and event, firing all bound callbacks.
	 * @param eventName Name of the event to emitted
	 * @param arg The argument to pass to the handler functions.
	 */
	public async emit<TEventName extends keyof THandlerMap>(
		eventName: TEventName,
		arg: THandlerMap[TEventName]
	): Promise<void> {
		if (!this.handlers[eventName]) {
			return;
		}

		// Make a copy of the event handler array so we can loop over it safely.
		// This is necessary because the event handlers can unbind themselves during
		// the loop, which influences the loop iterator. This can lead to event
		// handlers being skipped by the loop.
		const handlers = [...this.handlers[eventName]];

		for (const handler of handlers) {
			await handler.call(null, arg);
		}
	}


	/**
	 * Returns the current number of handlers bound to this emitter for a certain event.
	 */
	protected getEventHandlerCount<TEventName extends keyof THandlerMap>(eventName: TEventName): number {
		if (!Array.isArray(this.handlers[eventName])) {
			return 0;
		}
		return this.handlers[eventName].length;
	}
}

export default EventEmitter;
