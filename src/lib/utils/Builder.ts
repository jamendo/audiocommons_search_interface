export interface IBuilderMethodMetaData {
	maxCalls?: number;
	/** @internal */
	__callCount__?: number;
}


export class Builder {
	private static readonly methodMetaDataMap: {
		[metaDataId: number]: IBuilderMethodMetaData;
	} = {};

	private static metaDataIdCounter = 0;

	protected static builderMethod(metaData: IBuilderMethodMetaData) {
		return (target: Builder, methodName: string, descriptor: PropertyDescriptor) => {
			const methodMetaDataId = Builder.metaDataIdCounter++;
			Builder.methodMetaDataMap[methodMetaDataId] = metaData;

			const originalMethod = descriptor.value;
			// metaData.__callCount__ = 0;

			// Overwrite the method:
			descriptor.value = function(this: Builder, ...args: any[]) {
				if (++metaData.__callCount__! > (metaData.maxCalls || Infinity)) {
					throw new Error(
						`Builder method '${methodName}' called too often: ` +
						`Max calls was ${metaData.maxCalls} but ${metaData.__callCount__} calls were made.`
					);
				}

				return originalMethod.apply(this, args);
			};
		};
	}
}
