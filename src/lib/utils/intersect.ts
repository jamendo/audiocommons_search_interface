export function intersect2<T>(a1: T[], a2: T[]): T[] {
	return a1.filter(value => -1 !== a2.indexOf(value));
}

export function intersect<T>(...arrays: T[][]): T[] {
	switch (arrays.length) {
		case 0:
			return [];
		case 1:
			return arrays[0];
		case 2:
			return intersect2(arrays[0], arrays[1]);
	}

	const a1 = arrays.pop()!;
	const a2 = arrays.pop()!;

	let result = intersect2(a1, a2);

	for (const array of arrays) {
		result = intersect2(result, array);
	}

	return result;
}
