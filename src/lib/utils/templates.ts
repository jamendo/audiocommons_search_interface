/**
 * Prints a JS object to an HTML template avoiding problems with quotes (both " and ').
 */
export function printJsToHtml(obj: any, quotesToUse: '\'' | '"' = '\''): string {
	const json = JSON.stringify(obj);
	return `JSON.parse(decodeURIComponent(${quotesToUse}${encodeURIComponent(json)}${quotesToUse}))`;
}
