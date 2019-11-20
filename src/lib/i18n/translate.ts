import translations from 'app/data/translations';

export function translate(key: string, fallback?: string): string {
	try {
		const parts = key.split('.');
		let node = translations;

		for (const part of parts) {
			node = (node as any)[part];
		}

		return <string><any>node || fallback || '';
	} catch (err) {
		if (fallback) {
			return fallback;
		} else {
			throw err;
		}
	}
}
