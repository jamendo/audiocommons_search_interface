/**
 * Flattens a 2-dimensional or 3-dimensional array into a 1-dimensional array. The order of items
 * is preserved. The input array is *not* modified.
 * @see original source: https://bit.ly/2NZpax7
 * @param arrays The array to flatten. For 2-dimensional inputs, call the function normally. For
 *               3-dimensional inputs, call the function using the spread operator.
 * @example
 *     flattenArray([[1, 2], [3]]); // [1, 2, 3]
 *     flattenArray(...[[[1, 2]], [[3]]]); // [1, 2, 3]
 */
export function flattenArray<T>(...arrays: T[][][]): T[] {
	const twoDimensional = arrays.map(array => [].concat.apply([], array));
	return [].concat.apply([], twoDimensional);
}

/**
 * Deduplicates an array. Returns a new array, the input array is not modified.
 * @see original source: https://bit.ly/2JBXATf
 * @param array The array to deduplicate.
 * @param comparisonFunc A function used to compare items in the array.
 */
export function deduplicateArray<T>(array: ReadonlyArray<T>): T[] {
	return Array.from(new Set(array));
}
