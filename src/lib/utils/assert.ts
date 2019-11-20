/**
 * An exception that is thrown if an assertion fails.
 */
export class AssertionException extends Error { }


/**
 * Asserts a condition. Throws an `AssertionException` if `condition` is not `true`.
 * @param condition The condition to assert.
 * @param message Optional message parts to be included in the `AssertionException`'s message if the assertion fails.
 * @throws AssertionException
 */
export function assert(condition: boolean, ...message: any[]) {
	if (condition) {
		return;
	}
	throw new AssertionException(`Assertion failed. ${message.join(' ')}`);
}


/**
 * Asserts whether a function throws anything except `undefined` or `null` when it is called.
 * @param fn The function to call. This must throw anything except `undefined` or `null` for the assertion to pass.
 * @param message Optional message parts to be included in the `AssertionException`'s message if `fn` does not throw.
 * @throws AssertionException
 */
// tslint:disable-next-line:ban-types
export function assertThrows(fn: Function, ...message: any[]) {
	let caughtException: any;
	try {
		fn();
	} catch (err) {
		caughtException = err;
	}
	assert(
		typeof caughtException !== 'undefined' && caughtException !== null,
		'Expected function to throw but it didn\'t.', ...message
	);
}
