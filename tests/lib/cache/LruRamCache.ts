import { test, suite, timeout } from 'mocha-typescript';
import { assert } from 'lib/utils/assert';
import { LruRamCache } from 'lib/cache/LruRamCache';

@suite class LruRamCacheTestSuite {
	@test async 'cache max size'() {
		const cache = new LruRamCache(10);
		assert(cache.maxSize === 10);
	}

	@test async 'cache length with add'() {
		for (let maxSize = 1; maxSize < 10; maxSize++) {
			const cache = new LruRamCache<number, number>(maxSize);
			assert(cache.length === 0);

			for (let i = 1; i < maxSize; i++) {
				cache.set(i, i);
				assert(cache.length === i, `cache length after adding ${i} items`);
			}
		}
	}

	@test async 'cache length with remove'() {
		for (let maxSize = 1; maxSize <= 10; maxSize++) {
			const cache = new LruRamCache<number, number>(maxSize);
			assert(cache.length === 0);

			for (let i = 1; i <= maxSize; i++) {
				cache.set(i, i);
				assert(cache.length === i, `cache length after adding ${i} items`);
			}

			for (let o = 1; o <= maxSize; o++) {
				cache.remove(o);
				assert(
					cache.length === maxSize - o,
					`cache length after removing ${o} items from cache with max size ${maxSize - o}: ` +
					`expected ${maxSize - o}, got ${cache.length}`
				);
			}
		}
	}

	@test async 'cache has'() {
		const cache = new LruRamCache<any, number>(10);
		assert(!cache.has(1), 'cache has nothing after creation');

		cache.set(1, Math.random());
		assert(cache.has(1), 'cache has item #1');

		const obj = { random: Math.random() };
		cache.set(obj, Math.random());
		assert(cache.has(obj), 'cache has item #2');

		cache.set(obj, Math.random());
		assert(cache.has(obj), 'cache still has item #2 after update');

		cache.remove(obj);
		assert(!cache.has(obj), 'cache doesn\'t have item #2 anymore');
	}

	@test async 'cache overflow (set only)'() {
		const maxSize = 10;
		const cache = new LruRamCache<any, number>(maxSize);

		for (let i = 1; i <= maxSize; i++) {
			cache.set(i, i);
			assert(cache.has(i), `cache has item #${i}`);
			assert(cache.length === i, `cache length is ${i} after adding item #${i}`);
		}

		cache.set(maxSize + 1, maxSize + 1);
		assert(cache.has(maxSize + 1), `cache has extra item`);
		assert(cache.length === maxSize, `cache length is ${maxSize} after adding extra item: got ${cache.length}`);
		assert(!cache.has(1), `cache doesn't have 1st item anymore`);
	}

	@test async 'cache overflow (get)'() {
		const maxSize = 5;
		const cache = new LruRamCache<any, number>(maxSize);

		for (let i = 1; i <= maxSize; i++) {
			cache.set(i, i);
			assert(cache.has(i), `cache has item #${i}`);
			assert(cache.length === i, `cache length is ${i} after adding item #${i}`);
		}

		// move the first item to the top of the LRU stack
		cache.get(1);

		// add an extra item
		cache.set(maxSize + 1, maxSize + 1);
		assert(cache.has(maxSize + 1), `cache has extra item`);
		assert(cache.length === maxSize, `cache length is ${maxSize} after adding extra item: got ${cache.length}`);

		// we expect the second item to have been removed cause it's the least recently used:
		assert(!cache.has(2), `cache doesn't have 2nd item anymore`);
	}
}
