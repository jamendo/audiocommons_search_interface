export class LruRamCache<K, V> {
	public constructor(
		public readonly maxSize: number,
		public readonly extendTimeToLiveOnGet = true
	) { }

	/**
	 * All items in the cache.
	 * Items at the start of the array are younger.
	 * Items at the end of the array are next in line to be popped.
	 */
	private readonly items: Array<[K, V]> = [];

	public get length(): number {
		return this.items.length;
	}

	private getItemByKey(key: K): [K, V] | void {
		return this.items.find(item => item[0] === key);
	}

	public get(key: K): V | undefined {
		const item = this.getItemByKey(key);
		if (!item) {
			return undefined;
		}

		const [, value] = item;

		// move the item to the top of the LRU cache
		if (this.extendTimeToLiveOnGet) {
			this.set(key, value);
		}

		return value;
	}

	public set(key: K, value: V): void {
		const item = this.getItemByKey(key) || [key, value];
		const index = this.items.indexOf(item);

		// Item is not new, it's just being updated.
		if (index !== -1) {
			this.items.splice(index, 1);
		}
		// Item is new.
		// If necessary, remove an item to make room for the new one.
		else if (this.items.length === this.maxSize) {
			this.items.splice(-1, 1);
		}

		this.items.unshift(item);
	}

	public remove(key: K): void {
		const itemIndex = this.items.findIndex(item => item[0] === key);

		if (itemIndex === -1) {
			return;
		}

		this.items.splice(itemIndex, 1);
	}

	public has(key: K): boolean {
		return this.items.findIndex(item => item[0] === key) !== -1;
	}
}
