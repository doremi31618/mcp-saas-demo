export function safeRedirectPath(value: string | null | undefined, fallback = '/notes'): string {
	if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
		return fallback;
	}

	return value;
}
