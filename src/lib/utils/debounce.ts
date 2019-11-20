import { fsleep } from 'lib/utils/sleep';

type IDebouncedMethod = (...args: any[]) => any;

interface IDecoratedDebouncedMethod {
	(...args: any[]): Promise<any>;
	debounceCalled: boolean;
	debouncePromise?: Promise<void>;
}

/**
 * Debounces calls against a method.
 * @param time The timespan (in milliseconds) in which calls should be debounced.
 * @param mode Whether or not the accepted method call should be made as soon as it comes in (leading)
 *             or when the debounce timespan ends (trailing).
 */
export function debounce(
	time: number,
	mode: 'leading' | 'trailing'
) {
	return (
		target: any,
		methodName: string,
		descriptor: TypedPropertyDescriptor<IDebouncedMethod>
	) => {
		const originalMethod = <IDecoratedDebouncedMethod>descriptor.value;

		if (mode === 'trailing') {
			descriptor.value = function _trailingDebounce(this: typeof target, ...args: any[]): Promise<void> {
				// actually debounce
				if (originalMethod.debounceCalled === true) {
					return originalMethod.debouncePromise!;
				}

				originalMethod.debounceCalled = true;

				originalMethod.debouncePromise = new Promise<void>(async resolve => {
					await fsleep(time);

					await originalMethod.apply(this, args);

					originalMethod.debounceCalled = false;
					originalMethod.debouncePromise = undefined;

					resolve();
				});

				return originalMethod.debouncePromise;
			};
		} else {
			descriptor.value = function _leadingDebounce(this: typeof target, ...args: any[]): Promise<void> {
				// actually debounce
				if (originalMethod.debounceCalled === true) {
					return undefined!;
				}

				originalMethod.debounceCalled = true;

				// clear the timeout after the given time
				setTimeout(() => {
					originalMethod.debounceCalled = false;
				}, time);

				return originalMethod.apply(this, args);
			};
		}
	};
}
