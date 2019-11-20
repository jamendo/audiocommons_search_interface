export function createSimpleUuid(): string {
	return [
		Math.random(),
		Math.random(),
		Math.random(),
		Math.random()
	].map(part => Math.round(part * 1e9))
	.map(part => part.toString(36))
	.join('-');
}
