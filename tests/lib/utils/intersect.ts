import { test, suite } from 'mocha-typescript';
import { assert } from 'lib/utils/assert';
import { intersect, intersect2 } from 'lib/utils/intersect';

function assertArraysEqual<T>(a1: T[], a2: T[], message?: string): void | never {
	assert(
		JSON.stringify(a1.sort()) === JSON.stringify(a2.sort()),
		(message || '') + ` (expected ${JSON.stringify(a2.sort())}, got ${JSON.stringify(a1.sort())})`
	);
}


@suite class UtilsIntersect {
	@test async 'intersect2 #1'() {
		assertArraysEqual(
			intersect2([1, 2, 3], [4, 5, 6]),
			[],
			'empty result'
		);

		assertArraysEqual(
			intersect2([1, 2, 3], [1, 2, 3]),
			[1, 2, 3],
			'full match'
		);

		assertArraysEqual(
			intersect2([1, 2, 3], [2, 3, 4]),
			[2, 3],
			'partial match #1'
		);
	}

	@test async 'intersect #1'() {
		assertArraysEqual(
			intersect([1, 2, 3], [4, 5, 6], [7, 8, 9, 10]),
			[],
			'no match #1'
		);

		assertArraysEqual(
			intersect([1, 2, 3], [1, 2, 3], []),
			[],
			'no match #2'
		);

		assertArraysEqual(
			intersect([1, 2, 3], [1, 2, 3], [1, 2, 3]),
			[1, 2, 3],
			'full match'
		);

		assertArraysEqual(
			intersect([1, 2, 3], [2, 3, 4], [2, 3, 4]),
			[2, 3],
			'partial match #1'
		);

		assertArraysEqual(
			intersect([1, 2, 3], [2, 3, 4], [2, 3], [5, 4, 3, 2, 1, 0]),
			[2, 3],
			'partial match #2'
		);
	}
}
