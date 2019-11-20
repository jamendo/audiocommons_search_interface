/**
 * Describes a constructor of a specific type.
 * @param T The type constructed by this object.
 * @param T1 **Internal, do not use.**
 */
interface IInternalConstructor<T, T1 = T> {
	// We use type parameter T1 only in the second overload of `new`.
	// This way, we can have a method overload with only different parameters,
	// which would raise a compile time error if the overload return types are
	// nominally identical.
	new(): T;
	new(...args: any[]): T1;

	name?: string;
}

/**
 * Describes a constructor of a specific type.
 * @param T The type constructed by this object.
 */
export type IConstructor<T> = IInternalConstructor<T>;
