/**
 * "Fiber sleep" with an awaitable timeout.
 * @param time The number of milliseconds.
 * @example
 *     async function doStuff() {
 *         doSomething();
 *         await fsleep(500); // wait half a second
 *         doMoreStuff();
 *     }
 */
export function fsleep(time: number): Promise<void> {
	return new Promise<void>(resolve => {
		setTimeout(resolve, time);
	});
}
